#!/usr/bin/env python3
"""Build the site's responsive images from the original photos in ../../media.

For every job: crop, apply the brand grade (warm monochrome), strip ALL metadata
(EXIF/GPS is never copied), and export AVIF + WebP at several widths.

Usage:  python3 site/tools/build_images.py
Needs:  Pillow >= 11 with AVIF support  (pip install "pillow>=11")
"""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "media"
OUT = ROOT / "site" / "public" / "assets" / "img"

# Crop boxes are in source pixels (left, top, right, bottom). The before/after
# boxes are matched on head size and head-top position, so the comparison is fair.
JOBS = [
    {"name": "hero", "src": "stiven-2.PNG", "crop": (0, 0, 1206, 1508), "grade": "mono", "widths": [480, 800, 960, 1206]},
    {"name": "about", "src": "hero.PNG", "crop": (0, 6, 689, 867), "grade": "mono", "widths": [480, 689]},
    {"name": "in-person", "src": "hero-2.PNG", "crop": None, "grade": "mono", "widths": [480, 657]},
    {"name": "online", "src": "stiven-3.jpg", "crop": None, "grade": "mono", "widths": [480, 800, 1200], "flip": True},
    {"name": "before", "src": "before-stiven-back.jpg", "crop": (361, 0, 3513, 1970), "grade": "mono", "widths": [600, 900, 1123]},
    {"name": "after", "src": "after-stiven-back.jpg", "crop": (30, 37, 1153, 739), "grade": "mono", "widths": [600, 900, 1123]},
    # Stock background: cropped to plate + floor (no athlete visible), mirrored so the plate sits behind empty space.
    {"name": "barbell", "src": "hero.jpg", "crop": (0, 1100, 1750, 3289), "grade": "mono-dark", "widths": [960, 1400, 1750], "flip": True},
    {"name": "certificate", "src": "certificate.PNG", "crop": None, "grade": None, "widths": [420, 634]},
    {"name": "avatar", "src": "hero.PNG", "crop": (249, 28, 429, 208), "grade": "mono", "widths": [112, 168]},
]

AVIF_QUALITY = 58
WEBP_QUALITY = 78


def s_curve(value: int, strength: float = 0.10) -> int:
    """Gentle S-curve: deepens shadows and lifts highlights around mid grey."""
    t = value / 255.0
    y = t - strength * 0.5 * math.sin(2 * math.pi * t)
    return max(0, min(255, round(y * 255)))


def grade(im: Image.Image, kind: str | None) -> Image.Image:
    if kind is None:
        return im.convert("RGB")
    g = ImageOps.grayscale(im)
    g = ImageOps.autocontrast(g, cutoff=(0.8, 0.25))
    g = g.point([s_curve(i) for i in range(256)])
    if kind == "mono":
        # Warm monochrome: ink shadows, warm stone mids, bone highlights.
        return ImageOps.colorize(g, black=(12, 10, 9), mid=(120, 112, 104), white=(238, 232, 223), midpoint=118)
    if kind == "mono-dark":
        # Background plate: compressed range so text on top stays readable.
        return ImageOps.colorize(g, black=(6, 5, 5), mid=(70, 64, 59), white=(168, 160, 152), midpoint=110)
    raise ValueError(kind)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for job in JOBS:
        im = ImageOps.exif_transpose(Image.open(SRC / job["src"]))
        if im.mode in ("RGBA", "LA", "P"):
            im = im.convert("RGB")
        if job["crop"]:
            im = im.crop(job["crop"])
        if job.get("flip"):
            # Mirror selfie: flip back so the shirt text reads correctly.
            im = ImageOps.mirror(im)
        im = grade(im, job["grade"])
        for w in job["widths"]:
            w = min(w, im.width)
            h = round(im.height * w / im.width)
            resized = im.resize((w, h), Image.LANCZOS)
            # Pixels are graded sRGB now: drop any camera colour profile (e.g. iPhone Display P3).
            resized.info.pop("icc_profile", None)
            for ext, kwargs in (("avif", {"quality": AVIF_QUALITY}), ("webp", {"quality": WEBP_QUALITY, "method": 6})):
                path = OUT / f"{job['name']}-{w}.{ext}"
                # No exif= argument: Pillow writes no metadata, so GPS data never ships.
                resized.save(path, **kwargs)
                total += path.stat().st_size
            print(f"{job['name']:12} {w:>5}x{h:<5}")
    print(f"total written: {total / 1024:.0f} KiB -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
