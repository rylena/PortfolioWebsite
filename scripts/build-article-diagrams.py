#!/usr/bin/env python3
"""Render the blog's editable DOT diagrams. Requires Graphviz (`dot`)."""

from pathlib import Path
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


if __name__ == "__main__":
    for source in sorted((OUTPUT / "source").glob("*.dot")):
        render(source)
