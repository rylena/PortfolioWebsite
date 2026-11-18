https://rylenanil.com/

Official portfolio and blog for Rylen Anil.

The Media page is generated from `data/media.json`. Add or edit coverage there,
then run `python3 scripts/build-media-page.py` and commit both the data and
`media.html`. The static HTML lists the coverage without categories or filters.
Keep dates at the precision the publisher confirms
(year, month, or day), and record verification notes in the data. Research scope
and source limitations are recorded in `research/media-discovery.md`.

`publisherOrder` in the media data controls the requested publication order,
starting with CNBC TV18. Stories within an outlet appear newest first.

The desktop GitHub calendar uses the public [GitHub Contributions API](https://github.com/grubersjoe/github-contributions-api)
and renders rounded SVG cells locally. It falls back to a GitHub profile link
when the service is unavailable. The entire section is hidden on screens up to
768px, and the browser does not request contribution data at those widths.

`site.js` prints the compact fsociety ASCII Easter egg, contact email, and resume
link in the developer console. Its ASCII file lives in `assets/console/` and uses
the console's native background. Source references for artwork and logos are in
`assets/sources.json`.

Blog share previews use title cards in `assets/share/`, with no article photos.
Blog diagrams have editable Graphviz sources in `assets/diagrams/source/`.
The e-Sushrut post uses responsive HTML figures and a local Web Crypto hash demo
in `assets/esushrut/`; its evidence boundaries and photo attribution are recorded
in `research/esushrut-sources.md`.
Keep this post off `blog.html` until requested; it is available at its direct URL.
After editing those `.dot` files, run `python3 scripts/build-article-diagrams.py`
(requires Graphviz) and commit the rendered SVGs alongside their sources.
The renderer also updates diagram image dimensions in the posts to reserve the
correct aspect ratio. The GISEC evidence diagram uses a parallel layout on desktop
and `gisec-evidence-narrow.dot` below 600px; keep their labels and relationships in sync.
After changing a post's `og:title` or adding a post, run
`python3 scripts/generate-share-cards.py` (requires Pillow) and commit the generated
PNGs. The renderer uses the bundled, OFL-licensed Poppins fonts. For a new post,
point its Open Graph, Twitter, and JSON-LD image metadata to
`https://rylenanil.com/assets/share/<post-filename-without-html>.png`, using
1200 × 630 dimensions, `image/png`, and the title and author as image alt text.
The renderer writes to the filename in `og:image` and skips redirect pages, so
existing card URLs can stay stable when a post URL changes.
