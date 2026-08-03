import { withBase } from "@/lib/base";

/**
 * Decorative fixed brand mark — atmospheric only.
 * Non-interactive so it never blocks nav, drawers, or CTAs.
 */
export function LogoWatermark() {
  return (
    <div className="logo-watermark" aria-hidden="true">
      <img
        className="logo-watermark-img"
        src={withBase("/logo/logo-master.png")}
        alt=""
        width={220}
        height={63}
        draggable={false}
        decoding="async"
      />
    </div>
  );
}
