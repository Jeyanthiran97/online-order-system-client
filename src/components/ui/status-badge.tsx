import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors",
  {
      variants: {
        status: {
          // Light backgrounds with dark text for proper contrast
          delivered: "bg-status-delivered-light text-status-delivered-light-foreground border-status-delivered-border",
          pending: "bg-status-pending-light text-status-pending-light-foreground border-status-pending-border",
          confirmed: "bg-status-pending-light text-status-pending-light-foreground border-status-pending-border",
          shipped: "bg-status-shipped-light text-status-shipped-light-foreground border-status-shipped-border",
          "in-transit": "bg-status-shipped-light text-status-shipped-light-foreground border-status-shipped-border",
          cancelled: "bg-status-cancelled-light text-status-cancelled-light-foreground border-status-cancelled-border",
          approved: "bg-success-light text-success-light-foreground border-success-border",
          rejected: "bg-status-cancelled-light text-status-cancelled-light-foreground border-status-cancelled-border",
          active: "bg-success-light text-success-light-foreground border-success-border",
          inactive: "bg-muted text-muted-foreground border-border",
          default: "bg-muted text-muted-foreground border-border",
        },
      },
    defaultVariants: {
      status: "default",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(statusBadgeVariants({ status, className }))}
        {...props}
      >
        {children}
      </span>
    );
  }
);
StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };

