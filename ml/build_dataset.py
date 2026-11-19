import math, random
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

random.seed(42)
np.random.seed(42)

SEG = Path("ml/raw/medicinal-leaf/Medicinal Leaf Dataset/Segmented Medicinal Leaf Images")
BG_DIR = Path("ml/backgrounds")
OUT = Path("ml/dataset")
SIZE, TARGET_TRAIN, VAL_FRAC = 224, 200, 0.2
IMG_EXT = {".jpg", ".jpeg", ".png"}

# slug (must match your DB) -> folder name in the dataset
CLASSES = {
    "tulsi": "Ocimum Tenuiflorum (Tulsi)",
    "neem": "Azadirachta Indica (Neem)",
    "curry-leaf": "Murraya Koenigii (Curry)",
    "mint": "Mentha (Mint)",
    "moringa": "Moringa Oleifera (Drumstick)",
    "hibiscus": "Hibiscus Rosa-sinensis",
    "peepal": "Ficus Religiosa (Peepal Tree)",
    "lemon": "Citrus Limon (Lemon)",
    "mango": "Mangifera Indica (Mango)",
    "jasmine": "Jasminum (Jasmine)",
    "guava": "Psidium Guajava (Guava)",
    "jamun": "Syzygium Cumini (Jamun)",
}


def leaf_mask(img):
    alpha = np.array(img.convert("RGBA"))[..., 3]
    if alpha.min() < 250:                      # real transparency: use it
        return Image.fromarray(alpha)
    work = img.convert("RGB")
    w, h = work.size
    marker = (255, 0, 255)
    for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        ImageDraw.floodfill(work, xy, marker, thresh=40)
    bg = (np.array(work) == marker).all(axis=2)
    if not 0.05 < bg.mean() < 0.97:            # fill failed: skip this image
        return None
    mask = Image.fromarray(((~bg) * 255).astype("uint8"))
    return mask.filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1))


def procedural_bg(s):
    c1, c2 = np.random.randint(20, 235, 3), np.random.randint(20, 235, 3)
    kind = random.choice(["gradient", "noise", "blobs"])
    if kind == "gradient":
        ramp = np.linspace(0, 1, s)[:, None, None]
        arr = np.broadcast_to(c1 * (1 - ramp) + c2 * ramp, (s, s, 3))
        if random.random() < 0.5:
            arr = arr.transpose(1, 0, 2)
    else:
        grid = 6 if kind == "blobs" else 24
        n = np.random.rand(grid, grid, 3)
        n = np.array(Image.fromarray((n * 255).astype("uint8")).resize((s, s), Image.BICUBIC)) / 255
        arr = c1 * n + c2 * (1 - n)
    return Image.fromarray(np.clip(arr, 0, 255).astype("uint8"))


def real_bg(files, s):
    im = Image.open(random.choice(files)).convert("RGB")
    w, h = im.size
    side = random.randint(min(w, h) // 3, min(w, h))
    x, y = random.randint(0, w - side), random.randint(0, h - side)
    return im.crop((x, y, x + side, y + side)).resize((s, s))


def compose(img, mask, bg_files):
    img = img.convert("RGB")
    if random.random() < 0.5:
        img, mask = ImageOps.mirror(img), ImageOps.mirror(mask)
    angle = random.uniform(-40, 40)
    img = img.rotate(angle, expand=True, resample=Image.BICUBIC)
    mask = mask.rotate(angle, expand=True, resample=Image.BICUBIC)
    bbox = mask.getbbox()
    if not bbox:
        return None
    img, mask = img.crop(bbox), mask.crop(bbox)
    scale = random.uniform(0.55, 0.95) * SIZE / max(img.size)
    new = (max(1, int(img.width * scale)), max(1, int(img.height * scale)))
    img, mask = img.resize(new), mask.resize(new)
    bg = real_bg(bg_files, SIZE) if bg_files and random.random() < 0.7 else procedural_bg(SIZE)
    bg.paste(img, (random.randint(0, SIZE - new[0]), random.randint(0, SIZE - new[1])), mask)
    return bg


bg_files = [f for f in BG_DIR.glob("*") if f.suffix.lower() in IMG_EXT] if BG_DIR.exists() else []
print(f"{len(bg_files)} real background photos found")

skipped = 0
for slug, folder in CLASSES.items():
    src = SEG / folder
    if not src.is_dir():
        raise SystemExit(f"Missing: {src}\nAvailable: {sorted(p.name for p in SEG.iterdir())}")
    files = sorted(f for f in src.iterdir() if f.suffix.lower() in IMG_EXT)
    random.shuffle(files)
    n_val = max(5, int(len(files) * VAL_FRAC))
    for split, items in {"val": files[:n_val], "train": files[n_val:]}.items():
        out = OUT / split / slug
        out.mkdir(parents=True, exist_ok=True)
        goal = TARGET_TRAIN if split == "train" else int(TARGET_TRAIN * VAL_FRAC)
        per, k = math.ceil(goal / len(items)), 0
        for f in items:
            img = Image.open(f)
            img.thumbnail((512, 512))
            mask = leaf_mask(img)
            if mask is None:
                skipped += 1
                continue
            for _ in range(per):
                res = compose(img, mask, bg_files)
                if res:
                    res.save(out / f"{k:04d}.jpg", quality=90)
                    k += 1
        print(f"{slug:12s} {split:5s} {k}")
print("skipped (bad cutout):", skipped)

samples = random.sample(list((OUT / "train").rglob("*.jpg")), 24)
sheet = Image.new("RGB", (6 * SIZE, 4 * SIZE))
for i, p in enumerate(samples):
    sheet.paste(Image.open(p), ((i % 6) * SIZE, (i // 6) * SIZE))
sheet.save("ml/preview.jpg")