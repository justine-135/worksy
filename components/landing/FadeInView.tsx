"use client";

import { motion, useReducedMotion } from "motion/react";

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeInView({ children, delay = 0, className }: FadeInViewProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
