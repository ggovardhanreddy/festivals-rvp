import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { withBase } from "@/lib/base";
import {
  VILLAGE_NAME,
  VILLAGE_ALSO_KNOWN_AS,
  SITE_NAME,
  VILLAGE_ADDRESS_LINE,
} from "@/lib/site";

const ABOUT_IMAGE = "/brand/village-aerial.webp";

export function AboutTeaser() {
  return (
    <Reveal className="section home-about" id="about">
      <div className="about-teaser">
        <div className="about-teaser-copy">
          <p className="eyebrow">Our village</p>
          <h2>About {VILLAGE_NAME}</h2>
          <p className="lede">
            Welcome to {VILLAGE_NAME} — also known as {VILLAGE_ALSO_KNOWN_AS} —
            a village rooted in heritage, greenery, and the warmth of people who
            still greet one another by name.
          </p>
          <div className="about-teaser-body">
            <p>
              Nestled in Annamayya District, Andhra Pradesh, our home carries a
              rich history shaped by farmers, temple bells, and generations who
              chose to stay close to the land. Fields and trees frame daily life;
              the Ramalayam stands as a quiet centre of faith and gathering.
            </p>
            <p>
              What makes this place special is not only its beauty, but its
              people — welcoming, hardworking, and bound by strong community
              values. We celebrate cultural traditions with sincerity: Sankranthi
              harvests, Vinayaka beginnings, Jatharas, Sri Rama Navami, and the
              joyful evenings that follow. Agriculture still guides the seasons,
              while unity and harmony keep households connected through every
              festival and every ordinary day.
            </p>
            <p>
              {SITE_NAME} exists to honour that identity — preserving memories as
              we grow, so the next generation can feel the same pride in{" "}
              {VILLAGE_ALSO_KNOWN_AS} that we carry today. {VILLAGE_ADDRESS_LINE}.
            </p>
          </div>
          <div className="btn-row">
            <Link className="btn" href="/developments/">
              Village developments
            </Link>
            <Link className="btn ghost" href="/contact/">
              Contact us
            </Link>
          </div>
        </div>
        <div className="about-teaser-media">
          <img
            src={withBase(ABOUT_IMAGE)}
            alt={`${VILLAGE_NAME} from above`}
            width={960}
            height={720}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </Reveal>
  );
}
