import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const alertBannerVariants = cva(
  "border-b",
  {
    variants: {
      variant: {
        error: "bg-destructive/10 border-destructive/20",
        warning: "bg-warning-light border-warning-border",
        info: "bg-info-light border-info-border",
        success: "bg-success-light border-success-border",
      },
    },
    defaultVariants: {
      variant: "error",
    },
  }
);

export interface AlertBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertBannerVariants> {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showIcon?: boolean;
  children?: React.ReactNode;
}

const AlertBanner = React.forwardRef<HTMLDivElement, AlertBannerProps>(
  ({ 
    className, 
    variant, 
    title, 
    description, 
    onRetry, 
    onDismiss,
    showIcon = true,
    children,
    ...props 
  }, ref) => {
    const iconColor = variant === "error" 
      ? "text-destructive" 
      : variant === "warning"
      ? "text-warning-light-foreground"
      : variant === "info"
      ? "text-info-light-foreground"
      : "text-success-light-foreground";

    const textColor = variant === "error"
      ? "text-destructive-foreground"
      : variant === "warning"
      ? "text-warning-light-foreground"
      : variant === "info"
      ? "text-info-light-foreground"
      : "text-success-light-foreground";

    const borderColor = variant === "error"
      ? "border-destructive/30"
      : variant === "warning"
      ? "border-warning-border"
      : variant === "info"
      ? "border-info-border"
      : "border-success-border";

    return (
      <div
        ref={ref}
        className={cn(alertBannerVariants({ variant }), className)}
        {...props}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              {showIcon && (
                <AlertCircle className={cn("h-5 w-5 flex-shrink-0", iconColor)} />
              )}
              <div className="flex-1">
                {title && (
                  <p className={cn("text-sm font-medium", textColor)}>
                    {title}
                  </p>
                )}
                {description && (
                  <p className={cn("text-xs mt-0.5", textColor, "opacity-80")}>
                    {description}
                  </p>
                )}
                {children}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className={cn("border-current", textColor, "hover:opacity-80")}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDismiss}
                  className={cn("h-8 w-8", textColor, "hover:opacity-80")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
AlertBanner.displayName = "AlertBanner";

export { AlertBanner, alertBannerVariants };

