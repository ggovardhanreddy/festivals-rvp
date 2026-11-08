"use client";

import { useEffect, useState } from "react";

/** Live clock source for date labels that must track current village day. */
export function useVillageNow(refreshMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const id = window.setInterval(update, refreshMs);
    return () => window.clearInterval(id);
  }, [refreshMs]);

  return now;
}
