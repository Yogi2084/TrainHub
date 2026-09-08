"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { ScrollToPlugin } from "gsap/dist/ScrollToPlugin";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { cn } from "@/lib/utils";
import { silkscreen } from "@/lib/fonts";
import { auth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const Navbar = () => {
  const navRef = useRef(null);
  const { data } = auth.useSession();
  const user = data?.user;
  const pathname = usePathname();
  const hideLogin = pathname === "/log-in" || pathname === "/sign-up";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const navbar = navRef.current;

    if (navbar) {
      // Set initial state of the navbar to be sticky and have a solid background
      gsap.set(navbar, {
        top: 0,
        width: "100vw",
        left: "50%",
        x: "-50%",
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 0,
        boxShadow: "none",
      });
    }

    // Close menu on scroll
    const handleScroll = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      // Cleanup ScrollTrigger and event listener
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen]); // Depend on isMenuOpen to re-register scroll listener when menu state changes

  const scrollToSection = (id: string, duration?: number) => {
    console.log(`Attempting to scroll to section: ${id}`);
    const element = document.getElementById(id);
    if (element) {
      console.log(
        `Found element with id ${id}. OffsetTop: ${element.offsetTop}`,
      );
      gsap.to(window, {
        scrollTo: {
          y: element.offsetTop,
          autoKill: false,
        },
        duration: duration || 1.5, // Use provided duration or default to 1.5
        ease: "linear", // Changed easing to linear for equal speed
        onComplete: () => console.log(`Scroll to ${id} completed.`), // Log completion
      });
      console.log(`GSAP scroll animation initiated for ${id}.`);
    } else {
      console.log(`Element with id ${id} not found.`);
    }
  };

  return (
    <div
      ref={navRef}
      className="fixed z-30 transition-all duration-300 p-4 sm:p-6 lg:px-8 bg-primary/20 border-b shadow-primary-2xl"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className="cursor-pointer"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
        <Link href="/" className="flex items-center space-x-2">
          <span
            className={cn(
              silkscreen.className,
              "text-2xl font-bold text-foreground hover:text-violet-500 transition-colors",
            )}
          >
            TrainHub
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          <button
            onClick={() => scrollToSection("features-section")}
            className="text-muted-foreground hover:text-foreground transition-colors hidden md:block"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("footer-section", 3.5)}
            className="text-muted-foreground hover:text-foreground transition-colors hidden md:block"
          >
            Contact
          </button>

          {user ? (
            <div className="flex items-center space-x-6">
              <span className="text-lg text-[--color-muted-foreground] hover:text-violet-500 transition-colors duration-300 hidden md:block">
                {user.name}
              </span>
              <Button
                variant="outline"
                onClick={() => auth.signOut()}
                className="hidden md:block"
              >
                Logout
              </Button>
              <ModeToggle />
            </div>
          ) : (
            <div className="flex items-center space-x-6">
              {!hideLogin && (
                <Button
                  asChild
                  variant="outline"
                  className="hover:cursor-pointer bg-violet-200 hover:bg-violet-300 border border-[--color-border] text-[--color-muted-foreground] hover:text-[--color-foreground] hover:border-[--color-foreground] px-6 py-2 rounded-lg transition-colors duration-300 hidden md:block"
                >
                  <Link href="/log-in">Login</Link>
                </Button>
              )}
              <ModeToggle />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-y-0 left-0 w-64 z-50 h-screen bg-chart-1 transform overflow-y-auto ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden flex flex-col p-4 space-y-4`}
      >
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/favicon.ico"
              alt="NeuroNest Logo"
              className="h-6 w-6 mr-2"
              width={24}
              height={24}
            />
            <span
              className={cn(
                silkscreen.className,
                "text-xl font-bold text-primary-foreground hover:text-primary-foreground/80 transition-colors",
              )}
            >
              TrainHub
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
            className="cursor-pointer"
          >
            <X className="h-6 w-6 text-primary-foreground" />
          </Button>
        </div>
        <div className="flex flex-col flex-grow space-y-4 py-4 h-full px-3">
          <button
            onClick={() => {
              scrollToSection("features-section");
              setIsMenuOpen(false);
            }}
            className="cursor-pointer text-foreground hover:text-foreground/80 transition-colors text-left py-2"
          >
            Features
          </button>
          <button
            onClick={() => {
              scrollToSection("footer-section", 3.5);
              setIsMenuOpen(false);
            }}
            className="cursor-pointer text-foreground hover:text-foreground/80 transition-colors text-left py-2"
          >
            Contact
          </button>
          <button
            onClick={() => {
              router.push("/log-in");
            }}
            className="cursor-pointer text-foreground hover:text-foreground/80 transition-colors text-left py-2"
          >
            Login
          </button>
          <button
            onClick={() => {
              router.push("/sign-up");
            }}
            className="cursor-pointer text-foreground hover:text-foreground/80 transition-colors text-left py-2"
          >
            SignUp
          </button>
        </div>
        <div className="flex flex-col space-y-4 mt-auto pt-4 border-t border-border">
          <div className="flex flex-col space-y-4"></div>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden h-screen backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Navbar;
