"use client";

import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { withLocale } from "@/lib/i18n/config";
import {
  isPlayable,
  mediaUrl,
  text,
  type Rhyme,
  type ScienceTopic,
  type Story,
  type VideoItem,
} from "@/lib/learning";
import { AudioPlayer } from "./AudioPlayer";
import { VideoPlayer } from "./VideoPlayer";
import { StatusNotice } from "./StatusNotice";

function Source({ item }: { item: { provenance?: { source: string; sourceUrl: string; lastVerified: string; reviewer: string | null } } }) {
  const { t } = useUiLang();
  const p = item.provenance;
  if (!p) return null;
  return (
    <p className="detail-source">
      <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">
        {p.source}
      </a>
      {" · "}
      {t("gov.verified", undefined, { date: p.lastVerified })}
      {p.reviewer ? ` · ${t("kids.reviewedBy", undefined, { name: p.reviewer })}` : ""}
    </p>
  );
}

function Back({ href, labelKey }: { href: string; labelKey: string }) {
  const { t, lang } = useUiLang();
  return (
    <p className="eyebrow">
      <Link href={withLocale(href, lang)}>{t(labelKey)}</Link>
    </p>
  );
}

/** A story: read it, or listen to it where a narration may be published. */
export function StoryDetail({ story }: { story: Story }) {
  const { t, lang } = useUiLang();
  const body = text(story.body, lang);
  return (
    <main className="page detail-page">
      <div className="section">
        <Back href="/kids/stories/" labelKey="kids.stories" />
        <h1>{text(story.title, lang)}</h1>
        <p className="lede">{text(story.description, lang)}</p>
        {story.readingMinutes ? (
          <p className="muted">{t("kids.readingTime", undefined, { minutes: story.readingMinutes })}</p>
        ) : null}
      </div>

      {isPlayable(story.audio) ? (
        <div className="section">
          <h2 className="detail-h2">{t("kids.listen")}</h2>
          <AudioPlayer
            src={mediaUrl(story.audio)}
            label={text(story.title, lang)}
            captions={story.audio.captions}
          />
        </div>
      ) : null}

      <div className="section detail-body">
        {body ? (
          body.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)
        ) : (
          <StatusNotice status={story.status} />
        )}
      </div>

      <div className="section">
        <Source item={story} />
      </div>
    </main>
  );
}

/** A rhyme: the recording where one exists, and always the words. */
export function RhymeDetail({ rhyme }: { rhyme: Rhyme }) {
  const { t, lang } = useUiLang();
  const lyrics = text(rhyme.lyrics, lang);
  return (
    <main className="page detail-page">
      <div className="section">
        <Back href="/kids/rhymes/" labelKey="kids.rhymes" />
        <h1>{text(rhyme.title, lang)}</h1>
        <p className="lede">{text(rhyme.description, lang)}</p>
      </div>

      {isPlayable(rhyme.video) ? (
        <div className="section">
          <VideoPlayer media={rhyme.video} title={text(rhyme.title, lang)} poster={rhyme.image} />
        </div>
      ) : null}

      {isPlayable(rhyme.audio) ? (
        <div className="section">
          <AudioPlayer
            src={mediaUrl(rhyme.audio)}
            label={text(rhyme.title, lang)}
            captions={rhyme.audio.captions}
          />
        </div>
      ) : null}

      {!isPlayable(rhyme.audio) && !isPlayable(rhyme.video) ? (
        <div className="section">
          <StatusNotice
            status={
              rhyme.status === "published" ? "awaiting-permission" : rhyme.status
            }
          />
        </div>
      ) : null}

      <div className="section">
        <h2 className="detail-h2">{t("kids.lyrics")}</h2>
        {lyrics ? (
          <pre className="detail-lyrics">{lyrics}</pre>
        ) : (
          <StatusNotice status={rhyme.status} />
        )}
      </div>

      <div className="section">
        <Source item={rhyme} />
      </div>
    </main>
  );
}

/** A science topic: the explanation, and something to actually try. */
export function ScienceDetail({ topic }: { topic: ScienceTopic }) {
  const { t, lang } = useUiLang();
  const explanation = text(topic.explanation, lang);
  return (
    <main className="page detail-page">
      <div className="section">
        <Back href="/kids/science/" labelKey="kids.science" />
        <h1>{text(topic.title, lang)}</h1>
        <p className="lede">{text(topic.description, lang)}</p>
        {topic.reviewedBy ? (
          <p className="detail-reviewed">
            {t("kids.reviewedBy", undefined, { name: topic.reviewedBy })}
          </p>
        ) : (
          <StatusNotice status="awaiting-teacher-review" />
        )}
      </div>

      {isPlayable(topic.video) ? (
        <div className="section">
          <VideoPlayer media={topic.video} title={text(topic.title, lang)} poster={topic.image} />
        </div>
      ) : null}

      <div className="section detail-body">
        {explanation ? <p>{explanation}</p> : <StatusNotice status={topic.status} />}
      </div>

      {topic.activity ? (
        <div className="section detail-activity">
          <h2 className="detail-h2">{text(topic.activity.title, lang)}</h2>
          {topic.activity.supervision ? (
            <p className="detail-supervision">{t("kids.science.supervision")}</p>
          ) : null}
          {topic.activity.materials?.length ? (
            <>
              <h3>{t("kids.science.materials")}</h3>
              <ul>
                {topic.activity.materials.map((m, i) => (
                  <li key={i}>{text(m, lang)}</li>
                ))}
              </ul>
            </>
          ) : null}
          <h3>{t("kids.science.steps")}</h3>
          <ol>
            {topic.activity.steps.map((s, i) => (
              <li key={i}>{text(s, lang)}</li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="section">
        <Source item={topic} />
      </div>
    </main>
  );
}

/** A video, with its transcript and whatever is genuinely related. */
export function VideoDetail({ video, related }: { video: VideoItem; related: VideoItem[] }) {
  const { t, lang } = useUiLang();
  const transcript = text(video.transcript, lang);
  return (
    <main className="page detail-page">
      <div className="section">
        <Back href="/kids/videos/" labelKey="kids.videos" />
        <h1>{text(video.title, lang)}</h1>
        <p className="lede">{text(video.description, lang)}</p>
      </div>

      <div className="section">
        {isPlayable(video.media) ? (
          <VideoPlayer media={video.media} title={text(video.title, lang)} poster={video.image} />
        ) : (
          <StatusNotice
            status={
              video.status === "published" ? "awaiting-permission" : video.status
            }
          />
        )}
      </div>

      {transcript ? (
        <div className="section">
          <h2 className="detail-h2">{t("kids.transcript")}</h2>
          <pre className="detail-lyrics">{transcript}</pre>
        </div>
      ) : null}

      {related.length ? (
        <div className="section">
          <h2 className="detail-h2">{t("kids.related")}</h2>
          <ul className="libgrid">
            {related.map((r) => (
              <li key={r.id}>
                <Link className="libcard" href={withLocale(`/kids/videos/${r.slug}/`, lang)}>
                  <span className="libcard-body">
                    <strong className="libcard-title">{text(r.title, lang)}</strong>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="section">
        <Source item={video} />
      </div>
    </main>
  );
}
