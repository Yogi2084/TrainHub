"use client";

import { motion, easeOut } from "framer-motion";
import { Github } from "lucide-react";
import Link from "next/link";

const NewFooter = ({ id }: { id: string }) => {
  const footerVariants = {
    hidden: { opacity: 0, y: 70 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: easeOut },
    },
  };

  return (
    <footer
      id={id}
      className="w-full bg-gradient-to-t from-background/90 to-transparent border-t border-border/70 mt-20 py-12 px-4 text-center text-muted-foreground text-sm backdrop-blur-sm"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
        variants={footerVariants}
        className="max-w-6xl mx-auto space-y-6"
      >
        <p>&copy; {new Date().getFullYear()} TrainHub. All rights reserved.</p>
        <div className="flex justify-center space-x-6 mt-2">
          <Link
            href="https://github.com/Yogi2084/GYM-SERVER"
            className="hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-6 h-6" />
          </Link>
        </div>
        <p className="mt-2">
          Designed to empower your mind. Built with dedication.
        </p>
      </motion.div>
    </footer>
  );
};

export default NewFooter;
