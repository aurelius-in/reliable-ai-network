"""Make partner logos transparent via edge flood-fill; trim IMS white slogan; scale IMS 2x."""
from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

PARTNERS = Path(r"c:\local\reliable-ai-network\monetize\public\partners")
BRAND = Path(r"c:\local\reliable-ai-network\monetize\public\brand")
MARKETING = Path(r"C:\local\RAIN\marketing\content")


def flood_transparent(im: Image.Image, threshold: int = 28) -> Image.Image:
    """Make near-black pixels reachable from image edges transparent."""
    arr = np.array(im.convert("RGBA"))
    h, w = arr.shape[:2]
    rgb = arr[:, :, :3].astype(np.int16)
    brightness = rgb.max(axis=2)
    is_bg = brightness <= threshold

    visited = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    def try_push(y: int, x: int) -> None:
        if 0 <= y < h and 0 <= x < w and not visited[y, x] and is_bg[y, x]:
            visited[y, x] = True
            q.append((y, x))

    for x in range(w):
        try_push(0, x)
        try_push(h - 1, x)
    for y in range(h):
        try_push(y, 0)
        try_push(y, w - 1)

    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            try_push(ny, nx)

    # Soft edge: fade neighbors near the flood mask
    soft = visited.copy()
    # Dilate once for softer fringe
    from scipy import ndimage  # may not exist

    try:
        soft = ndimage.binary_dilation(visited, iterations=1)
    except Exception:
        soft = visited

    alpha = arr[:, :, 3].astype(np.float32)
    alpha[visited] = 0
    # light feather on soft-only ring
    ring = soft & ~visited
    alpha[ring] = np.minimum(alpha[ring], 90)
    arr[:, :, 3] = alpha.astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def flood_transparent_simple(im: Image.Image, threshold: int = 28) -> Image.Image:
    """Edge flood-fill without scipy."""
    arr = np.array(im.convert("RGBA"))
    h, w = arr.shape[:2]
    brightness = arr[:, :, :3].max(axis=2)
    is_bg = brightness <= threshold
    visited = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    def try_push(y: int, x: int) -> None:
        if 0 <= y < h and 0 <= x < w and not visited[y, x] and is_bg[y, x]:
            visited[y, x] = True
            q.append((y, x))

    for x in range(w):
        try_push(0, x)
        try_push(h - 1, x)
    for y in range(h):
        try_push(y, 0)
        try_push(y, w - 1)

    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            try_push(ny, nx)

    # Feather: any non-visited near-black next to visited gets reduced alpha
    alpha = arr[:, :, 3].astype(np.float32)
    alpha[visited] = 0
    # one-pixel soft edge
    ys, xs = np.where(visited)
    for y, x in zip(ys, xs):
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                if brightness[ny, nx] <= threshold + 40:
                    alpha[ny, nx] = min(alpha[ny, nx], 110)
    arr[:, :, 3] = alpha.astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def crop_content(im: Image.Image, pad: int = 8) -> Image.Image:
    arr = np.array(im)
    ys, xs = np.where(arr[:, :, 3] > 20)
    if len(xs) == 0:
        return im
    left = max(0, int(xs.min()) - pad)
    right = min(im.width, int(xs.max()) + pad + 1)
    top = max(0, int(ys.min()) - pad)
    bottom = min(im.height, int(ys.max()) + pad + 1)
    return im.crop((left, top, right, bottom))


def trim_ims_white_slogan(im: Image.Image) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    h, w = arr.shape[:2]
    last_yellow = None
    for y in range(h - 1, -1, -1):
        row = arr[y]
        bright = row[:, :3].max(axis=1) > 40
        if not bright.any():
            continue
        px = row[bright]
        is_yellow = (px[:, 0] > 160) & (px[:, 1] > 120) & (px[:, 2] < 130)
        if is_yellow.mean() > 0.12:
            last_yellow = y
            break
    if last_yellow is None:
        return im
    cut_y = min(h, last_yellow + 14)
    print(f"  IMS crop below yellow at y={cut_y} (was {h})")
    return im.crop((0, 0, w, cut_y))


def process_ims(src: Path, dst: Path) -> None:
    im = Image.open(src).convert("RGBA")
    print("IMS in", im.size)
    im = trim_ims_white_slogan(im)
    im = flood_transparent_simple(im, threshold=26)
    im = crop_content(im, pad=12)
    im = im.resize((im.width * 2, im.height * 2), Image.Resampling.LANCZOS)
    im.save(dst)
    a = np.array(im)[:, :, 3]
    print("IMS out", im.size, "transparent px", int((a == 0).sum()), "->", dst)


def process_simple(src: Path, dst: Path, threshold: int = 26) -> None:
    im = Image.open(src).convert("RGBA")
    print(src.name, "in", im.size)
    im = flood_transparent_simple(im, threshold=threshold)
    im = crop_content(im, pad=8)
    im.save(dst)
    a = np.array(im)[:, :, 3]
    print(src.name, "out", im.size, "transparent px", int((a == 0).sum()), "->", dst)


def main() -> None:
    process_ims(PARTNERS / "ims-logo-original.png", PARTNERS / "ims-logo.png")
    process_simple(PARTNERS / "rain-logo-original.png", PARTNERS / "rain-logo.png", 24)
    process_simple(BRAND / "logo.png", PARTNERS / "make-it-rain-logo.png", 22)
    Image.open(PARTNERS / "ims-logo.png").save(MARKETING / "ims-logo.png")
    Image.open(PARTNERS / "rain-logo.png").save(MARKETING / "rain-logo.png")
    print("Synced marketing copies")


if __name__ == "__main__":
    main()
