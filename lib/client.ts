"use client";

import { useSyncExternalStore } from "react";
import { detectLowPowerDevice } from "./experience";

const emptySubscribe = () => () => {};

export function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export function useLowPowerDevice() {
  const client = useIsClient();
  return client ? detectLowPowerDevice() : true;
}

export function useFinePointer() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(pointer: fine)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(pointer: fine)").matches,
    () => false,
  );
}
