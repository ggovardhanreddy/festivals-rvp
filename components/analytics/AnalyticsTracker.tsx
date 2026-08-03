"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackAnalyticsHit } from "@/lib/use-community";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    void trackAnalyticsHit({ path: pathname, kind: "pageview" });
  }, [pathname]);

  return null;
}
