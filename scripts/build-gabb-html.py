"""Build the static HTML edition of Great App. Bad Business. from the review copy."""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(r"C:\local\reliable-ai-network")
SRC = Path(
    r"C:\Users\olive\OneDrive\Desktop\books\great-app-bad-business"
    r"\Great-App-Bad-Business-REVIEW-COPY.txt"
)
COVER_SRC = Path(
    r"C:\Users\olive\OneDrive\Desktop\books\great-app-bad-business"
    r"\instructions\cover02.png"
)
MD_DIR = Path(
    r"C:\Users\olive\OneDrive\Desktop\books\great-app-bad-business\complete"
)
OUT_DIR = ROOT / "books" / "great-app-bad-business" / "read"
COVER_DIR = ROOT / "assets" / "books" / "great-app-bad-business"
AMAZON = "https://www.amazon.com/dp/9798171849252"
CANONICAL_BASE = "https://reliableainetwork.com/books/great-app-bad-business/read"
ISBN = "9798171849252"
BOOK_TITLE = "Great App. Bad Business."
BOOK_SUBTITLE = "Why Good Products Stay Unpaid and How App Builders Fix the Commercial Side"
AUTHOR = "Oliver A. Ellison"

PART_RE = re.compile(r"^Part ([IVX]+)$")
CHAPTER_RE = re.compile(r"^Chapter (\d+)$")
APPENDIX_RE = re.compile(r"^Appendix ([A-I]):\s*(.+)$")
NUMBERED_RE = re.compile(r"^(\d+)\.\s+(.*)$")
BULLET_RE = re.compile(r"^-\s+(.*)$")
BACKTICK_RE = re.compile(r"`([^`]+)`")

NOTES_H3 = {
    "A Note on the Stories in This Book",
    "Introduction",
    "Chapter 3",
    "Chapter 4",
    "Chapter 5",
    "Chapters 6 and 7",
    "Chapter 15",
    "Chapters 17 and 18",
    "Chapters 20 and 24",
    "Chapter 23",
    "Practical Tools",
}


def normalize(s: str) -> str:
    return (
        s.replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2018", "'")
        .replace("\u2019", "'")
        .strip()
    )


def slugify(label: str) -> str:
    s = normalize(label).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def load_md_headings() -> set[str]:
    headings = {normalize(h) for h in NOTES_H3}
    if not MD_DIR.exists():
        return headings
    for path in MD_DIR.glob("*.md"):
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.startswith("### "):
                headings.add(normalize(line[4:]))
    return headings


def write_cover() -> None:
    COVER_DIR.mkdir(parents=True, exist_ok=True)
    im = Image.open(COVER_SRC).convert("RGB")
    dest = COVER_DIR / "cover.jpg"
    im.save(dest, "JPEG", quality=85, optimize=True, progressive=True)
    print(f"wrote {dest.relative_to(ROOT)} {im.size} {dest.stat().st_size} bytes")
    thumb = im.copy()
    thumb.thumbnail((640, 960), Image.Resampling.LANCZOS)
    thumb_path = COVER_DIR / "cover-640.jpg"
    thumb.save(thumb_path, "JPEG", quality=84, optimize=True, progressive=True)
    print(f"wrote {thumb_path.relative_to(ROOT)} {thumb.size} {thumb_path.stat().st_size} bytes")


def parse_book(headings: set[str]) -> tuple[list[str], list[dict]]:
    raw = SRC.read_text(encoding="utf-8").replace("\r\n", "\n")
    lines = raw.split("\n")

    copy_start = next(i for i, line in enumerate(lines) if line.startswith("Copyright"))
    copy_end = next(i for i, line in enumerate(lines) if line.strip() == "Contents")
    front = [line.strip() for line in lines[copy_start:copy_end] if line.strip()]

    start = None
    for i, line in enumerate(lines):
        if line.strip() == "Introduction" and i + 1 < len(lines) and "You Built Something Real" in lines[i + 1]:
            start = i
            break
    if start is None:
        raise SystemExit("Could not find Introduction in the review copy.")

    chapters: list[dict] = []
    current: dict | None = None
    pending_part: dict | None = None
    in_notes = False
    i = start
    n = len(lines)

    def next_text(idx: int) -> tuple[str, int]:
        j = idx + 1
        while j < n and not lines[j].strip():
            j += 1
        if j >= n:
            return "", j
        return lines[j].strip(), j

    def flush() -> None:
        nonlocal current
        if current is not None:
            chapters.append(current)
            current = None

    def start_chapter(**kwargs) -> None:
        nonlocal current, pending_part
        flush()
        current = {
            "part": pending_part,
            "blocks": [],
            **kwargs,
        }
        pending_part = None

    while i < n:
        raw_line = lines[i]
        line = raw_line.strip()
        if not line:
            i += 1
            continue

        if not in_notes:
            part_m = PART_RE.match(line)
            if part_m:
                title, j = next_text(i)
                pending_part = {"roman": part_m.group(1), "title": title}
                i = j + 1
                continue

            ch_m = CHAPTER_RE.match(line)
            if ch_m:
                title, j = next_text(i)
                num = ch_m.group(1)
                start_chapter(
                    kind="chapter",
                    slug=f"chapter-{num}",
                    label=f"Chapter {num}",
                    title=title,
                    nav=f"Chapter {num}",
                )
                i = j + 1
                continue

            if line == "Introduction":
                title, j = next_text(i)
                start_chapter(
                    kind="introduction",
                    slug="introduction",
                    label="Introduction",
                    title=title,
                    nav="Introduction",
                )
                i = j + 1
                continue

            if line == "Conclusion":
                title, j = next_text(i)
                start_chapter(
                    kind="conclusion",
                    slug="conclusion",
                    label="Conclusion",
                    title=title,
                    nav="Conclusion",
                )
                i = j + 1
                continue

            if line == "Put This to Work":
                start_chapter(
                    kind="section",
                    slug="put-this-to-work",
                    label="Put This to Work",
                    title="",
                    nav="Put This to Work",
                )
                i += 1
                continue

            if line == "Practical Tools":
                start_chapter(
                    kind="section",
                    slug="practical-tools",
                    label="Practical Tools",
                    title="",
                    nav="Practical Tools",
                )
                i += 1
                continue

            ap_m = APPENDIX_RE.match(line)
            if ap_m:
                letter, title = ap_m.group(1), ap_m.group(2)
                start_chapter(
                    kind="appendix",
                    slug=f"appendix-{letter.lower()}",
                    label=f"Appendix {letter}",
                    title=title,
                    nav=f"Appendix {letter}",
                )
                i += 1
                continue

            if line == "Notes & Sources":
                in_notes = True
                start_chapter(
                    kind="notes",
                    slug="notes",
                    label="Notes & Sources",
                    title="",
                    nav="Notes & Sources",
                )
                i += 1
                continue

            if line == "About the Author":
                start_chapter(
                    kind="about",
                    slug="about-the-author",
                    label="About the Author",
                    title="",
                    nav="About the Author",
                )
                i += 1
                continue
        else:
            if line == "About the Author":
                in_notes = False
                start_chapter(
                    kind="about",
                    slug="about-the-author",
                    label="About the Author",
                    title="",
                    nav="About the Author",
                )
                i += 1
                continue

        if current is None:
            i += 1
            continue

        md_h = re.match(r"^#{1,6}\s+(.*)$", line)
        if md_h:
            current["blocks"].append({"type": "h3", "text": md_h.group(1).strip()})
            i += 1
            continue

        if normalize(line) in headings:
            current["blocks"].append({"type": "h3", "text": line})
            i += 1
            continue

        num_m = NUMBERED_RE.match(line)
        if num_m:
            current["blocks"].append(
                {"type": "numbered", "n": num_m.group(1), "text": num_m.group(2)}
            )
            i += 1
            continue

        bullet_m = BULLET_RE.match(line)
        if bullet_m:
            current["blocks"].append({"type": "bullet", "text": bullet_m.group(1)})
            i += 1
            continue

        if "\u2192" in line and len(line) < 220:
            current["blocks"].append({"type": "sequence", "text": line})
            i += 1
            continue

        current["blocks"].append({"type": "p", "text": line})
        i += 1

    flush()
    return front, chapters


def inline(text: str) -> str:
    escaped = html.escape(text)
    return BACKTICK_RE.sub(r"<code>\1</code>", escaped)


def render_blocks(blocks: list[dict]) -> str:
    parts: list[str] = []
    i = 0
    while i < len(blocks):
        block = blocks[i]
        kind = block["type"]
        if kind == "h3":
            hid = slugify(block["text"])
            parts.append(f'<h2 id="{html.escape(hid)}">{inline(block["text"])}</h2>')
            i += 1
        elif kind == "sequence":
            parts.append(f'<p class="book-sequence">{inline(block["text"])}</p>')
            i += 1
        elif kind == "numbered":
            items = []
            while i < len(blocks) and blocks[i]["type"] == "numbered":
                items.append(
                    f'<li value="{html.escape(blocks[i]["n"])}">{inline(blocks[i]["text"])}</li>'
                )
                i += 1
            parts.append("<ol>" + "".join(items) + "</ol>")
        elif kind == "bullet":
            items = []
            while i < len(blocks) and blocks[i]["type"] == "bullet":
                items.append(f"<li>{inline(blocks[i]['text'])}</li>")
                i += 1
            parts.append("<ul>" + "".join(items) + "</ul>")
        else:
            parts.append(f"<p>{inline(block['text'])}</p>")
            i += 1
    return "\n".join(parts)


def toc_html(chapters: list[dict], current_slug: str) -> str:
    items: list[str] = [
        '<li><a href="./">Cover and contents</a></li>',
        '<li><a href="copyright.html">Copyright</a></li>',
    ]
    last_part = None
    for ch in chapters:
        part = ch.get("part")
        if part and part != last_part:
            items.append(
                f'<li class="toc-part">Part {html.escape(part["roman"])}: {inline(part["title"])}</li>'
            )
            last_part = part
        current = ' aria-current="page"' if ch["slug"] == current_slug else ""
        label = ch["label"]
        if ch["title"]:
            label = f"{ch['label']}: {ch['title']}"
        items.append(
            f'<li><a href="{html.escape(ch["slug"])}.html"{current}>{inline(label)}</a></li>'
        )
    return "<ol class=\"toc-list\">" + "".join(items) + "</ol>"


def reader_page(
    *,
    filename: str,
    title: str,
    description: str,
    body: str,
    chapters: list[dict],
    slug: str,
    prev_ch: dict | None,
    next_ch: dict | None,
    heading_html: str,
) -> str:
    prev_link = (
        f'<a rel="prev" href="{html.escape(prev_ch["slug"])}.html">Previous: {inline(prev_ch["nav"])}</a>'
        if prev_ch
        else '<a href="./">Cover</a>'
    )
    next_link = (
        f'<a rel="next" href="{html.escape(next_ch["slug"])}.html">Next: {inline(next_ch["nav"])}</a>'
        if next_ch
        else '<a href="../great-app-bad-business.html">Book page</a>'
    )
    prev_head = (
        f'<link rel="prev" href="{html.escape(prev_ch["slug"])}.html">' if prev_ch else ""
    )
    next_head = (
        f'<link rel="next" href="{html.escape(next_ch["slug"])}.html">' if next_ch else ""
    )
    canonical = f"{CANONICAL_BASE}/{filename}"
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(description)}">
  <link rel="canonical" href="{html.escape(canonical)}">
  <meta property="og:title" content="{html.escape(title)}">
  <meta property="og:description" content="{html.escape(description)}">
  <meta property="og:url" content="{html.escape(canonical)}">
  <meta property="og:image" content="https://reliableainetwork.com/assets/books/great-app-bad-business/cover.jpg">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="../../../assets/brand/rain-mark-sm.png" type="image/png">
  {prev_head}
  {next_head}
  <link rel="stylesheet" href="../../../css/book-reader.css">
  <script src="../../../js/book-reader.js" defer></script>
</head>
<body class="gabb-reader" data-chapter="{html.escape(slug)}">
  <a class="skip-link" href="#chapter">Skip to chapter</a>
  <header class="reader-bar">
    <a class="reader-home" href="../great-app-bad-business.html">Book page</a>
    <button type="button" class="toc-toggle" aria-expanded="false" aria-controls="toc-drawer">Contents</button>
    <span class="reader-now">{inline(title.split("|")[0].strip())}</span>
    <div class="reader-tools">
      <button type="button" class="font-dec" aria-label="Smaller text">A-</button>
      <button type="button" class="font-inc" aria-label="Larger text">A+</button>
    </div>
  </header>
  <div class="read-progress" aria-hidden="true"><span></span></div>
  <div class="toc-backdrop" hidden></div>
  <aside id="toc-drawer" class="toc-drawer" hidden>
    <p class="toc-kicker">{html.escape(BOOK_TITLE)}</p>
    {toc_html(chapters, slug)}
  </aside>
  <article id="chapter" class="chapter">
    {heading_html}
    {body}
  </article>
  <nav class="chapter-end" aria-label="Chapter">
    {prev_link}
    {next_link}
  </nav>
  <footer class="reader-foot">
    <p>Copyright &copy; 2026 {html.escape(AUTHOR)}. All rights reserved. ISBN {ISBN}.</p>
    <p>
      <a href="{html.escape(AMAZON)}" target="_blank" rel="noopener">Buy on Amazon</a>
      &middot; <a href="../great-app-bad-business.html">About this book</a>
      &middot; <a href="../../../">Reliable AI Network</a>
    </p>
  </footer>
</body>
</html>
"""


def heading_for(ch: dict) -> str:
    bits = []
    if ch.get("part"):
        part = ch["part"]
        bits.append(
            f'<p class="part-kicker">Part {html.escape(part["roman"])}: {inline(part["title"])}</p>'
        )
    bits.append(f"<h1>{inline(ch['label'])}</h1>")
    if ch["title"]:
        bits.append(f'<p class="chapter-sub">{inline(ch["title"])}</p>')
    return "\n".join(bits)


def write_index(chapters: list[dict]) -> None:
    first = chapters[0]["slug"] + ".html" if chapters else "copyright.html"
    toc = toc_html(chapters, "")
    html_out = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Read {html.escape(BOOK_TITLE)} | {html.escape(AUTHOR)}</title>
  <meta name="description" content="Read {html.escape(BOOK_TITLE)} online. {html.escape(BOOK_SUBTITLE)}">
  <link rel="canonical" href="{CANONICAL_BASE}/">
  <meta property="og:title" content="Read {html.escape(BOOK_TITLE)}">
  <meta property="og:description" content="{html.escape(BOOK_SUBTITLE)}">
  <meta property="og:url" content="{CANONICAL_BASE}/">
  <meta property="og:image" content="https://reliableainetwork.com/assets/books/great-app-bad-business/cover.jpg">
  <meta property="og:type" content="book">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="../../../assets/brand/rain-mark-sm.png" type="image/png">
  <link rel="stylesheet" href="../../../css/book-reader.css">
  <script src="../../../js/book-reader.js" defer></script>
  <script type="application/ld+json">
  {json.dumps({
      "@context": "https://schema.org",
      "@type": "Book",
      "name": BOOK_TITLE,
      "alternateName": BOOK_SUBTITLE,
      "isbn": ISBN,
      "inLanguage": "en",
      "bookFormat": "https://schema.org/EBook",
      "url": CANONICAL_BASE + "/",
      "image": "https://reliableainetwork.com/assets/books/great-app-bad-business/cover.jpg",
      "author": {"@type": "Person", "name": AUTHOR},
      "publisher": {"@type": "Organization", "name": "Reliable AI Network, Inc."},
      "copyrightYear": "2026",
      "copyrightHolder": {"@type": "Person", "name": AUTHOR},
  }, indent=2)}
  </script>
</head>
<body class="gabb-reader gabb-cover" data-chapter="index">
  <a class="skip-link" href="#contents">Skip to contents</a>
  <header class="reader-bar">
    <a class="reader-home" href="../great-app-bad-business.html">Book page</a>
    <button type="button" class="toc-toggle" aria-expanded="false" aria-controls="toc-drawer">Contents</button>
    <span class="reader-now">{html.escape(BOOK_TITLE)}</span>
  </header>
  <div class="toc-backdrop" hidden></div>
  <aside id="toc-drawer" class="toc-drawer" hidden>
    <p class="toc-kicker">{html.escape(BOOK_TITLE)}</p>
    {toc}
  </aside>
  <main class="cover-main">
    <img class="cover-hero" src="../../../assets/books/great-app-bad-business/cover.jpg" width="1024" height="1535" alt="Cover of Great App. Bad Business. by Oliver A. Ellison">
    <div class="cover-copy">
      <p class="kicker">HTML edition</p>
      <h1>{html.escape(BOOK_TITLE)}</h1>
      <p class="chapter-sub">{html.escape(BOOK_SUBTITLE)}</p>
      <p>{html.escape(AUTHOR)} &middot; First edition &middot; ISBN {ISBN}</p>
      <p class="lede">Read the book in your browser. This is the authorized HTML edition of the first edition, not a PDF.</p>
      <div class="btn-row">
        <a class="btn primary" href="{html.escape(first)}">Start reading</a>
        <a class="btn ghost" href="copyright.html">Copyright</a>
        <a class="btn ghost" href="{html.escape(AMAZON)}" target="_blank" rel="noopener">Buy on Amazon</a>
      </div>
    </div>
  </main>
  <section id="contents" class="cover-toc">
    <h2>Contents</h2>
    {toc}
  </section>
  <footer class="reader-foot">
    <p>Copyright &copy; 2026 {html.escape(AUTHOR)}. All rights reserved.</p>
    <p><a href="../great-app-bad-business.html">About this book</a> &middot; <a href="../../../">Reliable AI Network</a></p>
  </footer>
</body>
</html>
"""
    (OUT_DIR / "index.html").write_text(html_out, encoding="utf-8")


def write_copyright(front: list[str], chapters: list[dict]) -> None:
    paras = "".join(f"<p>{inline(p)}</p>" for p in front)
    body = reader_page(
        filename="copyright.html",
        title=f"Copyright | {BOOK_TITLE}",
        description="Copyright and legal notice for the HTML edition.",
        body=paras,
        chapters=chapters,
        slug="copyright",
        prev_ch=None,
        next_ch=chapters[0] if chapters else None,
        heading_html="<h1>Copyright</h1>",
    )
    (OUT_DIR / "copyright.html").write_text(body, encoding="utf-8")


def desc_for(ch: dict) -> str:
    for block in ch["blocks"]:
        if block["type"] == "p" and len(block["text"]) > 80:
            text = block["text"]
            return text[:157] + "..." if len(text) > 160 else text
    if ch["title"]:
        return f"{ch['label']}: {ch['title']}. {BOOK_TITLE} by {AUTHOR}."
    return f"{ch['label']}. {BOOK_TITLE} by {AUTHOR}."


def main() -> None:
    write_cover()
    headings = load_md_headings()
    front, chapters = parse_book(headings)
    if not chapters:
        raise SystemExit("Parser produced no chapters.")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("*.html"):
        old.unlink()

    write_index(chapters)
    write_copyright(front, chapters)

    for idx, ch in enumerate(chapters):
        prev_ch = chapters[idx - 1] if idx else {"slug": "copyright", "nav": "Copyright"}
        next_ch = chapters[idx + 1] if idx + 1 < len(chapters) else None
        page_title = ch["label"] if not ch["title"] else f"{ch['label']}: {ch['title']}"
        html_out = reader_page(
            filename=f"{ch['slug']}.html",
            title=f"{page_title} | {BOOK_TITLE}",
            description=desc_for(ch),
            body=render_blocks(ch["blocks"]),
            chapters=chapters,
            slug=ch["slug"],
            prev_ch=prev_ch,
            next_ch=next_ch,
            heading_html=heading_for(ch),
        )
        (OUT_DIR / f"{ch['slug']}.html").write_text(html_out, encoding="utf-8")

    print(f"chapters: {len(chapters)}")
    for ch in chapters:
        words = sum(len(b.get("text", "").split()) for b in ch["blocks"])
        h3s = sum(1 for b in ch["blocks"] if b["type"] == "h3")
        print(f"  {ch['slug']:22} {words:5} words  {h3s:2} h2  {ch['label']}: {ch['title']}")

    toc_path = ROOT / "data" / "gabb-toc.json"
    toc_path.write_text(
        json.dumps(
            [
                {
                    "slug": ch["slug"],
                    "label": ch["label"],
                    "title": ch["title"],
                    "part": ch["part"],
                }
                for ch in chapters
            ],
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print("wrote", toc_path.relative_to(ROOT))


if __name__ == "__main__":
    main()
