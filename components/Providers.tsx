"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { LazyMotion, domAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { AudioDeckProvider } from "./media/AudioDeck";
import { MusicProvider } from "./music/MusicProvider";
import { MusicRouteSync } from "./music/MusicRouteSync";
import { InstallAppPrompt } from "./pwa/InstallAppPrompt";
import { ServiceWorkerManager } from "./pwa/ServiceWorkerManager";
import { LiveCalendarBridge } from "./calendar/LiveCalendarBridge";
import { MemberAuthProvider } from "./auth/MemberAuthProvider";
import { LocationProvider } from "./location/LocationProvider";
import { WelcomeConsent } from "./consent/WelcomeConsent";
import { AnalyticsTracker } from "./analytics/AnalyticsTracker";
import { ErrorReporter } from "./analytics/ErrorReporter";
import { PlausibleScript } from "./analytics/PlausibleScript";
import { CloudflareWebAnalytics } from "./analytics/CloudflareWebAnalytics";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { MobileBottomNav } from "./platform/MobileBottomNav";
import { ScrollProgress } from "./motion/ScrollProgress";
import { BackToTop } from "./motion/BackToTop";
import { AutoDayNightSync } from "./Theme";
import { SuperAdminProvider } from "@/lib/use-super-admin";
import type { Announcement, Development, Member, SiteEvent } from "@/lib/types";
import membersData from "@/content/data/members.json";
import eventsData from "@/content/data/events.json";
import announcementsData from "@/content/data/announcements.json";
import developmentsData from "@/content/data/developments.json";

const SmoothScroll = dynamic(
  () => import("./experience/SmoothScroll").then((m) => m.SmoothScroll),
  { ssr: false },
);

/**
 * Marks the document as hydrated.
 *
 * Static export means every page ships fully-rendered HTML that is not yet
 * interactive. Tests (and anything else that needs to know) can wait for
 * this flag rather than guessing with a timeout.
 */
function HydrationFlag() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "1";
  }, []);
  return null;
}

function DesktopExtras() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (min-width: 821px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  if (!desktop) return null;
  return <SmoothScroll />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="rvp-theme"
      disableTransitionOnChange={false}
    >
      <LazyMotion features={domAnimation}>
        {/* Page-level chrome: one instance each, inside LazyMotion because
            both read useReducedMotion. */}
        <ScrollProgress />
        <AutoDayNightSync />
        <HydrationFlag />
        <LanguageProvider>
          <SuperAdminProvider>
            <MemberAuthProvider>
              <LocationProvider>
                <LiveCalendarBridge
                  members={membersData as Member[]}
                  seedEvents={eventsData as SiteEvent[]}
                  seedAnnouncements={announcementsData as Announcement[]}
                  developments={developmentsData as Development[]}
                >
                  <MusicProvider>
                    <AudioDeckProvider>
                      <MusicRouteSync />
                      <DesktopExtras />
                      <ServiceWorkerManager />
                      <AnalyticsTracker />
                      <ErrorReporter />
                      <PlausibleScript />
                      <CloudflareWebAnalytics />
                      {children}
                      <MobileBottomNav />
                      <InstallAppPrompt />
                      <WelcomeConsent />
                    </AudioDeckProvider>
                  </MusicProvider>
                </LiveCalendarBridge>
              </LocationProvider>
            </MemberAuthProvider>
          </SuperAdminProvider>
        </LanguageProvider>
        <BackToTop />
      </LazyMotion>
    </ThemeProvider>
  );
}
