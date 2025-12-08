import * as React from "react";
import { cn } from "@/lib/utils";

export interface HeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  showGrid?: boolean;
  showGradient?: boolean;
  className?: string;
}

const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  ({ children, showGrid = true, showGradient = true, className, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative overflow-hidden bg-gradient-to-br from-hero-bg-start via-hero-bg-mid to-hero-bg-end text-hero-text",
          className
        )}
        {...props}
      >
        {showGrid && (
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-50" />
        )}
        {showGradient && (
          <div className="absolute inset-0 bg-gradient-to-r from-hero-accent-1/20 via-hero-accent-2/20 to-hero-accent-3/20" />
        )}
        <div className="relative z-10">
          {children}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>
    );
  }
);
HeroSection.displayName = "HeroSection";

export { HeroSection };

