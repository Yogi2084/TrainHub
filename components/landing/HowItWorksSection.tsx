"use client";

import { motion, easeOut } from "framer-motion";
import { Dumbbell, TrendingUp, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: <Dumbbell className="w-8 h-8 text-violet-500" />,
    title: "Log Your Workouts",
    description:
      "Effortlessly record your exercises, sets, reps, and weights. Quick and intuitive input methods ensure you never miss tracking a session.",
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-emerald-500" />,
    title: "Track Your Progress",
    description:
      "Monitor your strength gains, volume, and personal records over time with visual analytics. TrainHub helps you see exactly how far you've come.",
  },
  {
    icon: <MessageSquare className="w-8 h-8 text-blue-500" />,
    title: "Train with AI Coach",
    description:
      "Chat with your AI fitness coach for workout advice, form tips, and personalized recommendations based on your training history and goals.",
  },
];

const HowItWorksSection = ({ id }: { id: string }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 70 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        ease: easeOut,
      },
    }),
  };

  return (
    <section
      id={id}
      className="relative z-10 w-full px-4 md:px-12 lg:px-20 py-16 sm:py-20 lg:py-24 my-16 sm:my-20 lg:my-24"
    >
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
        variants={itemVariants}
        className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12"
      >
        How TrainHub Works
      </motion.h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.8 }}
            className="flex flex-col items-center text-center p-6 bg-background/70 rounded-lg shadow-lg border border-border/50 backdrop-blur-sm"
          >
            <div className="mb-4 p-3 rounded-full bg-primary/10 flex items-center justify-center">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {step.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
