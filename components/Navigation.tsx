"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useSpring, useMotionValueEvent } from "framer-motion";
import { ArrowUpRight, ArrowUp, Home, UserRound, Milestone, Layers, FolderKanban, Mail } from "lucide-react";
import { Magnetic } from "@/components/UI";
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
  { id: "home",     label: "Home",     icon: Home },
  { id: "about",    label: "About",    icon: UserRound },
  { id: "journey",  label: "Journey",  icon: Milestone },
  { id: "skills",   label: "Stack",    icon: Layers },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "contact",  label: "Contact",  icon: Mail },
] as const;

const IDS = NAV_ITEMS.map((item) => item.id);

const pillTransition = { type: "spring", stiffness: 380, damping: 32 } as const;

/** Small label bubble that pops out to the right of a dock icon on hover. */
function DockTooltip({ children }: { children: React.ReactNode }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full ml-3 -translate-x-1 whitespace-nowrap rounded-lg bg-[#1c1512]/95 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white opacity-0 shadow-[0_6px_18px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
    >
      {children}
    </span>
  );
}

/** Pinned Polaroid photo — sits above the logo mark. */
function DockBrand() {
  return (
    <Link href="#home" data-cursor-label="HOME" className="group relative mt-3 flex items-center justify-center">
      <div className="sidebar-pin" aria-hidden="true" />
      <motion.div
        whileHover={{ rotate: 0, scale: 1.06 }}
        initial={{ rotate: -3 }}
        transition={pillTransition}
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white/70 shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
      >
        <Image src="/images/profile.jpg" alt="Sushma Acharya" fill sizes="48px" className="object-cover" />
      </motion.div>
      <DockTooltip>Sushma Acharya</DockTooltip>
    </Link>
  );
}

/** "S A" monogram logo mark — sits below the pinned photo. Letters stay side by side (legible), name cuts across the middle. */
function DockLogoMark() {
  return (
    <Link
      href="#home"
      data-cursor-label="HOME"
      aria-label="Sushma Acharya — Home"
      className="group relative mb-1 mt-2 flex h-14 w-16 select-none items-center justify-center"
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center gap-0.5 font-serif text-3xl font-bold tracking-tight text-[#8a5a52]"
        initial={{ opacity: 0.92 }}
        animate={{ opacity: [0.92, 1, 0.92] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span>S</span>
        <span>A</span>
      </motion.span>

      {/* Name cut across the middle of the letters */}
      <span className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm bg-[#f7f2e9] px-1 py-[1px] font-mono text-[5.5px] font-medium uppercase leading-none tracking-[0.03em] text-[#8a5a52] shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
        Sushma Acharya
      </span>

      <DockTooltip>Sushma Acharya</DockTooltip>
    </Link>
  );
}

interface DockNavListProps {
  activeId: string;
  layoutIdPrefix: string;
}

/** Vertical icon-only nav list for the glass dock. */
function DockNavList({ activeId, layoutIdPrefix }: DockNavListProps) {
  return (
    <nav className="flex flex-1 flex-col items-center gap-2.5 py-3">
      {NAV_ITEMS.map((item) => {
        const isActive = activeId === item.id;
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={`#${item.id}`}
            data-cursor-label="GO"
            aria-label={item.label}
            className="group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-200 hover:scale-105"
          >
            {isActive && (
              <motion.span
                layoutId={`${layoutIdPrefix}-active-fill`}
                transition={pillTransition}
                className="absolute inset-0 rounded-2xl bg-[#a9695c] shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
              />
            )}
            {!isActive && (
              <span className="absolute inset-0 rounded-2xl bg-text-primary/0 transition-colors duration-200 group-hover:bg-text-primary/8" />
            )}

            <Icon
              className={cn(
                "relative h-5 w-5 transition-colors",
                isActive ? "text-white" : "text-text-primary/55 group-hover:text-text-primary/90"
              )}
              strokeWidth={2}
              aria-hidden="true"
            />
            <DockTooltip>{item.label}</DockTooltip>
          </Link>
        );
      })}
    </nav>
  );
}

/** Fixed, narrow floating icon dock — frosted transparent glass, always on. Replaces the top navbar. */
export function Sidebar() {
  const activeId = useActiveSection(IDS);

  return (
    <motion.aside
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: easeOutExpo }}
      className="glass-dock fixed left-3 top-1/2 z-40 flex w-[96px] -translate-y-1/2 flex-col items-center rounded-[32px] py-3 sm:left-4 sm:w-[104px]"
    >
      <DockBrand />
      <DockLogoMark />

      <div className="mx-3 mb-1 mt-1 h-px w-6 bg-text-primary/15" />

      <DockNavList activeId={activeId} layoutIdPrefix="dock" />

      <div className="mb-1 mt-1 flex items-center justify-center">
        <Magnetic strength={0.15}>
          <Link
            href="#contact"
            data-cursor-label="✉"
            aria-label="Hire me"
            className="group relative flex h-12 w-12 items-center justify-center rounded-2xl border border-text-primary/15 bg-text-primary/5 text-text-primary/70 transition-all duration-200 hover:border-text-primary/30 hover:bg-text-primary/10 hover:text-text-primary"
          >
            <ArrowUpRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            <DockTooltip>Hire me</DockTooltip>
          </Link>
        </Magnetic>
      </div>
    </motion.aside>
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