"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { SplitText } from "gsap/dist/SplitText";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { silkscreen } from "@/lib/fonts";
import { auth } from "@/lib/auth";

gsap.registerPlugin(ScrollTrigger, SplitText);

const NewHeroSection = ({ id }: { id: string }) => {
  const { data } = auth.useSession();
  const user = data?.user;

  const titleRef = useRef(null);
  const taglineRef = useRef(null);
  const ctaRef = useRef(null);
  const sectionRef = useRef(null);
  const backgroundShapeRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=1000",
        scrub: 1,
        pin: true,
        pinSpacing: true,
      },
    });

    if (titleRef.current) {
      const splitTitle = new SplitText(titleRef.current, {
        type: "words,chars",
      });
      tl.from(splitTitle.chars, {
        opacity: 0,
        y: 50,
        rotateX: 90,
        stagger: 0.05,
        duration: 0.8,
        ease: "power3.out",
      });
    }

    if (taglineRef.current) {
      tl.from(
        taglineRef.current,
        {
          opacity: 0,
          y: 30,
          duration: 1,
          ease: "power2.out",
        },
        "-=0.5"
      );
    }

    if (ctaRef.current) {
      tl.from(
        ctaRef.current,
        {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.3"
      );
    }

    // Parallax effect for the section itself
    tl.to(sectionRef.current, { backgroundPositionY: "20%", ease: "none" }, 0);

    // Animation for the new abstract background shape
    if (backgroundShapeRef.current) {
      gsap.to(backgroundShapeRef.current, {
        backgroundPosition: "200% 200%",
        duration: 20,
        ease: "none",
        repeat: -1,
        yoyo: true,
      });
    }

    // Scroll down indicator animation
    if (scrollIndicatorRef.current) {
      gsap.to(scrollIndicatorRef.current, {
        opacity: 0,
        visibility: "hidden",
        duration: 0.5,
        ease: "power1.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "bottom 50%",
          toggleActions: "play none none reverse",
        },
      });
    }
  }, []);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 py-16 sm:py-24 bg-gradient-to-br from-background via-purple-950/20 to-blue-950/20 overflow-hidden"
    >
      {/* Abstract, pulsating shape in the background */}
      <div
        ref={backgroundShapeRef}
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, rgba(138,43,226,0.15) 0%, transparent 60%), radial-gradient(ellipse at top left, rgba(75,0,130,0.1) 0%, transparent 70%), radial-gradient(ellipse at bottom right, rgba(25, 25, 112, 0.1) 0%, transparent 80%)",
          backgroundSize: "200% 200%, 150% 150%, 180% 180%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center, top left, bottom right",
        }}
      />

      {/* Main content - removed the box-like container */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <h1
          ref={titleRef}
          className={cn(
            silkscreen.className,
            "text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-extrabold text-foreground leading-tight drop-shadow-lg"
          )}
        >
          NeuroNest
        </h1>
        <p
          ref={taglineRef}
          className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
        >
          Your AI-powered second brain for seamless memory management,
          intelligent search, and conversational insights.
        </p>
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12"
        >
          {user ? (
            <Link href="/dashboard">
              <Button
                size="lg"
                className="hover:scale-105 transition-transform bg-violet-600 hover:bg-violet-700 text-white shadow-md"
              >
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="cursor-pointer hover:scale-105 transition-transform bg-violet-600 hover:bg-violet-700 text-white shadow-md"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/log-in">
                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-pointer hover:scale-105 transition-transform border-violet-500 text-violet-500 hover:bg-violet-500/10 shadow-md"
                >
                  Log In
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Scroll Down Indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce"
        >
          <p className="text-sm text-muted-foreground mb-2">Scroll Down</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default NewHeroSection;
