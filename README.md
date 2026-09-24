https://rylenanil.com/

Official portfolio and blog for Rylen Anil.

Blog share previews use title cards in `assets/share/`, with no article photos.
After changing a post's `og:title` or adding a post, run
`python3 scripts/generate-share-cards.py` (requires Pillow) and commit the generated
PNGs. The renderer uses the bundled, OFL-licensed Poppins fonts. For a new post,
point its Open Graph, Twitter, and JSON-LD image metadata to
`https://rylenanil.com/assets/share/<post-filename-without-html>.png`, using
1200 × 630 dimensions, `image/png`, and the title and author as image alt text.
The renderer writes to the filename in `og:image` and skips redirect pages, so
existing card URLs can stay stable when a post URL changes.
