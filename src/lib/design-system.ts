/**
 * Centralized Design System Configuration
 * Use these constants for consistent styling across the application
 */

export const designSystem = {
  // Container widths
  container: {
    maxWidth: "max-w-7xl", // Standard container width
    padding: "px-4 sm:px-6 lg:px-8", // Responsive padding
  },

  // Typography - Reduced font sizes
  typography: {
    h1: "text-3xl sm:text-4xl font-bold", // Reduced from text-4xl/5xl
    h2: "text-2xl sm:text-3xl font-bold", // Reduced from text-3xl/4xl
    h3: "text-xl sm:text-2xl font-semibold",
    h4: "text-lg sm:text-xl font-semibold",
    body: "text-sm sm:text-base",
    small: "text-xs sm:text-sm",
    muted: "text-muted-foreground",
  },

  // Spacing
  spacing: {
    section: "py-8 md:py-12",
    card: "p-4 sm:p-6",
    gap: "gap-4 sm:gap-6",
  },

  // Card styles
  card: {
    base: "rounded-xl border-2 bg-card shadow-sm transition-all duration-300",
    hover: "hover:shadow-lg hover:-translate-y-1",
    interactive: "cursor-pointer",
  },

  // Button styles
  button: {
    base: "transition-all duration-200",
    hover: "hover:scale-105 active:scale-95",
  },

  // Product card specific
  productCard: {
    image: "aspect-square w-full object-cover",
    overlay: "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
  },

  // Animations
  animation: {
    fadeIn: "animate-fade-in",
    scaleIn: "animate-scale-in",
    slideIn: "animate-slide-in-left",
  },

  // Grid layouts
  grid: {
    products: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6",
    stats: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",
  },
};

// Helper function to combine classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

