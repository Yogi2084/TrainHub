"use client";

import { cn } from "@/lib/utils";

/**
 * Skip-to-content link for keyboard users.
 *
 * WCAG 2.1 SC 2.4.1 (Bypass Blocks) and SC 2.4.3 (Focus Order):
 * The link is visually hidden until focused, then becomes visible.
 * Pressing Enter moves focus to the main content area.
 */
export function SkipLink({
  targetId = "main-content",
  className,
}: {
  targetId?: string;
  className?: string;
}) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      // Make the target focusable and move focus to it
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: false });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]",
        "focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground",
        "focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
    >
      Skip to main content
    </a>
  );
}
