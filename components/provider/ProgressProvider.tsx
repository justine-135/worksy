"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type ProgressContextType = {
  start: () => void;
};

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    if (intervalRef.current) return;

    setProgress(5);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;

        return prev + Math.random() * 15;
      });
    }, 200);
  };

  useEffect(() => {
    if (progress === 0) return;

    setProgress(100);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const timeout = setTimeout(() => {
      setProgress(0);
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <ProgressContext.Provider value={{ start }}>
      {children}

      <div
        className={`
          fixed bottom-0 left-0 z-9999
          h-1 bg-blue-500
          transition-all duration-300
        `}
        style={{
          width: `${progress}%`,
          opacity: progress === 0 ? 0 : 1,
        }}
      />
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error("useProgress must be used inside ProgressProvider");
  }

  return context;
}
