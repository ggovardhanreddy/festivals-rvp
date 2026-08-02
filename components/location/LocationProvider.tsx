"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildCachedLocation,
  clearLocationData,
  isGeolocationSupported,
  readCache,
  readPreference,
  requestBrowserPosition,
  writeCache,
  writePreference,
  type CachedLocation,
  type LocationPreference,
  type LocationStatus,
} from "@/lib/location";

type LocationContextValue = {
  supported: boolean;
  preference: LocationPreference;
  status: LocationStatus;
  location: CachedLocation | null;
  error: string | null;
  showConsent: boolean;
  acceptConsent: () => void;
  dismissConsent: () => void;
  refreshLocation: () => Promise<void>;
  revokeLocation: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [supported, setSupported] = useState(false);
  const [preference, setPreference] = useState<LocationPreference>("unknown");
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [location, setLocation] = useState<CachedLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const syncFromStorage = useCallback(() => {
    setPreference(readPreference());
    setLocation(readCache());
  }, []);

  const fetchPosition = useCallback(async () => {
    if (!isGeolocationSupported()) {
      setStatus("unsupported");
      setError("Location is not supported in this browser.");
      return;
    }
    setStatus("requesting");
    setError(null);
    try {
      const pos = await requestBrowserPosition();
      const next = buildCachedLocation(
        pos.coords.latitude,
        pos.coords.longitude,
      );
      writePreference("granted");
      writeCache(next);
      setPreference("granted");
      setLocation(next);
      setStatus("ready");
    } catch (err) {
      const code =
        err && typeof err === "object" && "code" in err
          ? Number((err as GeolocationPositionError).code)
          : 0;
      if (code === 1) {
        writePreference("denied");
        setPreference("denied");
        setError(
          "Location permission denied. You can enable it later in Settings.",
        );
        setStatus("error");
      } else if (code === 3) {
        setError("Location request timed out. Try again from Settings.");
        setStatus("timeout");
      } else {
        setError("Could not read your location. The site works without it.");
        setStatus("error");
      }
    }
  }, []);

  useEffect(() => {
    const ok = isGeolocationSupported();
    setSupported(ok);
    const pref = readPreference();
    const cache = readCache();
    setPreference(pref);
    setLocation(cache);
    setHydrated(true);

    if (!ok) {
      setStatus("unsupported");
      return;
    }

    if (pref === "unknown") {
      const t = window.setTimeout(() => setShowConsent(true), 2800);
      return () => window.clearTimeout(t);
    }

    if (pref === "granted") {
      if (cache) {
        setStatus("ready");
      } else {
        void fetchPosition();
      }
    }
  }, [fetchPosition]);

  useEffect(() => {
    window.addEventListener("rvp:location-change", syncFromStorage);
    return () =>
      window.removeEventListener("rvp:location-change", syncFromStorage);
  }, [syncFromStorage]);

  const acceptConsent = useCallback(() => {
    setShowConsent(false);
    setStatus("prompting");
    void fetchPosition();
  }, [fetchPosition]);

  const dismissConsent = useCallback(() => {
    setShowConsent(false);
    writePreference("dismissed");
    setPreference("dismissed");
    setStatus("idle");
  }, []);

  const refreshLocation = useCallback(async () => {
    setShowConsent(false);
    await fetchPosition();
  }, [fetchPosition]);

  const revokeLocation = useCallback(() => {
    clearLocationData();
    setPreference("denied");
    setLocation(null);
    setStatus("idle");
    setError(null);
    setShowConsent(false);
  }, []);

  const value = useMemo(
    () => ({
      supported,
      preference,
      status,
      location: hydrated ? location : null,
      error,
      showConsent: hydrated && showConsent,
      acceptConsent,
      dismissConsent,
      refreshLocation,
      revokeLocation,
    }),
    [
      supported,
      preference,
      status,
      location,
      hydrated,
      error,
      showConsent,
      acceptConsent,
      dismissConsent,
      refreshLocation,
      revokeLocation,
    ],
  );

  return (
    <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return ctx;
}
