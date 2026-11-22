"""Potong logo rank dari atlas PNG yang dilampirkan user.

Atlas: new_mlbb_rank_icons_4k_png_free_download_by_newjer53_dgmwrrk.png
Hasil:
  rank-1.png  ... rank-9.png  -> 9 ikon perisai besar (baris 1 lalu baris 2)
  rank-10.png -> file assets/source/mythical-immortal.png yang diupload user
                 (background gelap dibuat transparan)
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(
    r"C:\Users\Administrator\Downloads\new_mlbb_rank_icons_4k_png_free_download_by_newjer53_dgmwrrk.png"
)
IMMORTAL_SOURCE = ROOT / "assets" / "source" / "mythical-immortal.png"
OUTPUT = ROOT / "assets" / "mlbb"

# 9 ikon perisai: urutan Warrior -> Mythical Glory sesuai konfirmasi user.
BOXES = [
    (53, 138, 802, 953),
    (941, 176, 1666, 963),
    (1798, 173, 2594, 1088),
    (2732, 154, 3546, 1102),
    (3653, 152, 4496, 1194),
    (27, 1358, 897, 2339),
    (1020, 1382, 1891, 2364),
    (2316, 1345, 3187, 2388),
    (3820, 1381, 4693, 2424),
]

SIZE = 320
PAD_RATIO = 0.04
BACKGROUND = np.array([6, 7, 13], dtype=np.int16)


def normalize(image: Image.Image, dest: Path) -> None:
    """Trim alpha, pad ke kotak, lalu resize ke SIZE x SIZE."""
    bbox = image.getchannel("A").point(lambda value: 255 if value > 18 else 0).getbbox()
    if bbox:
        image = image.crop(bbox)

    width, height = image.size
    side = max(width, height)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(image, ((side - width) // 2, (side - height) // 2))

    pad = int(side * PAD_RATIO)
    final = Image.new("RGBA", (side + 2 * pad, side + 2 * pad), (0, 0, 0, 0))
    final.paste(canvas, (pad, pad))
    final = final.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    final.save(dest, optimize=True)


def from_atlas(image: Image.Image, box: tuple[int, int, int, int], dest: Path) -> None:
    crop = image.crop(box).convert("RGBA")
    alpha = crop.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 24 else 0).getbbox()
    if bbox:
        crop = crop.crop(bbox)
    normalize(crop, dest)


def from_uploaded(path: Path, dest: Path) -> None:
    pixels = np.array(Image.open(path).convert("RGB")).astype(np.int16)
    distance = np.linalg.norm(pixels - BACKGROUND, axis=2)
    alpha = np.clip((distance - 8) / 20 * 255, 0, 255).astype(np.uint8)
    rgba = np.dstack([pixels.astype(np.uint8), alpha])
    normalize(Image.fromarray(rgba, "RGBA"), dest)


def main() -> None:
    atlas = Image.open(SOURCE)
    for index, box in enumerate(BOXES, 1):
        from_atlas(atlas, box, OUTPUT / f"rank-{index}.png")
        print(f"rank-{index}.png <- atlas {box}")

    from_uploaded(IMMORTAL_SOURCE, OUTPUT / "rank-10.png")
    print(f"rank-10.png <- {IMMORTAL_SOURCE}")
    print(f"Saved {len(BOXES) + 1} logos to {OUTPUT}")


if __name__ == "__main__":
    main()
