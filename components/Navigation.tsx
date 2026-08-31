"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useSpring, useMotionValueEvent } from "framer-motion";
import { Menu, X, ArrowUpRight, ArrowUp } from "lucide-react";
import { Container, LogoMark, Magnetic } from "@/components/UI";
import { useActiveSection } from "@/lib/hooks";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Floating scroll-to-top button — fades and pops in once you're a screen past the hero. */
export function BackToTop() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 640);
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          data-cursor-label="TOP"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ y: -4, scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.3, ease: easeOutExpo }}
          className="glass-elevated fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full text-text-primary sm:bottom-8 sm:right-8"
        >
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

const NAV_ITEMS = [
  { id: "home",     label: "Home" },
  { id: "about",    label: "About" },
  { id: "journey",  label: "Journey" },
  { id: "skills",   label: "Stack" },
  { id: "projects", label: "Projects" },
  { id: "contact",  label: "Contact" },
] as const;

const IDS = NAV_ITEMS.map((item) => item.id);

const pillTransition = { type: "spring", stiffness: 380, damping: 32 } as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeId = useActiveSection(IDS);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setMobileOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: easeOutExpo }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border bg-bg/90 py-3 shadow-[0_1px_24px_rgba(45,36,32,0.07)] backdrop-blur-xl"
          : "py-5"
      )}
    >
      <Container className="flex items-center justify-between gap-4">
        {/* ── Logo ── */}
        <Magnetic strength={0.25}>
          <Link href="#home" data-cursor-label="HOME" className="shrink-0">
            <motion.div whileHover={{ rotate: -4, scale: 1.05 }} transition={pillTransition}>
              <LogoMark />
            </motion.div>
          </Link>
        </Magnetic>

        {/* ── Desktop nav pill container ── */}
        <nav
          className="hidden items-center md:flex"
          onMouseLeave={() => setHoveredId(null)}
        >
          {/* outer capsule */}
          <div className="relative flex items-center rounded-full border border-border bg-bg-elevated px-1 py-1 shadow-[0_2px_12px_rgba(45,36,32,0.06)]">
            {NAV_ITEMS.map((item) => {
              const isActive = activeId === item.id;
              const isHovered = hoveredId === item.id;

              return (
                <Magnetic key={item.id} strength={0.15}>
                  <Link
                    href={`#${item.id}`}
                    data-cursor-label="GO"
                    onMouseEnter={() => setHoveredId(item.id)}
                    className={cn(
                      "group relative flex items-center gap-1.5 rounded-full px-3.5 py-2 transition-colors duration-200",
                      isActive
                        ? "text-bg"
                        : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {/* Active filled pill */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-fill"
                        transition={pillTransition}
                        className="absolute inset-0 -z-10 rounded-full bg-[#8a5a52]"
                      />
                    )}

                    {/* Hover ghost pill */}
                    {!isActive && isHovered && (
                      <motion.span
                        layoutId="nav-hover-pill"
                        transition={pillTransition}
                        className="absolute inset-0 -z-10 rounded-full bg-bg-elevated-2"
                      />
                    )}

                    {/* Label */}
                    <span className="text-[13px] font-medium tracking-wide">
                      {item.label}
                    </span>
                  </Link>
                </Magnetic>
              );
            })}
          </div>
        </nav>

        {/* ── Right side: CTA + mobile toggle ── */}
        <div className="flex items-center gap-3">
          {/* Hire / Contact CTA — desktop only */}
          <Magnetic strength={0.2}>
            <Link
              href="#contact"
              data-cursor-label="✉"
              className={cn(
                "hidden items-center gap-1.5 rounded-full border border-[#8a5a52]/40 bg-[#8a5a52]/8 px-4 py-2 text-[13px] font-semibold text-[#8a5a52] transition-all duration-200 md:flex",
                "hover:border-[#8a5a52] hover:bg-[#8a5a52] hover:text-bg"
              )}
            >
              <span>Hire me</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Magnetic>

          {/* Mobile hamburger */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-elevated shadow-sm md:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2, ease: easeOutExpo }}
                  className="flex"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2, ease: easeOutExpo }}
                  className="flex"
                >
                  <Menu className="h-4 w-4" aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </Container>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: easeOutExpo }}
            className="mx-4 mt-2 overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-[0_8px_32px_rgba(45,36,32,0.1)] md:hidden"
          >
            <div className="flex flex-col p-2">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: easeOutExpo, delay: i * 0.04 }}
                >
                  <Link
                    href={`#${item.id}`}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-colors",
                      activeId === item.id
                        ? "text-bg"
                        : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {activeId === item.id && (
                      <motion.span
                        layoutId="nav-active-pill-mobile"
                        transition={pillTransition}
                        className="absolute inset-0 -z-10 rounded-xl bg-[#8a5a52]"
                      />
                    )}
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}

              <div className="mt-2 border-t border-border pt-2">
                <Link
                  href="#contact"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#8a5a52] px-4 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                >
                  <span>Hire me</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, mass: 0.2 });

  return (
    <motion.div
      style={{ scaleX }}
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-aurora"
    />
  );
}
