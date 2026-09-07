"""Prepare RAIN umbrella-site brand assets (transparent logos, cropped photos)."""
from __future__ import annotations

import io
import os
import urllib.request
from pathlib import Path

from PIL import Image, ImageFilter, ImageStat

ROOT = Path(r"C:\local\reliable-ai-network")
RAIN_ASSETS = Path(r"C:\local\RAIN\assets")
OUT = ROOT / "assets"


def black_to_alpha(im: Image.Image, black_threshold: int = 16, softness: int = 36) -> Image.Image:
    """Turn near-black backgrounds into transparency, keeping neon glow."""
    rgba = im.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            m = max(r, g, b)
            if m <= black_threshold:
                pixels[x, y] = (r, g, b, 0)
            elif m < black_threshold + softness:
                alpha = int(255 * (m - black_threshold) / softness)
                pixels[x, y] = (r, g, b, min(a, alpha))
    return rgba


def white_to_alpha(im: Image.Image, white_threshold: int = 245, softness: int = 20) -> Image.Image:
    rgba = im.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            m = min(r, g, b)
            if m >= white_threshold:
                pixels[x, y] = (r, g, b, 0)
            elif m > white_threshold - softness:
                alpha = int(255 * (white_threshold - m) / softness)
                pixels[x, y] = (r, g, b, min(a, alpha))
    return rgba


def trim_transparent(im: Image.Image, pad: int = 8) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def save_png(im: Image.Image, dest: Path, max_w: int | None = None) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    out = im
    if max_w and out.width > max_w:
        h = int(out.height * (max_w / out.width))
        out = out.resize((max_w, h), Image.Resampling.LANCZOS)
    out.save(dest, "PNG", optimize=True)
    print(f"wrote {dest.relative_to(ROOT)} {out.size}")


def sample_corner(path: Path) -> tuple:
    im = Image.open(path).convert("RGB")
    return im.getpixel((8, im.height // 2)), im.size


def download(url: str, dest: Path, timeout: int = 25) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; RAIN-site-builder/1.0)",
            "Accept": "image/jpeg,image/png,image/webp,*/*",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read()
            if len(data) < 2000:
                print(f"skip tiny {url} ({len(data)} bytes)")
                return False
            im = Image.open(io.BytesIO(data))
            im = im.convert("RGB")
            if min(im.size) < 80:
                print(f"skip small {url} {im.size}")
                return False
            dest.write_bytes(data if dest.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"} else data)
            # Normalize to jpeg/png based on dest
            if dest.suffix.lower() in {".jpg", ".jpeg"}:
                im.save(dest, "JPEG", quality=90, optimize=True)
            else:
                im.save(dest, "PNG", optimize=True)
            print(f"downloaded {dest.relative_to(ROOT)} {im.size} from {url}")
            return True
    except Exception as exc:
        print(f"fail {url}: {exc}")
        return False


def crop_logo_without_slogan(im: Image.Image) -> Image.Image:
    """Keep the R lockup + RAIN + Reliable AI Network; drop the Make it RAIN slogan."""
    # Slogan sits in the bottom ~18% of the provided lockup.
    h = im.height
    return im.crop((0, 0, im.width, int(h * 0.78)))


def crop_r_mark(im: Image.Image) -> Image.Image:
    """Top portion: stylized R with raindrops."""
    w, h = im.size
    return im.crop((int(w * 0.12), int(h * 0.02), int(w * 0.88), int(h * 0.48)))


def crop_oliver_from_banner(im: Image.Image) -> Image.Image:
    """LinkedIn coaching banner: Oliver is on the left, chest-up."""
    w, h = im.size
    # Portrait is roughly the left 22-28% of the wide banner.
    left = int(w * 0.02)
    right = int(w * 0.28)
    top = int(h * 0.06)
    bottom = int(h * 0.78)
    crop = im.crop((left, top, right, bottom))
    return crop


def main() -> None:
    brand = OUT / "brand"
    products = OUT / "products" / "make-it-rain"
    select_dir = OUT / "products" / "rain-select"
    people = OUT / "people" / "oliver-ellison"
    books = OUT / "books"
    for p in (brand, products, select_dir, people, books):
        p.mkdir(parents=True, exist_ok=True)

    rain_logo = Image.open(RAIN_ASSETS / "rain-logo.png")
    print("rain-logo", rain_logo.size, rain_logo.mode)

    lockup = black_to_alpha(crop_logo_without_slogan(rain_logo))
    lockup = trim_transparent(lockup)
    save_png(lockup, brand / "rain-lockup.png", max_w=900)

    mark = black_to_alpha(crop_r_mark(rain_logo))
    mark = trim_transparent(mark)
    save_png(mark, brand / "rain-mark.png", max_w=320)

    # Existing circuit drop used on the live gallery: keep as alt mark.
    social = black_to_alpha(Image.open(ROOT / "rain-social.png"), black_threshold=12, softness=28)
    social = trim_transparent(social)
    save_png(social, brand / "rain-drop.png", max_w=256)

    black_sm = black_to_alpha(Image.open(ROOT / "rain-black-sm.png"), black_threshold=12, softness=28)
    black_sm = trim_transparent(black_sm)
    save_png(black_sm, brand / "rain-mark-sm.png", max_w=192)
    save_png(black_sm, ROOT / "favicon.png", max_w=64)

    banner = Image.open(RAIN_ASSETS / "rainbanner.png").convert("RGB")
    print("rainbanner corner", banner.getpixel((4, 4)), banner.size)
    # Slight edge crop in case of a 1px black frame, then web-size.
    bw, bh = banner.size
    banner_c = banner.crop((0, 0, bw, bh))
    banner_c.save(brand / "rain-banner.jpg", "JPEG", quality=88, optimize=True)
    print("wrote assets/brand/rain-banner.jpg", banner_c.size)

    select = black_to_alpha(Image.open(RAIN_ASSETS / "RAINSelectLogo.png"), black_threshold=14, softness=30)
    select = trim_transparent(select)
    save_png(select, select_dir / "rain-select-logo.png", max_w=640)

    mir = black_to_alpha(Image.open(ROOT / "monetize" / "public" / "partners" / "make-it-rain-logo.png"))
    mir = trim_transparent(mir)
    save_png(mir, products / "make-it-rain-logo.png", max_w=720)

    mir_sq = black_to_alpha(Image.open(RAIN_ASSETS / "make_it_rain_logo_square.png"))
    mir_sq = trim_transparent(mir_sq)
    save_png(mir_sq, products / "make-it-rain-mark.png", max_w=480)

    coach = Image.open(RAIN_ASSETS / "banner_linkedin.png").convert("RGB")
    print("banner_linkedin corner", coach.getpixel((4, 4)), coach.size)
    cw, ch = coach.size
    coach.resize((min(1600, cw), int(ch * min(1600, cw) / cw)), Image.Resampling.LANCZOS).save(
        products / "coaching-banner.jpg", "JPEG", quality=86, optimize=True
    )
    print("wrote assets/products/make-it-rain/coaching-banner.jpg")

    portrait = crop_oliver_from_banner(coach)
    portrait.save(people / "oliver-ellison.jpg", "JPEG", quality=90, optimize=True)
    print("wrote people portrait", portrait.size)

    # Book covers from Amazon / Open Library when available.
    cover_attempts = {
        "great-app-bad-business": [
            "https://images-na.ssl-images-amazon.com/images/P/9798171849252.01.LZZZZZZZ.jpg",
            "https://m.media-amazon.com/images/P/9798171849252.01._SCLZZZZZZZ_.jpg",
            "https://covers.openlibrary.org/b/isbn/9798171849252-L.jpg",
        ],
        "agentic-ai-week": [
            "https://images-na.ssl-images-amazon.com/images/P/B0FNMH156V.01.LZZZZZZZ.jpg",
            "https://m.media-amazon.com/images/P/B0FNMH156V.01._SCLZZZZZZZ_.jpg",
            "https://images-na.ssl-images-amazon.com/images/P/B0FNLHKCN7.01.LZZZZZZZ.jpg",
            "https://m.media-amazon.com/images/P/B0FNLHKCN7.01._SCLZZZZZZZ_.jpg",
            "https://media.licdn.com/dms/image/v2/D5622AQFFYbqVoFVEiQ/feedshare-shrink_800/B56ZjiIw64HkAg-/0/1756140606421?e=2147483647&v=beta&t=5DLw9Kx6Rr1UMs4MV7qNqlF2xa_QdgMw-GyJ4A-06pI",
        ],
        "ai-architects-handbook": [
            "https://images-na.ssl-images-amazon.com/images/P/B0F2JH8N21.01.LZZZZZZZ.jpg",
            "https://m.media-amazon.com/images/P/B0F2JH8N21.01._SCLZZZZZZZ_.jpg",
            "https://images-na.ssl-images-amazon.com/images/P/9798314471302.01.LZZZZZZZ.jpg",
        ],
        "ai-driven-organization": [
            "https://images-na.ssl-images-amazon.com/images/P/B0D61QHZP8.01.LZZZZZZZ.jpg",
            "https://m.media-amazon.com/images/P/B0D61QHZP8.01._SCLZZZZZZZ_.jpg",
            "https://media.licdn.com/dms/image/v2/D5622AQEldzxLTSHk4A/feedshare-shrink_800/feedshare-shrink_800/0/1717640206046?e=2147483647&v=beta&t=PfEemE4X0WrSJ2_kiLSvWrwI_jHvVRX8G6fPlWArC5c",
        ],
        "ai-strategy-and-implementation": [
            "https://images-na.ssl-images-amazon.com/images/P/B0D1QKP41H.01.LZZZZZZZ.jpg",
            "https://m.media-amazon.com/images/P/B0D1QKP41H.01._SCLZZZZZZZ_.jpg",
        ],
        "ai-in-robotics": [
            "https://media.licdn.com/dms/image/v2/D5622AQFMnWizjRoNqg/feedshare-shrink_1280/feedshare-shrink_1280/0/1717387011145?e=2147483647&v=beta&t=l5Frab4Sb6jOIgXmmWnzfL_GtM7pGAIf8AtPZa5-c",
        ],
    }
    for slug, urls in cover_attempts.items():
        dest = books / slug / "cover.jpg"
        if dest.exists() and dest.stat().st_size > 4000:
            print("keep existing", dest.relative_to(ROOT))
            continue
        ok = False
        for url in urls:
            if download(url, dest):
                ok = True
                break
        if not ok:
            print("NO COVER for", slug)


if __name__ == "__main__":
    main()
