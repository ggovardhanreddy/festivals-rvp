# Reddivaripalli redesign — master implementation tracker

**Updated:** 4 September 2026  
**Production status:** Not launched. Do not mark any row **Completed** until Definition of Done is satisfied.

This file is the repo copy of the ownership tracker from the village-website redesign brief (sections 17–24). The living view is the canvas beside chat.

**Golden rule:** when in doubt, remove it. Success is a smaller, clearer digital home for Reddivaripalli — not a portal.

## Status legend

| Mark | Meaning |
| ---- | ------- |
| Not Started | Stage 0 — work has not begun |
| In Progress | Stages 1–6 — audit through testing |
| Review | Stage 7 — waiting on the assigned owner |
| Approved | Stage 8 — owner signed off for release |
| Completed | Stage 10 — reviewed, tested, approved, and live |

A task is **not** Completed because development finished. Completed requires owner review, final content, approved design, working functionality, mobile/desktop testing, privacy checks, SEO where applicable, production deploy where applicable, and final owner approval.

## Owners (interim)

Named people have not been assigned. Until they are, **one Project Owner** holds every role below. Replace the interim label when a person is named.

| Owner | Responsibility |
| ----- | -------------- |
| Project Owner | Priorities and final approval |
| Content Owner | Village history, descriptions, stories |
| Community/People Owner | People, families, elders |
| Heritage Owner | Temples, traditions, festivals |
| Development Owner | Village works and progress |
| Gallery Owner | Photos, captions, categories |
| Design Owner | UI, branding, navigation |
| Technical Owner | Build, hosting, security, deploy |
| SEO Owner | Titles, sitemap, redirects |
| QA Owner | Testing and quality |
| Privacy Reviewer | Public personal information |

## Master tracker

| ID | Workstream | Task | Owner | Priority | Stage | Status | Dependency | Completion criteria |
| -- | ---------- | ---- | ----- | -------- | ----- | ------ | ---------- | ------------------- |
| 01 | Audit | Review all existing pages | Project Owner (interim) | High | 7 Review | Review | None | All pages classified KEEP / MERGE / MOVE / REMOVE |
| 02 | Navigation | Implement new navigation | Design Owner (interim) | High | 5 Development | In Progress | 01 | Seven-item menu live and approved |
| 03 | Content | Rewrite village introduction | Content Owner (interim) | High | 3 Content | In Progress | 01 | Introduction approved by Content Owner |
| 04 | History | Clean and migrate history | Content Owner (interim) | High | 3 Content | In Progress | 01 | History page approved; verified vs memory labelled |
| 05 | People | Consolidate members/directory | Community Owner (interim) | High | 5 Development | In Progress | 01 | One People section; duplicates removed; privacy process visible |
| 06 | Temples | Build temple section | Heritage Owner (interim) | High | 5 Development | In Progress | 01 | Temple profiles approved |
| 07 | Festivals | Build festival section | Heritage Owner (interim) | High | 5 Development | In Progress | 01 | Festival calendar approved |
| 08 | Development | Build project section | Development Owner (interim) | High | 5 Development | In Progress | 01 | Project cards with status, dates, updates |
| 09 | Gallery | Consolidate galleries | Gallery Owner (interim) | Medium | 5 Development | In Progress | 01 | One gallery; captions and old photos preserved |
| 10 | Design | Homepage redesign | Design Owner (interim) | High | 5 Development | In Progress | 02 | Homepage approved |
| 11 | Development | Implement website | Technical Owner (interim) | High | 5 Development | In Progress | 02–10 | Approved designs implemented |
| 12 | SEO | Configure SEO and redirects | SEO Owner (interim) | Medium | 5 Development | In Progress | 11 | Sitemap and redirects verified; search engines not yet submitted |
| 13 | QA | Responsive testing | QA Owner (interim) | High | 6 Testing | Not Started | 11 | No critical issues on mobile, tablet, desktop |
| 14 | Review | Final content review | Project Owner (interim) | High | 7 Review | Not Started | 12–13 | Final approval received |
| 15 | Launch | Production deployment | Technical Owner (interim) | High | 9 Live | In Progress | 14 | Website successfully deployed |

**Counts (honest):** 0 Completed · 0 Approved · 1 in Review (audit classification, awaiting owner sign-off) · 12 In Progress (including production deploy awaiting QA and final approval) · 2 Not Started (full device QA, final review).

## Redirect map (Cloudflare Pages `_redirects`)

Old URLs still generate locally so bookmarks do not 404 in static export. Production applies 301s.

| Old URL | New URL |
| ------- | ------- |
| `/timeline/`, `/timeline` | `/about/` |
| `/directory/`, `/directory` | `/members/` |
| `/heritage/`, `/heritage` | `/gallery/` |
| `/events/`, `/events` | `/temples/` |
| `/years/`, `/years` | `/gallery/` |
| `/dharma/`, `/dharma/*` | `/temples/` |
| `/telugu-culture/`, `/telugu-culture/*` | `/stories/` |

Retired education/jobs/kids URLs already map into village sections. See `public/_redirects`.

## Open gaps before approval

These block Completed / Launch even though the new structure is in the codebase:

- Project Owner has not approved content, design, or launch.
- Full mobile / tablet / desktop QA pass has not been signed off.
- People lists are not fully de-duplicated across members, directory, and heritage notables.
- Development has one project and no verified before/after photograph pair.
- Gallery captions and historical photo dates are incomplete.
- Sitemap ping to search engines ran after this deploy (IndexNow submitted; Google/Bing sitemap ping endpoints returned 404/410). Owner still needs to submit the sitemap in Search Console if not already done.
- Production deploy, SSL/domain smoke test, and post-launch 404 monitoring are not done.
- Fun Fest remains as a private URL (`/fun-trips/`) for members; it is no longer in public navigation.

## Acceptance test (first-time visitor)

| # | Question | Where to look | Ready for owner review? |
| - | -------- | ------------- | ----------------------- |
| 1 | Where is Reddivaripalli? | Home contact + `/contact/` + map | Yes, structurally |
| 2 | What is the history? | Home history highlight + `/about/#history` | Yes, structurally — content still needs owner review |
| 3 | Temples and festivals? | `/temples/` | Yes, structurally |
| 4 | People and communities? | `/members/` | Yes, structurally — privacy process added; consent still needs Privacy Reviewer |
| 5 | What development has happened? | `/developments/` | Partial — one project |
| 6 | What does the village look like? | Home gallery preview + `/gallery/` | Yes, structurally |
| 7 | Old photos, stories, memories? | `/stories/` + `/gallery/` | Yes, structurally |
| 8 | How to contact the village? | `/contact/` | Yes, structurally |

## Definition of Done

Do not mark a row Completed until:

- [ ] Assigned owner has reviewed it
- [ ] Content is final
- [ ] Design is approved
- [ ] Functionality works
- [ ] Mobile/desktop testing is complete
- [ ] No critical defects remain
- [ ] Required privacy checks are complete
- [ ] SEO requirements are complete where applicable
- [ ] Production deployment is complete where applicable
- [ ] Final owner approval has been received
