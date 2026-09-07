"""One-shot palette migration, second pass: recolour rgba()/rgb() literals in globals.css.

Same intent as recolor.py (which handled hex): move the warm gold/cream family
and the dark forest grounds onto the indigo/violet system, while leaving
semantic hues alone. Mid-lightness greens are left untouched on purpose --
those are success states and village foliage, where the hue carries meaning.

Not part of the build. See scripts/recolor.py for the first (hex) pass.

    python3 scripts/recolor_rgba.py            # dry run, counts the changes
    python3 scripts/recolor_rgba.py --apply    # rewrites app/globals.css
"""
import re, colorsys, sys

SRC = "app/globals.css"

# Semantic rgba tones that must keep their hue.
KEEP = {
    (214, 69, 69), (180, 60, 50), (255, 160, 140), (230, 138, 128),  # danger
    (126, 205, 160),                                                   # success
}


def remap(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    H, L, S = h * 360, l * 100, s * 100
    if S < 8 or (r, g, b) in KEEP:
        return None
    if 15 <= H <= 68:                       # warm gold / amber / cream
        t = (H - 15) / 53.0
        nH = 252 + t * 40
        if L >= 90:
            nS, nL = S * 0.30, min(99.0, L + 0.5)
        elif L >= 70:
            nS, nL = min(S * 0.72, 78), L
        else:
            nS, nL = min(max(S, 42), 74), L
    elif 85 <= H <= 185 and L < 30:         # dark forest grounds -> deep navy
        t = max(0.0, min(1.0, (H - 85) / 100.0))
        nH, nS, nL = 232 + t * 14, min(max(S, 24), 52), L
    elif 85 <= H <= 185 and L >= 90:        # near-white greens -> cool white
        nH, nS, nL = 262, S * 0.35, L
    else:
        return None
    nr, ng, nb = colorsys.hls_to_rgb((nH % 360) / 360, nL / 100, nS / 100)
    return tuple(max(0, min(255, round(c * 255))) for c in (nr, ng, nb))


PAT = re.compile(r'\brgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*[\d.]+\s*)?\)')
changed = [0]


def sub(m):
    r, g, b = int(m.group(1)), int(m.group(2)), int(m.group(3))
    new = remap(r, g, b)
    if not new:
        return m.group(0)
    changed[0] += 1
    tail = m.group(4) or ""
    fn = "rgba" if tail else "rgb"
    return "%s(%d, %d, %d%s)" % (fn, new[0], new[1], new[2], tail)


css = open(SRC, encoding="utf-8").read()
out = PAT.sub(sub, css)
if "--apply" in sys.argv:
    open(SRC, "w", encoding="utf-8").write(out)
    print("rewrote %d rgba literals" % changed[0])
else:
    print("would rewrite %d rgba literals" % changed[0])
