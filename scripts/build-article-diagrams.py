#!/usr/bin/env python3
"""Render the blog's editable DOT diagrams. Requires Graphviz (`dot`)."""

from pathlib import Path
import re
import subprocess
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets/diagrams"
NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)


def render(source):
    result = subprocess.run(
        ["dot", "-Tsvg", str(source)],
        check=True, capture_output=True, text=True,
    )
    svg = ET.fromstring(result.stdout)
    # The article's image alt text and caption explain the full relationship.
    # Keep a useful title when the SVG is opened on its own as well.
    title = source.stem.replace("-", " ").replace("gisec", "GISEC").replace("jee", "JEE")
    svg.insert(0, ET.Element(f"{{{NS}}}title", {"id": "diagram-title"}))
    svg[0].text = title
    svg.set("role", "img")
    svg.set("aria-labelledby", "diagram-title")
    output = OUTPUT / f"{source.stem}.svg"
    ET.ElementTree(svg).write(output, encoding="unicode", xml_declaration=False)
    print(output.relative_to(ROOT))
    _, _, width, height = map(float, svg.get("viewBox").split())
    return source.stem, (round(width), round(height))


def update_image_dimensions(dimensions):
    """Reserve the rendered aspect ratio, including responsive picture sources."""
    pattern = re.compile(
        r'<(?:img|source)\b[^>]*\b(?:src|srcset)="\.\./assets/diagrams/([^"/]+)\.svg"[^>]*>'
    )

    def update(match):
        if match[1] not in dimensions:
            return match[0]
        tag = match[0]
        for name, value in zip(("width", "height"), dimensions[match[1]]):
            if re.search(rf'\b{name}="[^"]*"', tag):
                tag = re.sub(rf'\b{name}="[^"]*"', f'{name}="{value}"', tag)
            else:
                tag = tag[:-1] + f' {name}="{value}">'
        return tag

    for post in sorted((ROOT / "posts").glob("*.html")):
        original = post.read_text()
        updated = pattern.sub(update, original)
        if updated != original:
            post.write_text(updated)
            print(f"Updated image dimensions: {post.relative_to(ROOT)}")


if __name__ == "__main__":
    dimensions = dict(render(source) for source in sorted((OUTPUT / "source").glob("*.dot")))
    update_image_dimensions(dimensions)
