from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

cover = Image.new("RGB", (800, 1200), (10, 10, 10))
d = ImageDraw.Draw(cover)
d.rectangle([0, 0, 16, 1200], fill=(196, 30, 58))
d.rectangle([0, 0, 800, 16], fill=(196, 30, 58))
try:
    f1 = ImageFont.truetype("arialbd.ttf", 64)
    f2 = ImageFont.truetype("arial.ttf", 28)
    fa = ImageFont.truetype("arial.ttf", 24)
except OSError:
    f1 = f2 = fa = ImageFont.load_default()
d.text((64, 180), "GREAT APP.", font=f1, fill=(250, 250, 250))
d.text((64, 260), "BAD BUSINESS.", font=f1, fill=(196, 30, 58))
d.multiline_text(
    (64, 400),
    "Why Good Products Stay Unpaid\nand How App Builders Fix\nthe Commercial Side",
    font=f2,
    fill=(210, 210, 210),
    spacing=10,
)
d.text((64, 1080), "OLIVER A. ELLISON", font=fa, fill=(230, 230, 230))
out = Path(r"C:\local\reliable-ai-network\assets\books\great-app-bad-business")
out.mkdir(parents=True, exist_ok=True)
cover.save(out / "title-card.jpg", "JPEG", quality=90, optimize=True)
print("ok", out / "title-card.jpg")
