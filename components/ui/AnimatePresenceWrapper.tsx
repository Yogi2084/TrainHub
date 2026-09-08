"use client";

import { AnimatePresence } from "framer-motion";
import { PropsWithChildren } from "react";

export default function AnimatePresenceWrapper({
  children,
}: PropsWithChildren) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}
