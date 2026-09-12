"use client";

import { useEffect } from "react";

/**
 * Traps keyboard focus inside the referenced element while `active` is true.
 *
 * WCAG 2.4.3 — Focus Order: Tab and Shift+Tab cycle through focusable
 * elements within the dialog without escaping to the page behind it.
 */
export function useFocusTrap(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean
) {
  useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;

    const getFocusable = (): HTMLElement[] => {
      const selectors =
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(
        container.querySelectorAll<HTMLElement>(selectors)
      ).filter((el) => el.offsetParent !== null || el === container);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    // Move focus into the container on mount
    const focusable = getFocusable();
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      container.setAttribute("tabindex", "-1");
      container.focus();
    }

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, ref]);
}
