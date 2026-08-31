import type { Variants, Transition } from "framer-motion";

export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];
export const easeOutQuart: Transition["ease"] = [0.25, 1, 0.5, 1];

/** Spring preset for the custom cursor and other pointer-follow elements. */
export const cursorSpring = { damping: 28, stiffness: 320, mass: 0.4 } as const;

/** Spring preset for the scrapbook paper-drop reveal: quick, with a soft bounce on landing. */
export const paperSpring: Transition = {
  type: "spring",
  stiffness: 240,
  damping: 20,
  mass: 0.85,
};


export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30, rotate: -2.5, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: paperSpring,
  },
};

/** Parent wrapper that staggers its children's fadeUp/reveal animations. */
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});


export const tokenReveal: Variants = {
  hidden: { opacity: 0, y: "0.6em", rotate: -1.5, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    filter: "blur(0px)",
    transition: paperSpring,
  },
};


export const scrapbookWord = (index = 0): Variants => {
  const dir = index % 2 === 0 ? -1 : 1;
  return {
    hidden: { opacity: 0, y: 26, rotate: dir * 11, scale: 0.82 },
    show: {
      opacity: 1,
      y: 0,
      rotate: dir * -1.4,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 220,
        damping: 15,
        mass: 0.8,
        delay: index * 0.09,
      },
    },
  };
};

/** Soft scale-in for cards and panels entering on scroll. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: easeOutQuart },
  },
};

/** Default viewport config so scroll-reveals trigger once, slightly early. */
export const viewportOnce = { once: true, margin: "-80px" } as const;