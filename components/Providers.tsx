"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { LazyMotion, domAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { AudioDeckProvider } from "./media/AudioDeck";
import { MusicProvider } from "./music/MusicProvider";
import { GlassMusicPlayer } from "./music/GlassMusicPlayer";
import { MusicRouteSync } from "./music/MusicRouteSync";
import { InstallAppPrompt } from "./pwa/InstallAppPrompt";
import { ServiceWorkerManager } from "./pwa/ServiceWorkerManager";
import { UpdateAvailablePrompt } from "./pwa/UpdateAvailablePrompt";
import { NotificationProvider } from "./notifications/NotificationProvider";
import { MemberAuthProvider } from "./auth/MemberAuthProvider";
import { LocationProvider } from "./location/LocationProvider";
import { LocationConsentDialog } from "./location/LocationConsentDialog";
import { AnalyticsTracker } from "./analytics/AnalyticsTracker";
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
        <AutoDayNightSync />
        <SuperAdminProvider>
          <MemberAuthProvider>
            <LocationProvider>
              <NotificationProvider
                members={membersData as Member[]}
                events={eventsData as SiteEvent[]}
                announcements={announcementsData as Announcement[]}
                developments={developmentsData as Development[]}
              >
                <MusicProvider>
                  <AudioDeckProvider>
                    <MusicRouteSync />
                    <DesktopExtras />
                    <ServiceWorkerManager />
                    <UpdateAvailablePrompt />
                    <AnalyticsTracker />
                    {children}
                    <GlassMusicPlayer />
                    <InstallAppPrompt />
                    <LocationConsentDialog />
                  </AudioDeckProvider>
                </MusicProvider>
              </NotificationProvider>
            </LocationProvider>
          </MemberAuthProvider>
        </SuperAdminProvider>
      </LazyMotion>
    </ThemeProvider>
  );
}
