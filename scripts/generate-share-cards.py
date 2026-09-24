#!/usr/bin/env python3
"""Render text-only share cards. Requires Pillow (python3 -m pip install Pillow)."""

from html.parser import HTMLParser
from itertools import combinations
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets/share"
SCALE = 2
BACKGROUND = "#0a192f"
FOREGROUND = "#ffffff"
ACCENT = "#64ffda"
MUTED = "#a5b4d4"


class Metadata(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.values = {}
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta":
            self.values[attrs.get("property", attrs.get("name"))] = attrs.get("content")


def font(size, bold=False):
    weight = "Bold" if bold else "Regular"
    return ImageFont.truetype(str(OUTPUT / f"fonts/Poppins-{weight}.ttf"), size * SCALE)


def fit_title(title):
    """Keep the full title, balancing up to three lines within the safe area."""
    words = title.split()
    for size in range(80, 39, -2):
        face = font(size, bold=True)
        for count in range(1, 4):
            candidates = []
            for breaks in combinations(range(1, len(words)), count - 1):
                edges = (0, *breaks, len(words))
                lines = [" ".join(words[a:b]) for a, b in zip(edges, edges[1:])]
                widths = [face.getlength(line) / SCALE for line in lines]
                if max(widths) <= 1040:
                    candidates.append((max(widths) - min(widths), lines))
            if candidates:
                return face, size, min(candidates, key=lambda item: item[0])[1]
    raise ValueError(f"Title is too long for the share card: {title}")


def render(title, output):
    canvas = Image.new("RGB", (1200 * SCALE, 630 * SCALE), BACKGROUND)
    draw = ImageDraw.Draw(canvas)

    def text(x, y, value, face, color=FOREGROUND, anchor="lt"):
        draw.text((x * SCALE, y * SCALE), value, font=face, fill=color, anchor=anchor)

    # Typography carries the card; no article photos or evidence screenshots.
    face, size, lines = fit_title(title)
    line_height = size * 1.22
    top = 265 - (len(lines) * line_height) / 2
    for index, line in enumerate(lines):
        text(80, top + index * line_height, line, face,
             ACCENT if index == len(lines) - 1 else FOREGROUND)

    draw.line((80 * SCALE, 486 * SCALE, 1120 * SCALE, 486 * SCALE),
              fill="#334663", width=2 * SCALE)
    text(80, 525, "Rylen Anil", font(28, bold=True))
    text(1120, 528, "rylenanil.com / blog", font(24), MUTED, anchor="rt")
    canvas.resize((1200, 630), Image.Resampling.LANCZOS).save(output, optimize=True)
    print(output.relative_to(ROOT))


if __name__ == "__main__":
    OUTPUT.mkdir(parents=True, exist_ok=True)
    render("Security research & build notes", OUTPUT / "blog.png")
    for post in sorted((ROOT / "posts").glob("*.html")):
        metadata = Metadata(post.read_text())
        if metadata.values.get("og:type") != "article":
            continue  # Old post URLs may contain redirect pages.
        render(metadata.values["og:title"], OUTPUT / Path(metadata.values["og:image"]).name)
