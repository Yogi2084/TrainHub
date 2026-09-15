"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Dumbbell,
  TrendingUp,
  MessageCircle,
  UserCheck,
  Server,
  CheckCircle,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageTransition } from "@/components/ui/page-transition";

gsap.registerPlugin(ScrollTrigger);

interface BentoItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const neuroNestFeatures: BentoItem[] = [
  {
    title: "Workout Management",
    description:
      "Create, edit, and delete workouts and training plans. Tag and categorize your exercises. View recent and historical training sessions.",
    icon: <Dumbbell className="w-7 h-7 text-[--color-primary]" />,
  },
  {
    title: "Progress Tracking",
    description:
      "Ask questions like 'How much did I bench last month?' or 'Show me all my leg day sessions.' TrainHub analyzes your training data and summarizes your gains over time.",
    icon: <TrendingUp className="w-7 h-7 text-[--color-chart-2]" />,
  },
  {
    title: "AI Coach Chat",
    description:
      "Conversational UI for workout advice, form tips, and personalized recommendations. Real-time, chat-based coaching experience.",
    icon: <MessageCircle className="w-7 h-7 text-[--color-chart-3]" />,
  },
  {
    title: "Auth & Personalization",
    description:
      "Secure sign up/login with BetterAuth (JWT). Your own private, persistent training profile and workout history.",
    icon: <UserCheck className="w-7 h-7 text-[--color-chart-4]" />,
  },
  {
    title: "Tech Stack",
    description:
      "Next.js, Zustand, TanStack Query, Tailwind CSS, ShadCN UI, Node.js, Hono, TypeScript, PostgreSQL, Prisma, Docker, Vercel, Azure, GitHub Actions.",
    icon: <Server className="w-7 h-7 text-[--color-chart-5]" />,
  },
  {
    title: "Success Criteria",
    description:
      "Log and retrieve workouts, track progress over time, AI-generated coaching advice, live chat, secure and personal.",
    icon: <CheckCircle className="w-7 h-7 text-[--color-primary]" />,
  },
];

export default function LearnMorePage() {
  useEffect(() => {
    gsap.fromTo(
      ".bento-item",
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".bento-grid-container",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  }, []);

  return (
    <PageTransition>
      <div className="h-screen bg-[--color-background] text-[--color-foreground] p-5">
        <div className="max-w-5xl mx-auto py-5">
          <h1 className="text-3xl font-bold mb-3 text-center">
            Discover TrainHub
          </h1>
          <p className="text-base text-center max-w-2xl mx-auto mb-7">
            TrainHub is your AI-powered fitness companion. Effortlessly log,
            organize, and track your workouts&mdash;exercises, sets, reps,
            and more. Interact with your training history using natural
            language, powered by advanced AI and progress analytics.
          </p>
          <div className="bento-grid-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl mx-auto mb-7">
            {neuroNestFeatures.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "bento-item group relative h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 will-change-transform"
                )}
              >
                <Card className="h-full flex flex-col">
                  <CardHeader className="relative space-y-0 p-3">
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10">
                        {item.icon}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-1.5 p-3 pt-0 flex-grow">
                    <h3 className="font-medium text-[--foreground] tracking-tight text-sm">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[--muted-foreground] leading-snug font-[425]">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          <p className="text-base text-center mb-4">
            Ready to experience the future of personal fitness training?
          </p>
          <div className="flex justify-center">
            <Link href="/">
              <Button
                variant="outline"
                className="hover:cursor-pointer hover:scale-105 transition-transform"
              >
                Go to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
