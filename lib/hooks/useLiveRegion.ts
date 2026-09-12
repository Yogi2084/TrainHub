"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref to attach to an element and a function to announce messages.
 *
 * WCAG 2.4.3 — Focus Order: when content updates dynamically (e.g. chat
 * messages arriving, search results changing) screen-reader users get
 * an audible announcement without losing their current position.
 *
 * Usage:
 *   const { ref, announce } = useLiveRegion();
 *   <div ref={ref} className="sr-only" />
 *   announce("3 results found");
 */
export function useLiveRegion() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (ref.current && message) {
      // Toggle text to re-trigger announcement for identical messages
      ref.current.textContent = "";
      requestAnimationFrame(() => {
        if (ref.current) ref.current.textContent = message;
      });
    }
  }, [message]);

  const announce = (text: string) => setMessage(text);

  return { ref, announce };
}
