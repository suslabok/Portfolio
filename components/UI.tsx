"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 18, stiffness: 200, mass: 0.4 });
  const springY = useSpring(y, { damping: 18, stiffness: 200, mass: 0.4 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * strength);
    y.set((event.clientY - rect.top - rect.height / 2) * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  cursorLabel?: string;
  className?: string;
  external?: boolean;
  download?: boolean | string;
}

export function Button({
  href,
  children,
  variant = "primary",
  cursorLabel,
  className,
  external = false,
  download,
}: ButtonProps) {
  const base =
    "group inline-flex items-center gap-2 border-2 px-5 py-3 text-sm font-bold tracking-wide transition-all duration-200 ease-out";

  const styles =
    variant === "primary"
      ? "bg-[#8a5a52] text-white border-[#8a5a52] hover:-translate-y-0.5 hover:bg-[#75473f] hover:shadow-[4px_4px_0_#e8d34a]"
      : "bg-bg-elevated text-text-primary border-border hover:border-accent-violet hover:text-accent-violet";

  return (
    <Magnetic>
      <Link
        href={href}
        data-cursor-label={cursorLabel}
        className={cn(base, styles, className)}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...(download !== undefined ? { download } : {})}
      >
        {children}
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </Link>
    </Magnetic>
  );
}

type ContainerTag = "div" | "section" | "header" | "footer" | "main" | "article" | "nav";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;

  as?: ContainerTag;
}

export function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10", className)}>
      {children}
    </Tag>
  );
}

interface CornerBracketsProps {
  className?: string;
  toneClassName?: string;
}

export function CornerBrackets({ className, toneClassName }: CornerBracketsProps) {
  const arm = "absolute h-4 w-4";
  const corners = toneClassName
    ? [toneClassName, toneClassName, toneClassName, toneClassName]
    : ["border-accent-violet/60", "border-accent-pink/60", "border-accent-cyan/60", "border-accent-pink/60"];

  const positions = [
    { className: cn(arm, "left-0 top-0 border-l border-t", corners[0]), from: { x: -6, y: -6 } },
    { className: cn(arm, "right-0 top-0 border-r border-t", corners[1]), from: { x: 6, y: -6 } },
    { className: cn(arm, "bottom-0 left-0 border-b border-l", corners[2]), from: { x: -6, y: 6 } },
    { className: cn(arm, "bottom-0 right-0 border-b border-r", corners[3]), from: { x: 6, y: 6 } },
  ];

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      {positions.map((corner, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, x: corner.from.x, y: corner.from.y }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.08 * index, ease: [0.16, 1, 0.3, 1] }}
          className={corner.className}
        />
      ))}
    </div>
  );
}

export function LogoMark() {
  return (
    <div className="relative inline-flex h-16 w-40 items-center justify-center select-none">
      {/* Big S A letters */}
      <motion.span
        className="absolute inset-0 flex items-center justify-center font-serif text-7xl font-bold tracking-tighter text-[#8a5a52]"
        aria-hidden="true"
        animate={{ opacity: [0.92, 1, 0.92] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="-mr-3">S</span>
        <span>A</span>
      </motion.span>

      {/* Name cut into the middle of the letters */}
      <span className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-bg px-1.5 py-0.5 font-sans text-[11px] font-medium tracking-tight text-[#8a5a52]">
        Sushma Acharya
      </span>
    </div>
  );
}

interface MarkerHighlightProps {
  children: ReactNode;
  className?: string;
  /** Delay before the marker starts sweeping in, in seconds. */
  delay?: number;
}

/**
 * The yellow highlighter behind every section heading, but drawn on —
 * scales in left-to-right like a real marker stroke — the first time it
 * scrolls into view, instead of just being there as static CSS.
 */
export function MarkerHighlight({ children, className, delay = 0.2 }: MarkerHighlightProps) {
  return (
    <span className={cn("marker-highlight relative inline-block", className)}>
      <motion.span
        aria-hidden="true"
        initial={{ scaleX: 0, skewX: -6, rotate: -1 }}
        whileInView={{ scaleX: 1, skewX: -6, rotate: -1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.65, ease: easeOutExpo, delay }}
        className="marker-highlight-stroke"
      />
      <span className="relative">{children}</span>
    </span>
  );
}

interface TagLabelProps {
  children: string;
  className?: string;
}

export function TagLabel({ children, className }: TagLabelProps) {
  return (
    <span className={cn("tag-label inline-flex items-center gap-1.5", className)}>
      <motion.span
        aria-hidden="true"
        initial={{ opacity: 0, x: 6 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="text-accent-pink/70"
      >
        {"<"}
      </motion.span>
      <span className="text-gradient font-semibold">{children.toUpperCase()}</span>
      <motion.span
        aria-hidden="true"
        initial={{ opacity: 0, x: -6 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="text-accent-cyan/70"
      >
        {"/>"}
      </motion.span>
      <motion.span
        aria-hidden="true"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear", times: [0, 0.5, 0.5, 1] }}
        className="ml-0.5 inline-block h-3 w-[2px] bg-accent-pink/70"
      />
    </span>
  );
}
