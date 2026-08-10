import { useCallback, useEffect, useState } from "react";
import type { Mood } from "../types/content";

const STORAGE_KEY = "wonderland:mood";

/**
 * Current scene mood, persisted across visits.
 *
 * The mood is written to `data-mood` on the document element rather than held
 * in a provider, so the whole palette swaps through CSS custom properties with
 * no component re-rendering.
 */
export function useMood(fallback: Mood, allowed: Mood[]) {
  const [mood, setMood] = useState<Mood>(() => {
    if (typeof window === "undefined") return fallback;
    const stored = window.localStorage.getItem(STORAGE_KEY) as Mood | null;
    return stored && allowed.includes(stored) ? stored : fallback;
  });

  useEffect(() => {
    document.documentElement.dataset.mood = mood;
    try {
      window.localStorage.setItem(STORAGE_KEY, mood);
    } catch {
      // Private browsing denies writes. The mood still applies this session.
    }
  }, [mood]);

  return [mood, useCallback((next: Mood) => setMood(next), [])] as const;
}
