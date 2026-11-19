import random, sys
from pathlib import Path
from PIL import Image, ImageOps

random.seed(42)
SRC = Path("ml/raw/six-species/originals-v2")
OUT = Path("ml/dataset_real")
CAP, VAL_FRAC, SIZE = 250, 0.2, 224
EXT = {".jpg", ".jpeg", ".png"}
DRY = "--build" not in sys.argv

SLUGS = {"arjun": "arjun", "curry": "curry-leaf", "pennywort": "marsh-pennywort",
         "mint": "mint", "neem": "neem", "rubble": "kalanchoe", "kalanchoe": "kalanchoe"}

def slug(name):
    n = name.lower()
    for key, s in SLUGS.items():
        if key in n:
            return s
    return n.strip().replace(" ", "-")

classes = {}
for d in sorted(p for p in SRC.rglob("*") if p.is_dir()):
    if "augment" in str(d).lower() or "__macosx" in str(d).lower():
        continue
    imgs = [f for f in d.iterdir() if f.suffix.lower() in EXT and not f.name.startswith(".")]
    if imgs:
        classes.setdefault(slug(d.name), []).extend(imgs)

for s, imgs in classes.items():
    print(f"{len(imgs):5d}  {s}")

if DRY:
    print("\nDry run only. Re-run with --build to write the dataset.")
    sys.exit()

for s, imgs in classes.items():
    random.shuffle(imgs)
    imgs = imgs[:CAP]
    n_val = max(5, int(len(imgs) * VAL_FRAC))
    for split, items in {"val": imgs[:n_val], "train": imgs[n_val:]}.items():
        out = OUT / split / s
        out.mkdir(parents=True, exist_ok=True)
        for i, f in enumerate(items):
            im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
            ImageOps.fit(im, (SIZE, SIZE)).save(out / f"{i:04d}.jpg", quality=90)
    print("done", s)
