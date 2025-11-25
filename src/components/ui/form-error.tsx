import { ReactNode } from "react";

interface FormErrorProps {
  children?: ReactNode;
  className?: string;
}

export function FormError({ children, className = "" }: FormErrorProps) {
  if (!children) return null;

  return (
    <p className={`text-sm text-red-600 mt-1 ${className}`}>
      {children}
    </p>
  );
}

