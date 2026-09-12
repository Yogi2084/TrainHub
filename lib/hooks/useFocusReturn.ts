"use client";

import { useEffect, useRef } from "react";

/**
 * Captures the currently focused element when `active` becomes true,
 * then restores focus to that element when `active` becomes false.
 *
 * WCAG 2.4.3 — Focus Order: when a modal opens, focus moves into it;
 * when it closes, focus returns to the trigger that opened it.
 */
export function useFocusReturn(active: boolean) {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (active) {
      triggerRef.current = document.activeElement as HTMLElement | null;
    } else if (triggerRef.current) {
      // Restore focus on the next tick so the dialog has unmounted
      const el = triggerRef.current;
      const id = requestAnimationFrame(() => {
        el.focus();
        triggerRef.current = null;
      });
      return () => cancelAnimationFrame(id);
    }
  }, [active]);

  return triggerRef;
}
