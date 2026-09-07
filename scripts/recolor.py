"""One-shot palette migration: hex literals in app/globals.css.

Run once during the 2026 dark-premium redesign to move the warm gold/cream
family and the dark forest grounds onto the indigo/violet system, leaving
semantic hues (danger, success, warning) and real brand marks (the Instagram
gradient, the rainbow logo treatment) untouched -- see KEEP below.

Kept in the repo as the record of how ~460 colour literals were remapped, and
as the tool to run again if the accent hue is ever rotated wholesale. It is
not part of the build. Pair: recolor_rgba.py for the rgba() literals.

    python3 scripts/recolor.py            # dry run, prints the mapping
    python3 scripts/recolor.py --apply    # rewrites app/globals.css in place
"""
import re, colorsys, sys

SRC = "app/globals.css"

def hex_to_rgb(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c*2 for c in h)
    if len(h) == 8:
        return tuple(int(h[i:i+2],16) for i in (0,2,4)), h[6:8]
    return tuple(int(h[i:i+2],16) for i in (0,2,4)), None

def rgb_to_hex(r,g,b,alpha=None):
    s = '#%02x%02x%02x' % (max(0,min(255,round(r))), max(0,min(255,round(g))), max(0,min(255,round(b))))
    return s + (alpha if alpha else '')

# Explicit keeps: semantic status hues and the two multi-stop brand gradients
# (Instagram button, rainbow logo treatment). Recolouring these would either
# destroy a meaning (warning/critical/alert) or break a real brand mark.
KEEP = {
    "#f58529", "#dd2a7b", "#8134af", "#515bd4",              # Instagram gradient
    "#ff3b5c", "#ff8a3d", "#ffd84d", "#3ddc84",              # rainbow logo treatment
    "#3db8ff", "#b07cff", "#ff5ec8",
    "#b45309", "#e8590c", "#c45c26",                          # warning / alert
    "#9a5b12", "#c4892a", "#e8b15a",                          # dev status: critical
    "#8a4b1f",                                                # dev status: construction
}


def classify(hx):
    if hx.lower() in KEEP:
        return None, (0, 0, 0), None
    (r,g,b), alpha = hex_to_rgb(hx)
    h,l,s = colorsys.rgb_to_hls(r/255,g/255,b/255)
    H, L, S = h*360, l*100, s*100
    if S < 6:
        return None, (H,L,S), alpha           # neutral grey/white/black — keep
    # warm gold / amber / cream / brown
    if 15 <= H <= 68:
        return "warm", (H,L,S), alpha
    # dark green grounds (forest backgrounds) — only the dark ones
    if 85 <= H <= 185 and L < 26:
        return "deepgreen", (H,L,S), alpha
    return None, (H,L,S), alpha

def remap(kind, H, L, S):
    if kind == "warm":
        # 15..68  ->  252..292   (indigo -> violet -> magenta-violet)
        t = (H - 15) / 53.0
        nH = 252 + t * 40
        if L >= 90:      # creams -> cool near-white with a violet whisper
            nS = min(S, 100) * 0.30
            nL = min(99.0, L + 0.5)
        elif L >= 70:    # pale golds -> soft lilac
            nS = min(S * 0.72, 78)
            nL = L
        else:            # mid + dark golds -> saturated violet
            nS = min(max(S, 42), 74)
            nL = L
        return nH, nL, nS
    # deepgreen -> deep navy/indigo ground
    t = max(0.0, min(1.0, (H - 85) / 100.0))
    nH = 232 + t * 14          # 232..246
    nS = min(max(S, 24), 52)
    nL = L
    return nH, nL, nS

css = open(SRC, encoding="utf-8").read()
found = {}
for m in re.finditer(r'#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b', css):
    found.setdefault(m.group(0), 0)
    found[m.group(0)] += 1

mapping = {}
report = []
for hx, count in sorted(found.items(), key=lambda kv: -kv[1]):
    kind, (H,L,S), alpha = classify(hx)
    if not kind:
        report.append((hx, count, "keep", ""))
        continue
    nH, nL, nS = remap(kind, H, L, S)
    r,g,b = colorsys.hls_to_rgb((nH % 360)/360, nL/100, nS/100)
    new = rgb_to_hex(r*255, g*255, b*255, alpha)
    mapping[hx] = new
    report.append((hx, count, kind, new))

if "--apply" in sys.argv:
    # longest-first so #abcdef is not partly matched inside #abcdefgh
    for hx in sorted(mapping, key=len, reverse=True):
        css = re.sub(re.escape(hx) + r'\b', mapping[hx], css)
    open(SRC, "w", encoding="utf-8").write(css)
    print("applied %d distinct colours" % len(mapping))
else:
    for hx, count, kind, new in report:
        print("%-10s x%-3d %-10s %s" % (hx, count, kind, new))
    print("\n%d remapped / %d total distinct" % (len(mapping), len(found)))
