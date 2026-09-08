"use client";

import { motion, easeOut } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const NewCallToActionSection = ({ id }: { id: string }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: easeOut },
    },
  };

  return (
    <section
      id={id}
      className="relative z-10 w-full px-4 md:px-12 lg:px-20 py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-purple-800/20 to-blue-800/20 shadow-2xl text-center my-16 sm:my-20 lg:my-24"
    >
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
        variants={itemVariants}
        className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight"
      >
        <span className="text-white drop-shadow-[0_0_4px_#8b5cf6]">
          Ready to transform your fitness journey?
        </span>
      </motion.h2>
      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
        variants={itemVariants}
        className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
      >
        Join TrainHub today and take your workouts, 
        progress, and performance to the next level.
      </motion.p>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
      >
        <Link href="/sign-up">
          <Button
            size="lg"
            className="hover:cursor-pointer hover:scale-105 transition-transform bg-violet-600 hover:bg-violet-700 text-white"
          >
            Get Started for Free
          </Button>
        </Link>
        <Link href="/learn-more">
          <Button
            variant="outline"
            size="lg"
            className="hover:cursor-pointer hover:scale-105 transition-transform border-violet-500 text-violet-500 hover:bg-violet-500/10"
          >
            Learn More
          </Button>
        </Link>
      </motion.div>
    </section>
  );
};

export default NewCallToActionSection;
