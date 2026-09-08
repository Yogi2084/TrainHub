"use client";

import { motion, easeOut } from "framer-motion";
import { Brain, Search, MessageSquare } from "lucide-react"; // Using existing icons for illustration

const steps = [
  {
    icon: <Brain className="w-8 h-8 text-violet-500" />,
    title: "Capture Your Thoughts",
    description:
      "Effortlessly save notes, links, and ideas into your NeuroNest vault. Quick and intuitive input methods ensure you never lose an insight.",
  },
  {
    icon: <Search className="w-8 h-8 text-emerald-500" />,
    title: "Intelligent Retrieval",
    description:
      "Utilize semantic search to find what you need by asking high-level, natural language questions. NeuroNest understands context, not just keywords.",
  },
  {
    icon: <MessageSquare className="w-8 h-8 text-blue-500" />,
    title: "Converse & Generate Insights",
    description:
      "Chat with your knowledge base, follow up on queries, and get AI-summarized insights from your stored information.",
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
        How NeuroNest Works
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
