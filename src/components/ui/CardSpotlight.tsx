import { useMotionValue, motion, useMotionTemplate } from "framer-motion";
import type { MouseEvent as ReactMouseEvent } from "react";
import { cn } from "../../Utils/helpers";

export const CardSpotlight = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: ReactMouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn("relative group/spotlight overflow-hidden rounded-xl", className)}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 182, 147, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};
