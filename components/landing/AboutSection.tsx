"use client";

import { motion, easeOut } from "framer-motion";

const AboutSection = ({ id }: { id: string }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: easeOut },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeOut },
    },
  };

  return (
    <section
      id={id}
      className="relative z-10 w-full px-4 md:px-12 lg:px-20 py-16 sm:py-20 lg:py-24 bg-background/50 rounded-lg shadow-xl my-20"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
        className="max-w-4xl mx-auto text-center space-y-6"
      >
        <motion.h2
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold text-foreground"
        >
          What is TrainHub?
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-muted-foreground leading-relaxed"
        >
          TrainHub is an innovative fitness and training platform 
          designed to be your personal fitness companion. 
          It helps you discover personalized workouts, track your progress,
           and stay motivated throughout your fitness journey, 
           making it easier to build consistent habits and achieve your goals.
        </motion.p>
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-muted-foreground leading-relaxed mt-4"
        >
          In today&apos;s busy lifestyle, 
          staying consistent with fitness and keeping track of your progress 
          can be challenging. TrainHub solves this by bringing your workouts, 
          training plans, progress tracking, and fitness insights together 
          in one powerful platform, helping you train smarter, stay focused, 
          and become stronger every day.
        </motion.p>
      </motion.div>
    </section>
  );
};

export default AboutSection;
