"use client";

import { useUiLang } from "@/components/i18n/LanguageProvider";

const PROMISES = [
  ["home.promise.free", "home.promise.freeSub"],
  ["home.promise.noSignup", "home.promise.noSignupSub"],
  ["home.promise.kids", "home.promise.kidsSub"],
  ["home.promise.mobile", "home.promise.mobileSub"],
  ["home.promise.bilingual", "home.promise.bilingualSub"],
  ["home.promise.privacy", "home.promise.privacySub"],
] as const;

export function PromiseBar() {
  const { t } = useUiLang();
  return (
    <section className="promise-bar" aria-label={t("home.promise.free")}>
      <ul>
        {PROMISES.map(([title, sub]) => (
          <li key={title}>
            <strong>{t(title)}</strong>
            <span>{t(sub)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
