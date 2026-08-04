"use client";

import { useEffect } from "react";
import { withBase } from "@/lib/base";

function reportError(payload: {
  message: string;
  source?: string;
  stack?: string;
}) {
  try {
    const body = JSON.stringify({
      hit: {
        path: typeof location !== "undefined" ? location.pathname : "/",
        ts: Date.now(),
        kind: "error",
        meta: payload.message.slice(0, 200),
        source: (payload.source || "").slice(0, 120),
        stack: (payload.stack || "").slice(0, 500),
      },
    });
    const url = withBase("/api/community/analytics");
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* never break UX */
  }
}

/** Captures uncaught errors / rejections into community analytics. */
export function ErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportError({
        message: event.message || "window.onerror",
        source: event.filename,
        stack: event.error?.stack,
      });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === "string"
            ? reason
            : "unhandledrejection";
      reportError({
        message,
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
