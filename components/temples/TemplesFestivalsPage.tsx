"use client";

import Link from "next/link";
import { FestivalCalendar } from "@/components/home/FestivalCalendar";
import { Reveal } from "@/components/Reveal";
import { MediaImage } from "@/components/media/MediaImage";
import { ProtectedMedia } from "@/components/media/ProtectedMedia";
import { withBase } from "@/lib/base";
import { eventPhase } from "@/lib/dates";
import {
  CULTURE_FESTIVALS,
  festivalThumbPath,
  type CultureFestival,
} from "@/lib/festivals";
import { loadVillageHeritage } from "@/lib/village-heritage";
import { VILLAGE_MAPS_URL } from "@/lib/site";
import type { SiteEvent } from "@/lib/types";
import { useVillageNow } from "@/lib/use-village-now";

const TEMPLE_PHOTOS: Record<string, string> = {
  "Sri Ramalayam": "/brand/rama-navami-hero.webp",
  "Sri Mathamma Temple": "/brand/mathamma-hero.webp",
  "Sri Devapatlamma Temple": "/brand/devapatlamma-hero.webp",
  "Sri Mulasthanamma Temple": "/brand/mulasthanamma.webp",
};

const TEMPLE_CELEBRATIONS: Record<string, string[]> = {
  "Sri Ramalayam": ["Sri Rama Navami", "Daily prayers", "Village gatherings"],
  "Sri Mathamma Temple": ["Mathamma Jathara", "Offerings and processions"],
  "Sri Devapatlamma Temple": ["Devapatlamma Jathara", "Festival prayers"],
  "Sri Shiva Temple": ["Remembered in village tradition"],
  "Sri Mulasthanamma Temple": ["Village worship and seasonal prayers"],
};

const TEMPLE_LOCATION: Record<string, string> = {
  "Sri Ramalayam": "Heart of Reddivaripalli",
  "Sri Mathamma Temple": "Reddivaripalli",
  "Sri Devapatlamma Temple": "Devapatla — closely tied to Reddivaripalli",
  "Sri Shiva Temple": "Reddivaripalli (historic site)",
  "Sri Mulasthanamma Temple": "Reddivaripalli",
};
const TEMPLE_LOCATION_TE: Record<string, string> = {
  "Sri Ramalayam": "రెడ్డివారిపల్లి మధ్యభాగం",
  "Sri Mathamma Temple": "రెడ్డివారిపల్లి",
  "Sri Devapatlamma Temple": "దేవపట్ల — రెడ్డివారిపల్లితో ఆధ్యాత్మిక అనుబంధం",
  "Sri Shiva Temple": "రెడ్డివారిపల్లి (చారిత్రిక స్థలం)",
  "Sri Mulasthanamma Temple": "రెడ్డివారిపల్లి",
};

const TEMPLE_NAME_TE: Record<string, string> = {
  "Sri Ramalayam": "శ్రీ రామాలయం",
  "Sri Mathamma Temple": "శ్రీ మాతమ్మ దేవాలయం",
  "Sri Devapatlamma Temple": "శ్రీ దేవపట్లమ్మ దేవాలయం",
  "Sri Shiva Temple": "శ్రీ శివాలయం",
  "Sri Mulasthanamma Temple": "శ్రీ మూలస్థానమ్మ దేవాలయం",
};

const TEMPLE_NOTE_TE: Record<string, string> = {
  "Sri Ramalayam":
    "గ్రామంలోని ప్రాచీన దేవాలయాలలో ఇది ఒకటి. గ్రామ సంప్రదాయం ప్రకారం ఇది శ్రీ జి. కొండారెడ్డి కాలంలో నిర్మించబడింది. కాలక్రమేణా ఆలయ నిర్మాణం బలహీనపడింది; పెద్ద చెట్ల వేర్లు పునాది, గోడలలోకి వెళ్లి నష్టం చేశాయి. భవిష్యత్ తరాలు కూడా ఇక్కడ పూజలు కొనసాగించాలనే సంకల్పంతో గ్రామస్తులు పునరుద్ధరణకు కట్టుబడి ఉన్నారు.",
  "Sri Shiva Temple":
    "ప్రాచీన శ్రీ శివాలయం ఒకప్పుడు గ్రామంలోని అత్యంత పూజనీయ స్థలాలలో ఒకటి. ఆలయం ధ్వంసమై, శివలింగం మరియు నంది విరిగిన స్థితిలో కనిపించాయి. అసలు నిర్మాణం లేకపోయినా, ఆ ఆధ్యాత్మిక స్మృతి గ్రామస్తుల హృదయాల్లో నిలిచే ఉంది. ఒక రోజు ఈ పవిత్ర స్థలాన్ని మళ్లీ పునరుద్ధరించాలని గ్రామస్థుల ఆశ.",
  "Sri Mulasthanamma Temple":
    "గ్రామానికి ముఖ్యమైన పూజా స్థలాలలో ఇది ఒకటి. గ్రామ సంప్రదాయం ప్రకారం ఇది శ్రీ జి. కొండారెడ్డి కాలంలో స్థాపించబడింది. ప్రస్తుతం స్థిరంగా ఉన్నప్పటికీ, వారసత్వ పరిరక్షణ కోసం భవిష్యత్‌లో పునరుద్ధరణ, అభివృద్ధి చేపట్టాలని గ్రామ సమాజం భావిస్తోంది.",
  "Sri Devapatlamma Temple":
    "గ్రామస్థుల సహకారంతో ఇటీవల పునర్నిర్మించబడిన ఈ ఆలయం, నేడు మంచి స్థితిలో ఉంది. పండుగలు, దైనందిన పూజల కోసం భక్తులు చేరే ప్రధాన ఆధ్యాత్మిక కేంద్రంగా నిలుస్తోంది.",
  "Sri Mathamma Temple":
    "మాతమ్మ అమ్మవారి పట్ల భక్తి వ్యక్తమయ్యే పవిత్ర స్థలం. ప్రార్థనలు, మాతమ్మ జాతర సందర్భంగా గ్రామం మొత్తం ఇక్కడ చేరుతుంది.",
};

const FESTIVAL_NAME_TE: Record<string, string> = {
  Sankranthi: "సంక్రాంతి",
  Ugadi: "ఉగాది",
  Deepavali: "దీపావళి",
  Dasara: "దసరా",
  "Sri Rama Navami": "శ్రీ రామ నవమి",
  "Varalakshmi Vratam": "వరలక్ష్మీ వ్రతం",
  "Vinayaka Chavithi": "వినాయక చవితి",
  "Vana Pandaga": "వన పండుగ",
  "Mathamma Jathara": "మాతమ్మ జాతర",
  "Devapatlamma Jathara": "దేవపట్లమ్మ జాతర",
};

const FESTIVAL_NOTE_TE: Record<string, string> = {
  Sankranthi:
    "పంట పండుగ అయిన సంక్రాంతి సందర్భంగా రంగవల్లులు, కుటుంబ వేడుకలు, గ్రామ ఐక్యత కలిసి ప్రకాశిస్తాయి.",
  Ugadi:
    "తెలుగు నూతన సంవత్సర వేడుక — మామిడి తొరణాలు, ఉగాది పచ్చడి, కొత్త ప్రారంభానికి ప్రార్థనలు.",
  Deepavali:
    "దీపాలు, రంగవల్లులు, కుటుంబ ఆనందంతో గ్రామమంతా వెలుగుల పండుగగా మెరిసిపోతుంది.",
  Dasara:
    "నవరాత్రుల భక్తి వాతావరణం తర్వాత దసరా రోజున గ్రామం ఒకటిగా జరుపుకునే ప్రత్యేక సమయం.",
  "Sri Rama Navami":
    "శ్రీ రాముని కృపను స్మరిస్తూ రామాలయంలో భజనలు, పూజలు, గ్రామ సమిష్టి ప్రార్థనలు జరుగుతాయి.",
  "Varalakshmi Vratam":
    "లక్ష్మీదేవి అనుగ్రహం కోసం కుటుంబాలు ఆచరించే పవిత్ర వ్రతం.",
  "Vinayaka Chavithi":
    "వినాయక విగ్రహాలు, ప్రార్థనలు, కుటుంబ సమాగమాలతో భక్తి పర్వదినం.",
  "Vana Pandaga":
    "శ్రీ జి. కొండారెడ్డి ప్రారంభించిన ప్రత్యేక ఆచారం — సమయానికి వర్షాలు కోసం గ్రామస్థులు కలసి ప్రార్థించి, కలిసి వంట చేసి రెండు రోజులు వేడుకగా జరుపుకుంటారు.",
  "Mathamma Jathara":
    "మాతమ్మ అమ్మవారి జాతరలో డప్పులు, సమర్పణలు, గ్రామ భక్తి ఒకే వేదికపై కలుస్తాయి.",
  "Devapatlamma Jathara":
    "శ్రీ దేవపట్లమ్మ అమ్మవారి జాతర సందర్భంగా కుటుంబాలు, భక్తి, గ్రామ ఐక్యత ఒకటవుతాయి.",
};

const CULTURAL_NOTE_TE: Record<string, string> = {
  "Mahabharata Natakam":
    "మహాభారత కథల ఆధారంగా గ్రామంలో ప్రదర్శించే సంప్రదాయ నాటకాలు.",
  "Kolla Pandem": "గ్రామస్థులు ఆసక్తిగా చూసే సంప్రదాయ కోళ్ల పోటీలు.",
  Jallikattu: "ఉత్సాహంగా నిర్వహించే పశువులతో సంబంధమున్న సంప్రదాయ క్రీడా వేడుక.",
  "Cow Competitions":
    "పశుసంవర్ధక జీవన విధానానికి గౌరవంగా నిర్వహించే సంప్రదాయ పోటీలు.",
  "Vana Bhojanalu":
    "కుటుంబాలు కలిసి ఆహారం, ఆటలు, ఆనందంతో ప్రకృతిలో గడిపే సామూహిక వనభోజనాలు.",
};

function festivalForName(name: string): CultureFestival | undefined {
  const n = name.toLowerCase().replace("sankranthi", "sankranti");
  return CULTURE_FESTIVALS.find((f) => {
    const title = f.title.toLowerCase();
    return n === title || n.includes(title) || title.includes(n);
  });
}

export function TemplesFestivalsPage({
  upcoming,
  liveSlugs,
  festivals = [],
  locale = "en",
}: {
  upcoming: SiteEvent[];
  liveSlugs: string[];
  festivals?: SiteEvent[];
  locale?: "en" | "te";
}) {
  const isTe = locale === "te";
  const heritage = loadVillageHeritage();
  const labels = {
    faithEyebrow: isTe ? "గ్రామ విశ్వాసం" : "Faith of the village",
    photoPending: isTe
      ? "నిజమైన ఆలయ ఫోటో లభించిన వెంటనే ఇక్కడ చూపిస్తాము"
      : "Authentic temple photograph will be added when available",
    openLocation: isTe ? "లొకేషన్ తెరవండి" : "Open location",
    villageCalendar: isTe ? "గ్రామ క్యాలెండర్" : "Village calendar",
    festivalCalendar: isTe ? "పండుగల క్యాలెండర్" : "Festival calendar",
    festivalLede: isTe
      ? "రెడ్డివారిపల్లిలో జరుపుకునే పండుగలు, జాతరల తేదీలు."
      : "Festivals and jatharas as they are celebrated in Reddivaripalli — not a general religious calendar.",
    upcomingOngoing: isTe ? "రానున్నవి & జరుగుతున్నవి" : "Upcoming & ongoing",
    completed: isTe ? "పూర్తైనవి" : "Completed",
    upcomingFestivals: isTe ? "రానున్న పండుగలు" : "Upcoming festivals",
    upcomingFestivalsLede: isTe
      ? "ఈ ఏడాది రెడ్డివారిపల్లిలో తెలిసిన పండుగ తేదీలు."
      : "Dates and gatherings as they are known in Reddivaripalli this year.",
    celebratedTogether: isTe ? "కలిసే జరుపుకుంటాం" : "Celebrated together",
    previousCelebrations: isTe ? "గత వేడుకల ఫోటోలు →" : "Previous celebrations →",
    villagePractices: isTe ? "గ్రామ ఆచారాలు" : "Village practices",
    templesTitle: isTe ? "పవిత్ర దేవాలయాలు" : heritage.temples.title,
    templesLede: isTe
      ? "రెడ్డివారిపల్లి ఆధ్యాత్మిక జీవితం దాని పురాతన, గౌరవనీయ దేవాలయాల చుట్టూ తిరుగుతుంది."
      : heritage.temples.lede,
    templesPreservation: isTe
      ? "కాలక్రమేణా కొన్ని దేవాలయాలు వయస్సు, ప్రకృతి ప్రభావం, మరియు ఇతర కారణాలతో దెబ్బతిన్నాయి. ఈ వారసత్వాన్ని భవిష్యత్ తరాలకు అందించాలనే సంకల్పంతో గ్రామస్థులు పరిరక్షణకు కట్టుబడి ఉన్నారు."
      : heritage.temples.preservationIntro,
    festivalsTitle: isTe ? "గ్రామ పండుగలు" : heritage.festivals.title,
    festivalsLede: isTe
      ? "రెడ్డివారిపల్లిలో గ్రామ ప్రజలు కలిసి జరుపుకునే పండుగలు, జాతరలు, మరియు వారసత్వ ఆచారాల సంకలనం."
      : heritage.festivals.lede,
    culturalTitle: isTe ? "సాంస్కృతిక కార్యక్రమాలు" : heritage.culturalEvents.title,
    culturalLede: isTe
      ? "రెడ్డివారిపల్లి సంప్రదాయ సాంస్కృతిక కార్యక్రమాలకు పేరుగాంచింది. వీటిలో అనేక ఆచారాలు శ్రీ జి. కొండారెడ్డి ప్రోత్సాహంతో ప్రారంభమై నేటికీ కొనసాగుతున్నాయి."
      : heritage.culturalEvents.lede,
  };
  const now = useVillageNow();
  const festivalEvents = festivals.filter((event) => event.category === "festival");
  const upcomingFestivals = festivalEvents
    .filter((event) => eventPhase(event.date, event.endDate, now) !== "completed")
    .sort((a, b) => a.date.localeCompare(b.date));
  const completedFestivals = festivalEvents
    .filter((event) => eventPhase(event.date, event.endDate, now) === "completed")
    .sort((a, b) => b.date.localeCompare(a.date));
  const nextFestivals = upcoming.filter(
    (event) =>
      event.category === "festival" &&
      eventPhase(event.date, event.endDate, now) !== "completed",
  );

  return (
    <div className="temples-page">
      <Reveal className="section" id="temples">
        <div className="section-head">
          <div>
            <p className="eyebrow">{labels.faithEyebrow}</p>
            <h2>{labels.templesTitle}</h2>
            <p className="lede">{labels.templesLede}</p>
          </div>
        </div>
        <p className="muted">{labels.templesPreservation}</p>
        <div className="temple-card-grid">
          {heritage.temples.items.map((temple) => {
            const photo = TEMPLE_PHOTOS[temple.name];
            const celebrations = TEMPLE_CELEBRATIONS[temple.name] ?? [];
            return (
              <article key={temple.name} className="temple-card">
                {photo ? (
                  <div className="temple-card-photo">
                    <ProtectedMedia>
                      <img
                        src={withBase(photo)}
                        alt={temple.name}
                        width={640}
                        height={400}
                        loading="lazy"
                        draggable={false}
                      />
                    </ProtectedMedia>
                  </div>
                ) : (
                  <div className="temple-card-photo temple-card-photo--empty">
                    <img
                      src={withBase("/logo/logo-mark.webp")}
                      alt={`Authentic photo pending for ${temple.name}`}
                      width={220}
                      height={220}
                      loading="lazy"
                      decoding="async"
                    />
                    <span>{labels.photoPending}</span>
                  </div>
                )}
                <div className="temple-card-body">
                  <h3>{isTe ? TEMPLE_NAME_TE[temple.name] || temple.name : temple.name}</h3>
                  <p className="eyebrow">
                    {isTe
                      ? TEMPLE_LOCATION_TE[temple.name] || "రెడ్డివారిపల్లి"
                      : TEMPLE_LOCATION[temple.name] ?? "Reddivaripalli"}
                  </p>
                  <p className="muted">
                    {isTe ? TEMPLE_NOTE_TE[temple.name] || temple.note : temple.note}
                  </p>
                  {celebrations.length ? (
                    <ul className="temple-traditions">
                      {celebrations.map((item) => (
                        <li key={item}>{isTe ? FESTIVAL_NAME_TE[item] || item : item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {temple.name === "Sri Ramalayam" ? (
                    <a
                      className="btn ghost"
                      href={VILLAGE_MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {labels.openLocation}
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </Reveal>

      {festivalEvents.length ? (
        <Reveal className="section" id="upcoming-festivals">
          <div className="section-head">
            <div>
              <p className="eyebrow">{labels.villageCalendar}</p>
              <h2>{labels.festivalCalendar}</h2>
              <p className="lede">{labels.festivalLede}</p>
            </div>
          </div>
          {upcomingFestivals.length ? (
            <>
              <p className="eyebrow">{labels.upcomingOngoing}</p>
              <FestivalCalendar festivals={upcomingFestivals} liveSlugs={liveSlugs} embedded />
            </>
          ) : null}
          {completedFestivals.length ? (
            <>
              <p className="eyebrow">{labels.completed}</p>
              <FestivalCalendar festivals={completedFestivals} liveSlugs={liveSlugs} embedded />
            </>
          ) : null}
        </Reveal>
      ) : nextFestivals.length ? (
        <Reveal className="section" id="upcoming-festivals">
          <div className="section-head">
            <div>
              <p className="eyebrow">{labels.villageCalendar}</p>
              <h2>{labels.upcomingFestivals}</h2>
              <p className="lede">{labels.upcomingFestivalsLede}</p>
            </div>
          </div>
          <FestivalCalendar festivals={nextFestivals} liveSlugs={liveSlugs} embedded />
        </Reveal>
      ) : null}

      <Reveal className="section" id="festivals">
        <div className="section-head">
          <div>
            <p className="eyebrow">{labels.celebratedTogether}</p>
            <h2>{labels.festivalsTitle}</h2>
            <p className="lede">{labels.festivalsLede}</p>
          </div>
        </div>
        <div className="festival-card-grid">
          {heritage.festivals.items.map((item) => {
            const fest = festivalForName(item.name);
            const href = fest ? `/${fest.slug}/` : "/gallery/";
            const photo = fest
              ? festivalThumbPath(fest.folder)
              : "/brand/village-aerial.webp";
            return (
              <article key={item.name} className="festival-card">
                <Link href={href} className="festival-card-link">
                  <MediaImage
                    src={photo}
                    alt={`${item.name} in Reddivaripalli`}
                    width={640}
                    height={360}
                    loading="lazy"
                    fallback="/logo/logo-mark.webp"
                  />
                  <div>
                    <h3>{isTe ? FESTIVAL_NAME_TE[item.name] || item.name : item.name}</h3>
                    <p className="muted">{isTe ? FESTIVAL_NOTE_TE[item.name] || item.note : item.note}</p>
                    {fest ? (
                      <span className="festival-card-cta">
                        {labels.previousCelebrations}
                      </span>
                    ) : null}
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </Reveal>

      <Reveal className="section" id="traditions">
        <div className="section-head">
          <div>
            <p className="eyebrow">{labels.villagePractices}</p>
            <h2>{labels.culturalTitle}</h2>
            <p className="lede">{labels.culturalLede}</p>
          </div>
        </div>
        <div className="village-heritage-list-grid">
          {heritage.culturalEvents.items.map((item) => (
            <article key={item.name} className="village-heritage-panel">
              <h3>{isTe ? FESTIVAL_NAME_TE[item.name] || item.name : item.name}</h3>
              <p className="muted">{isTe ? CULTURAL_NOTE_TE[item.name] || item.note : item.note}</p>
            </article>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
