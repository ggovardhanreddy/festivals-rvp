/**
 * Self-provided royalty-free ambient loops via ffmpeg synthesis.
 * No third-party copyrighted audio is downloaded or embedded.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "audio");

type Spec = {
  file: string;
  duration: number;
  /** Base pad Hz */
  pad: number;
  /** Flute-ish lead Hz */
  flute: number;
  /** Soft high overtone */
  air: number;
  wind: number;
  bellEvery: number;
};

const SPECS: Spec[] = [
  {
    file: "village-theme",
    duration: 72,
    pad: 196,
    flute: 392,
    air: 587,
    wind: 0.018,
    bellEvery: 18,
  },
  {
    file: "village-morning",
    duration: 64,
    pad: 220,
    flute: 440,
    air: 660,
    wind: 0.012,
    bellEvery: 22,
  },
  {
    file: "festival-night",
    duration: 68,
    pad: 174,
    flute: 349,
    air: 523,
    wind: 0.02,
    bellEvery: 16,
  },
  {
    file: "sankranthi",
    duration: 66,
    pad: 207,
    flute: 415,
    air: 622,
    wind: 0.014,
    bellEvery: 20,
  },
  {
    file: "vinayaka",
    duration: 70,
    pad: 185,
    flute: 370,
    air: 555,
    wind: 0.013,
    bellEvery: 14,
  },
  {
    file: "calm-ambient",
    duration: 60,
    pad: 164,
    flute: 246,
    air: 329,
    wind: 0.022,
    bellEvery: 28,
  },
];

function hasFfmpeg() {
  const r = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  return r.status === 0;
}

function encode(spec: Spec, force = false) {
  const d = spec.duration;
  const fadeOutStart = Math.max(1, d - 4);
  const wav = path.join(OUT, `${spec.file}.wav`);
  const mp3 = path.join(OUT, `${spec.file}.mp3`);
  const ogg = path.join(OUT, `${spec.file}.ogg`);

  if (!force && fs.existsSync(mp3) && fs.existsSync(ogg)) {
    console.log("skip", spec.file, "(exists)");
    return;
  }

  // Brown noise wind + layered sines (pad / flute / air) + occasional soft bell.
  const filter = [
    `[0:a]lowpass=f=700,volume=${spec.wind}[wind]`,
    `[1:a]volume=0.045,afade=t=in:st=0:d=3[pad]`,
    `[2:a]vibrato=f=4.2:d=0.18,tremolo=f=0.12:d=0.35,volume=0.028,afade=t=in:st=2:d=4[flute]`,
    `[3:a]volume=0.012,afade=t=in:st=6:d=5[air]`,
    // Soft temple bell: short sine bursts via volume envelope on a quiet oscillator
    `[4:a]volume=0.0001,asplit=2[bellsrc][bellmute];` +
      `[bellsrc]afade=t=in:st=0:d=0.01,afade=t=out:st=0.01:d=0.01,volume=0[bellidle]`,
    // Mix core beds
    `[wind][pad][flute][air]amix=inputs=4:normalize=0:dropout_transition=0,` +
      `volume=1.15,afade=t=in:st=0:d=2.5,afade=t=out:st=${fadeOutStart}:d=4,` +
      `alimiter=limit=0.89[mix]`,
  ].join(";");

  // Simpler reliable mix without complex bell graph issues:
  const simple = [
    `[0:a]lowpass=f=720,volume=${spec.wind}[wind]`,
    `[1:a]volume=0.05,afade=t=in:st=0:d=3[pad]`,
    `[2:a]vibrato=f=4:d=0.2,tremolo=f=0.11:d=0.4,volume=0.03,afade=t=in:st=1.5:d=3[flute]`,
    `[3:a]volume=0.014,afade=t=in:st=5:d=4[air]`,
    `[4:a]volume=0.0[silent]`,
    `[wind][pad][flute][air]amix=inputs=4:normalize=0,` +
      `afade=t=in:st=0:d=2.8,afade=t=out:st=${fadeOutStart}:d=3.8,` +
      `alimiter=limit=0.9[out]`,
  ].join(";");

  void filter;
  void simple;

  const args = [
    "-y",
    "-f",
    "lavfi",
    "-i",
    `anoisesrc=color=brown:amplitude=1:duration=${d}`,
    "-f",
    "lavfi",
    "-i",
    `sine=frequency=${spec.pad}:duration=${d}`,
    "-f",
    "lavfi",
    "-i",
    `sine=frequency=${spec.flute}:duration=${d}`,
    "-f",
    "lavfi",
    "-i",
    `sine=frequency=${spec.air}:duration=${d}`,
    "-f",
    "lavfi",
    "-i",
    `sine=frequency=528:duration=${d}`,
    "-filter_complex",
    [
      `[0:a]lowpass=f=720,volume=${spec.wind}[wind]`,
      `[1:a]volume=0.048,afade=t=in:st=0:d=3[pad]`,
      `[2:a]vibrato=f=4:d=0.2,tremolo=f=0.11:d=0.4,volume=0.03,afade=t=in:st=1.5:d=3[flute]`,
      `[3:a]volume=0.013,afade=t=in:st=5:d=4[air]`,
      // Soft bell pulses via sidechain-free gated sine using eval
      `[4:a]volume='if(lt(mod(t\\,${spec.bellEvery})\\,2.2)*gt(mod(t\\,${spec.bellEvery})\\,0.05)\\,0.045*pow(0.0001\\,(mod(t\\,${spec.bellEvery})/2.2))\\,0)':eval=frame[bell]`,
      `[wind][pad][flute][air][bell]amix=inputs=5:normalize=0:dropout_transition=2,` +
        `afade=t=in:st=0:d=2.8,afade=t=out:st=${fadeOutStart}:d=3.8,` +
        `alimiter=limit=0.88[out]`,
    ].join(";"),
    "-map",
    "[out]",
    "-ar",
    "44100",
    "-ac",
    "2",
    wav,
  ];

  console.log("synthesizing", spec.file);
  let r = spawnSync("ffmpeg", args, { encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr);
    // Fallback without volume expression bell
    const fallback = [
      "-y",
      "-f",
      "lavfi",
      "-i",
      `anoisesrc=color=brown:amplitude=1:duration=${d}`,
      "-f",
      "lavfi",
      "-i",
      `sine=frequency=${spec.pad}:duration=${d}`,
      "-f",
      "lavfi",
      "-i",
      `sine=frequency=${spec.flute}:duration=${d}`,
      "-f",
      "lavfi",
      "-i",
      `sine=frequency=${spec.air}:duration=${d}`,
      "-filter_complex",
      [
        `[0:a]lowpass=f=720,volume=${spec.wind}[wind]`,
        `[1:a]volume=0.05[pad]`,
        `[2:a]vibrato=f=4:d=0.2,volume=0.03[flute]`,
        `[3:a]volume=0.014[air]`,
        `[wind][pad][flute][air]amix=inputs=4:normalize=0,` +
          `afade=t=in:st=0:d=2.5,afade=t=out:st=${fadeOutStart}:d=3.5,alimiter=limit=0.9[out]`,
      ].join(";"),
      "-map",
      "[out]",
      "-ar",
      "44100",
      wav,
    ];
    r = spawnSync("ffmpeg", fallback, { encoding: "utf8" });
    if (r.status !== 0) {
      console.error(r.stderr);
      throw new Error(`ffmpeg failed for ${spec.file}`);
    }
  }

  const mp3r = spawnSync(
    "ffmpeg",
    ["-y", "-i", wav, "-c:a", "libmp3lame", "-q:a", "4", mp3],
    { encoding: "utf8" },
  );
  if (mp3r.status !== 0) console.error(mp3r.stderr);

  // Opus-in-Ogg (libvorbis not always available on Homebrew ffmpeg)
  const oggr = spawnSync(
    "ffmpeg",
    ["-y", "-i", wav, "-c:a", "libopus", "-b:a", "64k", ogg],
    { encoding: "utf8" },
  );
  if (oggr.status !== 0) {
    console.warn("ogg encode failed for", spec.file, "— mp3 fallback only");
  }
  fs.unlinkSync(wav);
  console.log(
    "wrote",
    path.basename(mp3),
    fs.existsSync(ogg) ? path.basename(ogg) : "(no ogg)",
  );
}

function main() {
  if (!hasFfmpeg()) {
    console.error("ffmpeg not found — skip ambient generation");
    process.exit(0);
  }
  fs.mkdirSync(OUT, { recursive: true });
  const force = process.argv.includes("--force");
  for (const spec of SPECS) encode(spec, force);
  console.log("Ambient music ready → public/audio/");
}

main();
