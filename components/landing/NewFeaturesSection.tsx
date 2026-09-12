"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Dumbbell,
  TrendingUp,
  MessageSquare,
  Calendar,
  Zap,
  Lock,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: <Dumbbell className="w-6 h-6 text-blue-500" />,
    title: "Workout Management",
    description:
      "Create, edit, and track your workouts with full CRUD support and versioned history. Keep your training plans organized and accessible whenever you need them.",
    status: "New",
    tags: ["Workouts", "CRUD"],
    colSpan: 2,
    hasPersistentHover: false,
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
    title: "Progress Tracking",
    description:
      "Monitor your strength gains, volume, and personal records over time with visual analytics and trend insights.",
    status: "AI-Boosted",
    tags: ["Analytics", "Progress"],
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-purple-500" />,
    title: "AI Coach Chat",
    description:
      "Chat naturally with your AI fitness coach for workout advice, form tips, and personalized recommendations.",
    tags: ["Chat", "AI"],
    status: "Live",
  },
  {
    icon: <Calendar className="w-6 h-6 text-pink-500" />,
    title: "Training Schedule",
    description:
      "Plan your training splits and weekly routines so you always know what to train and when.",
    tags: ["Schedule", "Plan"],
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    title: "Quick Log",
    description:
      "Rapidly log sets, reps, and weights with minimal friction so you never miss recording a workout.",
    tags: ["Speed", "Log"],
    status: "Updated",
  },
  {
    icon: <Lock className="w-6 h-6 text-red-500" />,
    title: "Private & Secure",
    description:
      "Your fitness data is encrypted and protected with enterprise-grade security and full privacy control.",
    tags: ["Encrypted", "Private"],
    status: "Secure",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-sky-500" />,
    title: "Smart Recommendations",
    description:
      "Get AI-driven workout suggestions based on your training history, goals, and recovery — so your next session is always optimized.",
    tags: ["AI", "Smart"],
    status: "Beta",
    colSpan: 2,
  },
];

const NewFeaturesSection = ({ id }: { id: string }) => {
  const cardVariants = {
    offscreen: { y: 100, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  return (
    <section
      id={id}
      className="relative z-10 w-full px-4 md:px-12 lg:px-20 py-16 sm:py-20 lg:py-24 my-16 sm:my-20 lg:my-24"
    >
      <motion.h2
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.8 }}
        variants={cardVariants}
        className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12"
      >
        Core Capabilities
      </motion.h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.8 }}
            transition={{ delay: index * 0.15 }}
            className={cn(
              feature.colSpan === 2 ? "md:col-span-2" : "col-span-1"
            )}
          >
            <Card
              className={cn(
                "group relative h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 will-change-transform overflow-hidden",
                "bg-background/80 border border-border/70 backdrop-blur-sm", // Added blur
                {
                  "shadow-md -translate-y-1": feature.hasPersistentHover,
                }
              )}
            >
              <div
                className={cn(
                  "absolute inset-0",
                  feature.hasPersistentHover
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-300 pointer-events-none"
                )}
                style={{
                  background:
                    "linear-gradient(225deg, rgba(138, 43, 226, 0.15) 0%, rgba(75, 0, 130, 0.15) 100%)", // Slightly more prominent gradient
                }}
              />
              <CardHeader className="relative z-10 flex flex-row items-center space-x-4 pb-2">
                <div className="p-3 bg-violet-500/10 rounded-full flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                {feature.status && (
                  <span className="ml-auto inline-flex items-center rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-500">
                    {feature.status}
                  </span>
                )}
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-4 text-sm">
                  {feature.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {feature.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-flex items-center rounded-full bg-accent/30 px-2 py-0.5 text-xs font-medium text-accent-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default NewFeaturesSection;
