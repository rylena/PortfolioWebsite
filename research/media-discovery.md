# Media research, November 15, 2026

The archive in `data/media.json` contains 105 distinct links across 75 publications
and media sources. Each record includes its publisher, title, URL, publication
date at the confirmed precision, format, language, review date, and verification
method. `media.html` is generated from that data.

Research started with the 15 press links already in the JEE disclosure post.
Additional searches covered the exact name, the longer name Rylen Anil
Perumkannaril, public handles, English news and interview searches, Hindi and
Malayalam spellings, DOJ recognition, C3iHub employment coverage, and GISEC
interviews. Publisher pages were fetched in bounded batches and checked for the
name and relevant context. Open Graph metadata, canonical links, visible dates,
and structured publication dates were inspected where available.

AMP pages, tracking URLs, alternate hostnames, and encoded-path copies of the
same article were consolidated. Distinct articles and follow-up reporting from
one publisher remain separate. The archive includes profiles, interviews,
disclosure reporting, later clarifications, a live-blog mention, a school magazine
mention, and a newspaper PDF. A link records that coverage exists; it does not
endorse every technical claim in the reporting.

This is a broad archive of discoverable coverage, not a guarantee that every
mention on the internet has been indexed or found. Private, deleted, unindexed,
and login-only posts may be missing. Personal profile pages, personal social
announcements, contact-data brokers, unrelated people, duplicate search/category
pages, and an apparent impersonation/republication site (`thehindu.locker`) were
excluded. An organizer's official interview post is included as media coverage.

## Verification limits

- The Ahmedabad Mirror article was confirmed through the publisher's indexed
  result, which names Rylen and describes the disclosure. Direct retrieval timed
  out during this review. Its record explicitly identifies that limitation.
- GISEC GLOBAL's official LinkedIn interview post was confirmed through indexed
  publisher content. LinkedIn restricted direct retrieval. Only its confirmed
  year is displayed; a publication day has not been inferred.
- The two PDF links were retrieved successfully. Their indexed document text
  confirms Rylen's name and the relevant story or committee role.
- The existing Deccan Herald story ending in `4026466` describes the same
  disclosure without naming Rylen in the fetched article. It was already linked
  by the portfolio and remains marked accordingly in the data.
- Some publishers intermittently return access-denied pages to automated
  requests. Successful retrieval and indexed publisher content establish the
  reference; they do not guarantee that every visitor can open it without
  cookies, a subscription, or a geographic restriction.
- The Pioneer June 4, 2026 e-paper appeared in search results but returned HTTP
  404. It was not included as a working archive link:
  <https://dailypioneer.com/uploads/2026/epaper/june/delhi-english-edition-2026-06-04.pdf>

## DOJ recognition

The official DOJ VDP policy links to its Synack-managed reporting portal:

- [DOJ vulnerability disclosure policy](https://www.justice.gov/jmd/vulnerability-disclosure-policy)
- [Official program acknowledgments](https://fb6d331c8f530081fa81e12d81678ff8.responsibledisclosure.com/hc/en-us/articles/1500003305722-Acknowledgments)
- [Rylen's October 5, 2026 announcement](https://x.com/rylenanil/status/2107165056022814735)

The acknowledgments page lists Rylen Anil alongside his LinkedIn profile and
former X handle, among researchers who responsibly disclosed valid
vulnerabilities to the Department of Justice. This supports the homepage's
recognition claim. It does not establish a vulnerability type, severity, affected
system, bounty, or remediation timeline; none were added to the portfolio.


## Expanded search and presentation

A second discovery pass added 50 further links. It used targeted publisher
searches, alternate name spellings, exam/security keywords without the name,
regional-language searches, syndication, video distribution, and follow-up
coverage. Additional sources include Rediff, IANS, further Times of India and
Hindustan Times reports, The Logical Indian, The CSR Journal, regional newspapers,
and education publications. The data distinguishes retrieved pages from
search-indexed references where access was restricted. Exact publication days
are omitted when they could not be confirmed.

The press page follows the user's requested prominence order, beginning with
CNBC TV18 and major national/international publishers. The explicit
`publisherOrder` list in `data/media.json` is an editorial order, not a measured
traffic ranking. Stories within an outlet appear newest first. The page has no
classification controls or category labels.


The latest pass added Financial Express, Outlook India, the National Press Union
of India republication, and a June 9, 2026 Dubai Eye 103.8 episode. The station's
episode description explicitly names Rylen and his exam-portal findings. The
alternate player URL was consolidated into the station's canonical episode link.
Publication logos link to existing coverage in the archive and do not introduce
claims of coverage by any additional publication. Asset provenance is recorded
in `assets/sources.json`.
