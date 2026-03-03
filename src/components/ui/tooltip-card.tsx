import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const Tooltip = ({
  content,
  children,
  containerClassName,
}: {
  content: string | React.ReactNode;
  children: React.ReactNode;
  containerClassName?: string;
}): React.ReactElement => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const calculatePosition = (clientX: number, clientY: number) => {
    const tooltipWidth = 180;
    const tooltipHeight = 70;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = clientX + 14;
    let y = clientY + 14;

    if (x + tooltipWidth > viewportWidth) x = clientX - tooltipWidth - 14;
    if (x < 8) x = 8;
    if (y + tooltipHeight > viewportHeight) y = clientY - tooltipHeight - 14;
    if (y < 8) y = 8;

    return { x, y };
  };

  const show = (clientX: number, clientY: number) => {
    setPosition(calculatePosition(clientX, clientY));
    setIsVisible(true);
  };

  const hide = () => setIsVisible(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setPosition(calculatePosition(e.clientX, e.clientY));
  };

  const tooltipEl = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="pointer-events-none fixed z-[99999] min-w-[10rem] max-w-[14rem] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg px-3 py-2 text-[11px] text-neutral-600 dark:text-neutral-300 leading-snug"
          style={{ top: position.y, left: position.x }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div
      ref={containerRef}
      className={cn("inline-block", containerClassName)}
      onMouseEnter={(e) => show(e.clientX, e.clientY)}
      onMouseLeave={hide}
      onMouseMove={handleMouseMove}
    >
      {children}
      {typeof document !== "undefined" && ReactDOM.createPortal(tooltipEl, document.body)}
    </div>
  );
};
