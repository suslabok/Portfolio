"use client";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { useMotionValue, useSpring } from "framer-motion";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * True on devices with a mouse-like pointer (hover + fine precision).
 * Used to gate cursor-follow effects — custom cursor, parallax, tilt-by-
 * proximity — off on touch devices, where they either don't apply or would
 * just fire once on tap and stick.
 */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(FINE_POINTER_QUERY);
    const frame = window.requestAnimationFrame(() => setFine(query.matches));
    const handleChange = (event: MediaQueryListEvent) => setFine(event.matches);
    query.addEventListener("change", handleChange);
    return () => {
      window.cancelAnimationFrame(frame);
      query.removeEventListener("change", handleChange);
    };
  }, []);

  return fine;
}

export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids]);

  return active;
}

interface UseParallaxOptions {
  /** Max pixel offset at the edge of the tracked area. */
  strength?: number;
  stiffness?: number;
  damping?: number;
}

/**
 * Subtle cursor-follow translation for a single element within a larger
 * tracked area (e.g. the hero ID card drifting a few px opposite the
 * mouse). Disabled on touch devices and under prefers-reduced-motion.
 */
export function useParallax({ strength = 16, stiffness = 60, damping = 20 }: UseParallaxOptions = {}) {
  const reducedMotion = useReducedMotion();
  const isFinePointer = useFinePointer();
  const enabled = isFinePointer && !reducedMotion;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness, damping });
  const springY = useSpring(y, { stiffness, damping });

  function onMouseMove(event: MouseEvent<HTMLElement>) {
    if (!enabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    x.set(px * strength);
    y.set(py * strength);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return { x: springX, y: springY, handlers: { onMouseMove, onMouseLeave } };
}

interface UseTiltOptions {
  /** Max rotation in degrees, applied at the edge of the element. */
  strength?: number;
  stiffness?: number;
  damping?: number;
  /** Return normalized glare coordinates (-0.5..0.5) for an overlay shine. */
  withGlare?: boolean;
}

export interface TiltState {
  rotateX: ReturnType<typeof useSpring>;
  rotateY: ReturnType<typeof useSpring>;
  glareX?: number;
  glareY?: number;
  handlers: {
    onMouseMove: (e: MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
  };
}

/**
 * Mouse-position-driven 3D tilt with optional glare position, used by
 * project visuals, contact card, skill boxes, about cards, etc.
 * Animates only GPU-friendly `rotateX`/`rotateY` and exposes
 * normalized glare coordinates for a layered shine overlay.
 */
export function useTilt({
  strength = 14,
  stiffness = 200,
  damping = 20,
  withGlare = false,
}: UseTiltOptions = {}): TiltState {
  const reducedMotion = useReducedMotion();
  const isFinePointer = useFinePointer();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareXmv = useMotionValue(0);
  const glareYmv = useMotionValue(0);

  const springX = useSpring(rotateX, { stiffness, damping });
  const springY = useSpring(rotateY, { stiffness, damping });
  const glareXSpring = useSpring(glareXmv, { stiffness: stiffness * 1.4, damping });
  const glareYSpring = useSpring(glareYmv, { stiffness: stiffness * 1.4, damping });

  function onMouseMove(event: MouseEvent<HTMLElement>) {
    if (reducedMotion || !isFinePointer) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * strength);
    rotateX.set(py * -strength);
    glareXmv.set(px);
    glareYmv.set(py);
  }

  function onMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
    glareXmv.set(0);
    glareYmv.set(0);
  }

  const base: TiltState = {
    rotateX: springX,
    rotateY: springY,
    handlers: { onMouseMove, onMouseLeave },
  };
  if (withGlare) {
    // Consumers read via `style` on the glare child, so we expose motion values.
    (base as unknown as { glareXmv: typeof glareXSpring; glareYmv: typeof glareYSpring })
      .glareXmv = glareXSpring;
    (base as unknown as { glareXmv: typeof glareXSpring; glareYmv: typeof glareYSpring })
      .glareYmv = glareYSpring;
  }
  return base;
}
