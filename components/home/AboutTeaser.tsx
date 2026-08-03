import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { withBase } from "@/lib/base";
import {
  VILLAGE_NAME,
  VILLAGE_ALSO_KNOWN_AS,
  SITE_NAME,
  OFFICIAL_MISSION,
  VILLAGE_ADDRESS,
  VILLAGE_ADDRESS_LINE,
} from "@/lib/site";

const ABOUT_IMAGE = "/brand/village-aerial.webp";

export function AboutTeaser() {
  return (
    <Reveal className="section home-about" id="about">
      <div className="about-teaser">
        <div className="about-teaser-copy">
          <p className="eyebrow">{VILLAGE_ALSO_KNOWN_AS}</p>
          <h2>About {VILLAGE_ALSO_KNOWN_AS}</h2>
          <p className="lede">{OFFICIAL_MISSION}</p>
          <div className="about-teaser-body">
            <p>
              Also known as {VILLAGE_NAME}, the village is known for its rich
              cultural heritage, strong community values, agricultural
              traditions, beautiful greenery, annual festivals, and the warm
              hospitality of its residents. Fields and temple bells frame daily
              life, while Sri Ramalayam stands as a quiet centre of faith and
              gathering.
            </p>
            <p>
              Families celebrate Vinayaka Chavithi, Varalakshmi Vratam,
              Sankranti, Sri Rama Navami, Mathamma Jathara, Devapatlamma
              Jathara, Ugadi, Deepavali, and Dasara with sincerity — traditions
              that bind the {VILLAGE_ADDRESS.region} and Sambepalle together
              across generations.
            </p>
            <p>
              This portal is built to still be useful in ten years: annual
              archives, heritage records, developments, and community services.
              {SITE_NAME} stewards the site so the next generation can feel the
              same pride in {VILLAGE_ALSO_KNOWN_AS} that we carry today.
            </p>
            <p className="muted">
              {VILLAGE_ADDRESS_LINE}. Part of {VILLAGE_ADDRESS.district},{" "}
              {VILLAGE_ADDRESS.state}, India.
            </p>
          </div>
          <div className="btn-row">
            <Link className="btn" href="/heritage/">
              Heritage
            </Link>
            <Link className="btn ghost" href="/contact/">
              Contact us
            </Link>
            <Link className="btn ghost" href="/gallery/">
              Gallery
            </Link>
          </div>
        </div>
        <div className="about-teaser-media">
          <img
            src={withBase(ABOUT_IMAGE)}
            alt={`${VILLAGE_ALSO_KNOWN_AS} village greenery near Devapatla, Sambepalle, YSR Kadapa`}
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
