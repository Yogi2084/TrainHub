import "./globals.css";
import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/integrations/theme-provider";
import TanstackQueryClientProvider from "@/lib/integrations/tanstack-query-client-provider";
import { jura } from "@/lib/fonts";
import { Toaster } from "sonner";
import AnimatePresenceWrapper from "../components/ui/AnimatePresenceWrapper";
import neuronestBanner from "@/public/neuronest-banner.jpg";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.neuronest.world"),
  title: "NeuroNest",
  description:
    "NeuroNest is a full-stack, AI-driven memory assistant to store, organize, and retrieve your personal knowledge with LLM intelligence. Features semantic search, conversational UI, secure auth, and personalized knowledge vaults.",
  keywords: [
    "NeuroNest",
    "AI memory assistant",
    "second brain",
    "semantic search",
    "knowledge management",
    "LLM",
    "Mistral",
    "Pinecone",
    "BetterAuth",
    "Next.js",
    "personal knowledge base",
    "conversational AI",
    "vector database",
    "open source",
  ],
  openGraph: {
    title: "NeuroNest",
    description: "Your AI-powered memory assistant",
    url: "https://www.neuronest.world",
    type: "website",
    images: [
      {
        url: neuronestBanner.src,
        width: 1200,
        height: 630,
        alt: "NeuroNest Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroNest",
    description: "Your AI-powered memory assistant",
    images: [neuronestBanner.src],
    site: "@neuro_nest",
    creator: "@neuro_nest",
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jura.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TanstackQueryClientProvider>
            <AnimatePresenceWrapper>{children}</AnimatePresenceWrapper>
            <Toaster />
          </TanstackQueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
