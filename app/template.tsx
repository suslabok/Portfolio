"use client";

import { motion } from "framer-motion";
import { easeOutExpo } from "@/lib/motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
    >
      {children}
    </motion.div>
  );
}