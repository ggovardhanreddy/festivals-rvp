import { Reveal } from "./Reveal";
import { VILLAGE_STORY } from "@/lib/village";

export function VillageStory({ compact = false }: { compact?: boolean }) {
  return (
    <Reveal className="section village-story">
      <div className="section-head">
        <div>
          <p className="eyebrow">{VILLAGE_STORY.eyebrow}</p>
          <h2>{VILLAGE_STORY.title}</h2>
          <p className="lede">{VILLAGE_STORY.lede}</p>
        </div>
      </div>
      <div className={compact ? "story-grid compact" : "story-grid"}>
        {VILLAGE_STORY.chapters.map((chapter) => (
          <article key={chapter.title} className="story-chapter">
            <h3>{chapter.title}</h3>
            <p className="muted">{chapter.body}</p>
          </article>
        ))}
      </div>
    </Reveal>
  );
}
