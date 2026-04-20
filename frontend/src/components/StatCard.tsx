import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  variant?: "default" | "primary" | "warning" | "success" | "destructive" | "info";
}

const variantStyles = {
  default: "bg-card border-border",
  primary: "bg-primary/10 border-primary/20",
  warning: "bg-warning/10 border-warning/20",
  success: "bg-success/10 border-success/20",
  destructive: "bg-destructive/10 border-destructive/20",
  info: "bg-info/10 border-info/20",
};

const iconStyles = {
  default: "text-muted-foreground",
  primary: "text-primary",
  warning: "text-warning",
  success: "text-success",
  destructive: "text-destructive",
  info: "text-info",
};

export function StatCard({ title, value, icon: Icon, trend, trendUp, variant = "default" }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border p-5 stat-card-hover", variantStyles[variant])}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <Icon className={cn("h-5 w-5", iconStyles[variant])} />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-heading font-bold text-foreground animate-count-up">{value}</span>
        {trend && (
          <span className={cn("text-xs font-medium", trendUp ? "text-success" : "text-destructive")}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
