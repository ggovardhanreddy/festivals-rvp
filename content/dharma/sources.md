# Verified source positions for the Sanatana Dharma & Telugu Culture sections

Established 31 August 2026 by reading each site's own copyright, terms or licence
page. This file is the reasoning behind `content/resources/sources.json` and
behind every "link, don't copy" decision in `lib/dharma/`.

## The only source we may host from

**Telugu Wikisource** (te.wikisource.org) — CC BY-SA 4.0 / public domain. The
only source that both grants a free licence and holds real Telugu-language
scripture: Potana's Bhagavatam, Andhra Vishnu Purana, Bhagavad Gita, Vishnu
Sahasranama. ShareAlike is viral, so a page that embeds this text must itself be
CC BY-SA 4.0.

**⚠️ Wikisource is not proof of public domain.** It hosts Sri Sri's
*Maha Prasthanam* in full, which is a copyright violation — Sri Sri died in 1983,
so his work is protected in India until 1 January 2044. Wikisource can only pass
on rights it holds, and it does not hold those. **Always check the author's death
year independently before copying anything from Wikisource.** The collector
refuses te.wikisource paths under the Sri Sri category for exactly this reason.

## Link only — never copy

| Source | Why |
|---|---|
| **TTD / Tirumala** (tirumala.org, ebooks.tirumala.org) | "Copyright © 2015-2026 Tirumala Tirupati Devasthanams(TTD), All Rights Reserved". ~4,000 free-to-read Telugu titles — the best catalogue for this audience — but free to read is not free to republish, and TTD actively enforces. Deep-link, and write for permission. |
| **Andhra Bharati** (andhrabharati.com) | No terms page at all, and it mixes public-domain classics with in-copyright authors (Viswanatha Satyanarayana d. 1976, Rayaprolu Subba Rao d. 1984, Puttaparthi Narayanacharyulu d. 1990) with no labelling. Superb Telugu text; unlicensed digital edition. |
| **sanskritdocuments.org** | FAQ permits copying "for personal studies, to learn, and to teach" but prohibits copying to "promote your own web-site, commercial or not". Its "Telugu" is Sanskrit in Telugu script, not Telugu translation. |
| **vedabase.io** | "Content used with permission of © The Bhaktivedanta Book Trust International, Inc. All rights reserved." |
| **Gita Supersite** (gitasupersite.in) | No terms, no licence, no robots.txt. Its Telugu is a *script* toggle; translations are Hindi and English only. |
| **Gita Press** (gitapress.org) | Commercial publisher; terms page unreadable; no Telugu. |
| **annamayya.org** (Annamacharya Bhavana Vahini) | "© 2026 Annamacharya Bhavana Vahini. All Rights Reserved." Worth writing to — a credible institution and a plausible grantor. |
| **archive.org** | A hosting platform, not a rights clearinghouse: "The Internet Archive does not make guarantees as to the copyright status of items." Redistribute an item only when the author died 1965 or earlier, **or** the item page shows an explicit CC/PD licence. |

## Sites we must not fetch at all

**sacred-texts.com** and **annamayya.org** both serve `Disallow: /` to ClaudeBot
in robots.txt. sacred-texts also caps robots at one text daily and forbids bulk
downloading. The collector honours robots.txt, so these are link-only entries
with `method: "manual"`.

## Public domain in India as of 2026 — authors who died 1965 or earlier

Annamayya (d. 1503) · Nannayya (11th c.) · Tikkana (13th c.) · Errana (14th c.) ·
Potana (15th c.) · Molla (16th c.) · Vemana (pre-1800) · Bhakta Ramadasu
(d. c. 1688) · Tyagaraja (d. 1847) · Gurajada Apparao (d. 1915) · Kandukuri
Veeresalingam (d. 1919) · Veturi Prabhakara Sastri (d. 1950 — his Annamacharya
transcriptions became free on 1 Jan 2011).

## NOT public domain — do not publish their text

| Author | Died | Public domain from |
|---|---|---|
| Gurram Jashuva | 1971 | 1 Jan 2032 |
| Viswanatha Satyanarayana | 1976 | 1 Jan 2037 |
| Devulapalli Krishnasastri | 1980 | 1 Jan 2041 |
| **Sri Sri** (Srirangam Srinivasa Rao) | **15 Jun 1983** | **1 Jan 2044** |
| Rayaprolu Subba Rao | 1984 | 1 Jan 2045 |
| Puttaparthi Narayanacharyulu | 1990 | 1 Jan 2051 |

India has **no renewal system** (Copyright Act 1957 s.22; registration is
optional per *Sanjay Soya v. Narayani Trading*), so the US question "was it
renewed?" does not apply. The term depends only on the year of death, which is
why *Prabhava* (1928) is protected exactly as long as *Maha Prasthanam* (1950).

Anything first published **after** the author's death runs 60 years from
publication instead (s.24), so posthumous compilations can run past these dates.

## Sri Sri — what the site may and may not carry

**May:** dates and biography, a bibliography of titles and years, his awards,
original criticism written by the village, short attributed quotations inside
genuine critical discussion (s.52(1)(a)(ii)), links, and YouTube embeds.

**May not, until 1 January 2044:** any poem in whole, substantial extracts,
scans, PDFs, hosted audio of recitations, or downloads.

Note s.52(1)(a)(i)'s "private or personal use" does **not** cover publishing on
a public website — that is the most common misreading of Indian fair dealing.

## Devotional music — three copyrights stack

1. The **composition/lyric** — often 15th century, public domain.
2. Any **20th-century musical setting or notation** — a fresh musical work,
   protected 60 years past its arranger's death.
3. The **sound recording** — a fresh right under s.27, 60 years from the year of
   publication, owned by the label. Performers' rights add 50 years (s.38).

So M. S. Subbulakshmi's 1979 HMV *Sri Annamacharya Samkirtanas* is in copyright
until 31 December 2039 even though Annamayya died in 1503. **Embed YouTube via
the standard iframe; never download or re-host audio.**

YouTube's Required Minimum Functionality rules bind our embeds: viewport at
least 200×200, no playback before the player is visible, no overlays in front of
the player, no modifications to the player.

**The one clean path to free devotional audio is to record it ourselves** —
village singers performing a public-domain composition (Annamayya, Ramadasu,
Tyagaraja, Potana), released under a CC licence. Every layer is then free or
ours, and Reddivaripalli becomes a contributor to a genuinely scarce pool.
