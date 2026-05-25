"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

function hasActiveTextInput() {
  const activeElement = document.activeElement;

  return (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement ||
    activeElement instanceof HTMLSelectElement ||
    activeElement?.getAttribute("contenteditable") === "true"
  );
}

export function AutoRefresh({ intervalMs = 5_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    if (intervalMs <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (
        document.visibilityState !== "visible" ||
        navigator.onLine === false ||
        hasActiveTextInput()
      ) {
        return;
      }

      router.refresh();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [intervalMs, router]);

  return null;
}
