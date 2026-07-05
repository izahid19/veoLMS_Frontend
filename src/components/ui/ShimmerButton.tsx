import React from "react";
import { cn } from "../../Utils/helpers";

export const ShimmerButton = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={cn(
        "inline-flex animate-shimmer items-center justify-center rounded bg-[linear-gradient(110deg,var(--primary-container),45%,#ff9940,55%,var(--primary-container))] bg-[length:200%_100%] transition-colors hover:scale-95 duration-300 shadow-success-glow text-white focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2 focus:ring-offset-background",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
