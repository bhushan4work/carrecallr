import type { HTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  neutral: "border border-border bg-surface-subtle text-muted-foreground",
  primary: "border border-primary/15 bg-primary-subtle text-primary",
  success: "border border-success/15 bg-success-subtle text-success",
  warning: "border border-warning/15 bg-warning-subtle text-warning",
  danger: "border border-danger/15 bg-danger-subtle text-danger",
  info: "border border-info/15 bg-info-subtle text-info",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
