import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  children?: ReactNode;
  className?: string;
}

export function FormError({ children, className = "" }: FormErrorProps) {
  if (!children) return null;

  return (
    <p className={cn("text-sm text-destructive mt-1", className)}>
      {children}
    </p>
  );
}



