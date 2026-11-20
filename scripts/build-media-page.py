#!/usr/bin/env python3
"""Generate the static press page from data/media.json."""

import json
from datetime import date
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def display_date(value):
    if len(value) == 4:
        return value
    if len(value) == 7:
        return date.fromisoformat(value + '-01').strftime('%B %Y')
    return date.fromisoformat(value).strftime('%b %-d, %Y')


def build():
    archive = json.loads((ROOT / 'data/media.json').read_text())
    items = sorted(archive['items'], key=lambda item: (item['date'], item['language'] == 'en', item['publisher']), reverse=True)
    publisher_order = {name: index for index, name in enumerate(archive['publisherOrder'])}
    items.sort(key=lambda item: publisher_order.get(item['publisher'], len(publisher_order)))
    urls = [item['url'] for item in items]
    if len(urls) != len(set(urls)):
        raise ValueError('Duplicate media URL')
    logos = []
    for featured in archive.get('featuredPublishers', []):
        story = next(item for item in items if item['publisher'] == featured['publisher'])
        logos.append(f'''            <li><a href="{escape(story['url'], quote=True)}" target="_blank" rel="noopener noreferrer" aria-label="Read coverage in {escape(featured['publisher'], quote=True)}"><img class="press-logo press-logo-{escape(featured['tone'])}" src="{escape(featured['logo'], quote=True)}" alt="{escape(featured['publisher'], quote=True)}" width="180" height="48"></a></li>''')
    entries = []
    for item in items:
        entries.append(f'''            <article class="media-entry">
                <div class="media-entry-meta">
                    <span class="media-publisher">{escape(item['publisher'])}</span>
                    <time datetime="{escape(item['date'])}">{display_date(item['date'])}</time>
                </div>
                <h2 lang="{item['language']}"><a href="{escape(item['url'], quote=True)}" target="_blank" rel="noopener noreferrer"><span>{escape(item['title'])}</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg></a></h2>
            </article>''')
    schema = {
        '@context': 'https://schema.org', '@type': 'CollectionPage',
        'name': 'Rylen Anil in the Media', 'url': 'https://rylenanil.com/media.html',
        'description': 'Articles, interviews, and published mentions of Rylen Anil.',
        'about': {'@type': 'Person', '@id': 'https://rylenanil.com/#rylen-anil', 'name': 'Rylen Anil'},
        'mainEntity': {'@type': 'ItemList', 'numberOfItems': len(items), 'itemListElement': [
            {'@type': 'ListItem', 'position': i, 'url': item['url'], 'name': item['title']}
            for i, item in enumerate(items, start=1)
        ]}
    }
    schema_json = json.dumps(schema, ensure_ascii=False, indent=4).replace('<', '\\u003c')
    output = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Media | Rylen Anil</title>
    <meta name="description" content="News coverage, video interviews, and published mentions of Rylen Anil, cybersecurity researcher and Junior Cybersecurity Engineer at C3iHub, IIT Kanpur.">
    <meta name="author" content="Rylen Anil">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
    <meta name="theme-color" content="#0a192f">
    <link rel="canonical" href="https://rylenanil.com/media.html">
    <link rel="icon" type="image/svg+xml" href="assets/favicon.svg?v=20261115b">
    <link rel="manifest" href="/site.webmanifest">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Rylen Anil">
    <meta property="og:locale" content="en_US">
    <meta property="og:title" content="Media | Rylen Anil">
    <meta property="og:description" content="Articles, interviews, and published mentions of my security research and work.">
    <meta property="og:url" content="https://rylenanil.com/media.html">
    <meta property="og:image" content="https://rylenanil.com/assets/share/media.png">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="In the media | Rylen Anil">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@rylenanil">
    <meta name="twitter:creator" content="@rylenanil">
    <meta name="twitter:title" content="Media | Rylen Anil">
    <meta name="twitter:description" content="Articles, interviews, and published mentions of my security research and work.">
    <meta name="twitter:image" content="https://rylenanil.com/assets/share/media.png">
    <meta name="twitter:image:alt" content="In the media | Rylen Anil">
    <script type="application/ld+json">
    {schema_json}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css?v=20261115-media-doj">
    <link rel="stylesheet" href="assets/media.css?v=20261115">
    <script src="/site.js" defer></script>
    <script src="/visit-notifications.js" defer></script>
</head>
<body class="blog-page minimal-blog media-page">
    <a class="media-skip-link" href="#coverage">Skip to coverage</a>
    <main class="minimal-shell">
        <nav class="minimal-nav" aria-label="Main navigation">
            <a href="index.html" aria-label="Rylen Anil home">rylen</a>
            <div>
                <a href="index.html#about">about</a>
                <a href="index.html#projects">projects</a>
                <a href="blog.html">blog</a>
                <a href="media.html" aria-current="page">media</a>
                <a href="resume.pdf">resume</a>
            </div>
        </nav>
        <header class="minimal-header">
            <h1>Press</h1>
            <p>Stories and conversations about my work.</p>
        </header>
        <ul class="press-logos" aria-label="Featured publications">
{chr(10).join(logos)}
        </ul>
        <section id="coverage" class="media-list" aria-label="Media coverage" tabindex="-1">
{chr(10).join(entries)}
        </section>
    </main>
    <footer class="minimal-footer"><p>&copy; 2026 Rylen Anil</p></footer>
</body>
</html>
'''
    (ROOT / 'media.html').write_text(output)
    print(f'Generated media.html with {len(items)} links')


if __name__ == '__main__':
    build()
