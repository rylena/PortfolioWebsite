# e-Sushrut technical article sources

Article: `posts/cdac-esushrut-session-token.html`. Created November 17, 2026;
rewritten against original tool output November 18, 2026. The existing URL is
retained, with the current title **Hacking 4,000 Hospitals**.

No current hospital endpoints were probed to prepare either draft. Examples,
request excerpts and observed results come from the saved investigation.

## Evidence precedence and corrections

Executed September 1 tool output takes precedence over later conversational
summaries and disclosure drafts where they disagree. In particular:

- The original Bokaro `ssoLogin.js` output contains an active SHA-512
  `securePassword()` and a commented-out SHA-1 implementation. It does not
  support claiming that Bokaro first received SHA-512 in September 18's changes.
- Bokaro captures include `[B@REDACTED-A` and `[B@REDACTED-B` in different responses.
  They do not establish a globally invariant token, a lifetime guarantee, or a
  complete per-attempt freshness policy. Patna's capture contains `[B@REDACTED-C`.
- A Java array's object-string representation does not itself prove a replay
  attack, token entropy, or every server-side generation/validation step.
- Token visibility in public HTML is not independently a vulnerability. Fresh
  public nonces do not prevent offline guessing after capture of the submitted
  hash, username and nonce. The article describes the browser construction and the prerequisites for
  offline guessing; it does not claim a successful login replay.
- Widget requests in the history redirected or failed. They were reconstructed
  requests, not proof that every correctly constructed data request was denied.
  In particular, some probes used `dashboardId=1` while the displayed report key
  was `[REDACTED]`. The article does not claim exhaustive coverage of widget guards.
- Matching response lengths after hospital-code changes do not prove a
  cross-hospital IDOR or matching response contents.

## Original OpenCode evidence

Session: `ses_fa2e032b1ffe0Aj2S7jSz8en3A`, September 1, 2026. Below, an index is
zero-based in the session's `part` rows ordered by `time_created,id`. The original
part database and private intermediate extracts remain outside this repository.

| Claim or excerpt | Original output | Boundary |
| --- | --- | --- |
| Public dashboard hyperlink and script paths | Part 85, executed extraction of `sailbsl-login.html` | Link, query and script paths visible in anonymous landing HTML. |
| Dashboard 200, title and 274,427-byte body | Parts 91, 103 | Response headers and selected HTML lines; session cookie values omitted from the article. |
| Clean dashboard repetitions | Part 282 | One fresh invocation without a cookie jar, another with literal `Cookie: none`. Both show 200 / 274427. No body-hash equivalence asserted. |
| Base64 selectors and echoed hidden fields | Parts 85, 223 | `NQ==` decodes to `5`; `SE1JUw==` decodes to `HMIS`. Client-supplied fields do not authenticate identity. |
| Widget code and request construction | Parts 163, 174, 195, 212, 215, 218, 231 | `callDataForSpecificWidget`, `preparejsonForAjax`, `GET_WIDGET_DATA`, controller URL. |
| Widget request redirects | Parts 235, 239, 287 | Reconstructed probes returned 302 / Exception.jsp; not an exhaustive endpoint or patient-data access claim. |
| Alternate hospital-code response lengths | Part 141 | Alternate hospital-code probes also return 200 / 274427; not proof of other hospitals' data. |
| Full `HOSPITALS` value | Parts 120, 620, 640 | Original 15-position sequence, hospital code redacted, no individual patient rows. |
| Counter decoding and DOM labels | Part 115, full original `sso_main_login.js` output | Active original mapping, not an inference from counter magnitudes or later code. |
| Bokaro token declarations | Parts 126, 636, 640 | Standalone `sessionToken` and bootstrap `SESSION_TOKEN` property. |
| Other Bokaro object-string value | Parts 121, 636 | Fresh/alternate responses contain `[B@REDACTED-B`; no global constant claim. |
| Bokaro active SHA-512 routine | Part 110, full original `ssoLogin.js` output | SHA-1 version is commented. The article describes the supplied routine, not universal execution by every alternate login handler. |
| Patna token and active SHA-1 routine | Parts 772, 776 | Original HTML locations and partial active function output. |
| Patna dashboard response is an error | Parts 764, 768, 780 | HTTP 200 with a 1,011-byte error page, not dashboard data access. |
| Patna lacks the same counter structure | Parts 756, 772, 780 | No equivalent `HOSPITALS` payload established. Public marketing mentions of OPD/IPD are not counted as operational data. |
| Parameter wrapper | Parts 98, 198, 631, 760, 764 | Base64(JSON(sorted name/value pairs)); `abfhttf`/`dbfhttf` are field names. Neither successful CSRF nor a separate CVE is claimed. |

Public static-code excerpts recovered from this output are in
`assets/esushrut/source/`. The Bokaro hash and counter-mapping files contain
complete selected functions. Patna's text file is explicitly a partial original
transcript excerpt. The article labels omitted context and editorial comments.
Line endings and trailing whitespace are normalized in the published excerpts.
No private mail, passwords, raw cookies or full login HTML are published.

## Other archive material

- OpenCode September 18: `ses_f4b6a1dedffev4uFOJisdQwF4D`.
- Codex October 23: `rollout-2026-10-23T19-29-56-01a1690f-aaa8-7720-8a14-cb25251f8cba.jsonl`.
- Codex October 27: `rollout-2026-10-27T13-04-59-01a17c48-ac8c-7571-a346-605b09a2a3bf.jsonl`.
- Supplied package: `work/esushrut-blog-sources-20261117/`. Its 29 inventory
  entries matched the recorded SHA-256 values when checked November 17.

The October conversations establish the September 1 submission, September 18
CERT-In fix confirmation/acknowledgement, and October 27 follow-up. Only a short
fix-confirmation quote is included. The later remediation-verification procedure
is excluded from the article at the user's request.

## Product and impact context

The opening follows the supplied product-description screenshot: e-Sushrut is a
Hospital Management Information System developed and deployed by C-DAC for
patient information, hospital workflows and healthcare administration.
The researcher subsequently requested “hacking 4000 hospitals,” then asked for
grammatically polished capitalization and punctuation: “Hacking 4,000 Hospitals.”
The article body omits deployment totals and names the tested installations; the
headline does not establish a verified count of compromised hospitals.
The tested installations remain identified in the article.

## Public references

- [CERT-In CIVN-2026-0557](https://www.cert-in.org.in/s2cMainServlet?pageid=PUBVLNOTES01&VLCODE=CIVN-2026-0557).
- [CVE-2026-124643](https://www.cve.org/CVERecord?id=CVE-2026-124643),
  [CVE-2026-124644](https://www.cve.org/CVERecord?id=CVE-2026-124644),
  [CVE-2026-124645](https://www.cve.org/CVERecord?id=CVE-2026-124645).
- Machine-readable CNA records retrieved November 17 from
  `https://cveawg.mitre.org/api/cve/<CVE-ID>`. Titles, November 17 publication
  dates, credit, remediation and CVSS 4.0 scores (8.7, 6.9, 8.7) were checked.
  The advisory separately credits Sriharan Mahendran for CVE-2026-124646.
- [Oracle Object.toString()](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#toString())
  and [Class.getName()](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Class.html#getName()).
- [C-DAC e-Sushrut product information](https://www.cdac.in/index.aspx?id=project_details&projectId=eSushrutHospitalManagementInformationSystem).

Photo: [AIIMS Patna OPD](https://commons.wikimedia.org/wiki/File:Aiimspatnaopd.png),
AIIMS Patna, 2018, CC BY-SA 4.0. WebP conversion only, no crop. Visible caption,
`assets/sources.json` and embedded WebP metadata retain attribution and license.
The photo is contextual, not an incident screenshot.

The user's [visual pacing reference](https://blogs.pwnedby.me/blog/hacking-a-multi-billion-dollars-company/)
was reviewed without copying its prose, diagrams, images or implementation.

## Reproduction and review

- The original counter-mapping function was executed against the captured packed
  value using a minimal DOM stub; all 14 displayed counters match its assignments.
- Both hashing constructions were checked with synthetic ASCII credentials.
  The original Bokaro function and archived Patna function were run with a jsSHA
  compatibility stub backed by Node crypto. The browser demo is separately
  checked against Python SHA-512 and SHA-1.
- The demo labels fixed-input and fresh-input modes as illustrations. It makes
  no network requests. No server-side replay protection is inferred from it.
- Responsive captures and review scripts are outside the website under the
  Projects workspace's `output/esushrut-blog-20261118/` directory.

## Plain-language edit

The November 18 copy edit shortened sentences and replaced formal wording.
The original code blocks and evidence links were retained at that stage.
Repeated caveats were cut while keeping the limits on token freshness, replay,
patient-data access and the two-site comparison. This earlier edit retained the headline; the November 19 revision supersedes it.

## Public-data redaction and impact edit

On November 18, the article was edited to emphasize confirmed exposure of daily
and total outpatient, emergency, inpatient, lab, prescription, pharmacy and ABHA
activity. These are operational counts, not individual patient-record contents.
Captured hospital names within payloads, hostnames, site and report identifiers,
activity figures and token suffixes are replaced with explicit placeholders.
The interactive demo uses invented token suffixes and credentials. Public
institution names remain as investigation context and photo attribution.

Failed widget requests, unsuccessful probes, the non-CVE parameter-wrapper
section and the closing advisory/version boilerplate were removed from the
article. The evidence boundaries above remain part of the source audit.
Private originals and review artifacts remain outside this website repository.

## Researcher confirmation and reaction images (November 18)

Rylen confirmed in the current editing conversation that he tested all three
vulnerabilities against AIIMS Patna and that all three worked there. The article
now reflects his firsthand account of reproducing all three at both hospitals.
This confirmation expands the coverage documented in the saved extracts above.
Those earlier extracts remain described as captured; no Patna-specific dashboard
request, counter values, timestamps or screenshots were invented to fill gaps.
The displayed dashboard and counter examples remain the redacted Bokaro captures.

At the user's request, the three technical-section memes and their visible
template credits were removed. A thumbs-up reaction after the disclosure timeline is captioned
“thank you CERT-In”. The source image is
unchanged; the caption is HTML. Source provenance remains in assets/sources.json.
The image contains no hospital data.

Pacing references reviewed at the user's request:
- https://blog.orange.tw/posts/2026-10-the-last-proof-of-human-craft-browser-full-chain/
- https://sylvie.fyi/posts/react2shell/

The references informed placement of reactions between technical explanations;
their prose, screenshots, private messages and custom images were not copied.

## Token meme approved (November 18)

The researcher approved a Pawn Stars-style reaction for the token section.
The built-in image_gen tool generated the preview, which was copied unchanged
to assets/esushrut/memes/random-bytes-pawn.png. Prompt: create a classic
Pawn Stars “best I can do” reaction with Rick Harrison at a pawn-shop counter;
caption it “Can I get the random bytes?” and “Best I can do is [B@…”; no
additional text, template labels, watermarks or hospital information.
The accompanying paragraph explains the inferred object-to-text mistake.

## Final published media

The article includes the approved token meme and the CERT-In thank-you image.
The private-dashboard video, poster, captions, playback styles and source entries
were removed at the user's request before publication. Draft media and review
artifacts remain outside the website repository. The post was initially excluded from the blog listing; the November 19 revision adds it at the researcher’s request.


## Impact, code explanations and blog listing (November 19)

The researcher requested removal of numerical impact claims, a forthright
explanation of patient-information risk, publication in the blog index, and a
local preview before pushing. The headline, share card, social metadata and
blog index now use “Hacking 4,000 Hospitals.” CVSS score
badges were removed from the article. Technical constants and redacted
counter-field mappings remain as evidence rather than impact totals.

The impact section distinguishes observed dashboard/report metadata and
operational-data disclosure from potential patient-record exposure. An unchecked
patient-report action or a compromised authorized staff account is a conditional
risk, not a verified patient-record retrieval or a demonstrated exploit chain.
Offline guessing still requires a captured submitted hash, username and token.

Five code figures now include semantic explanation strips; selected expressions
are highlighted without changing the original code text. The new post is added
to the visit relay’s allowed-page map, using the existing server-side secret.
No live hospital endpoints or patient records were accessed for this edit.

The final title, with the requested grammar edit, is “Hacking 4,000 Hospitals.” The named
test scope and patient-record evidence boundaries remain explicit in the body.


## Severity labels restored (November 19)

At the researcher’s request, the local draft again shows severity in the section
navigation, introductory CVE references, technical section labels and final CVE
summary. The CERT-In CNA records were retrieved again from the CVE Services API:
CVE-2026-124643 is High / 8.7, CVE-2026-124644 is Medium / 6.9, and
CVE-2026-124645 is High / 8.7. These are CVSS 4.0 base scores, not independently
calculated ratings or product deployment metrics. The revision was previewed
locally at mobile and desktop widths before the researcher approved publication.
