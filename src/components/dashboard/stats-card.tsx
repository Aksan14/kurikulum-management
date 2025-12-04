import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const variantStyles = {
  default: {
    bg: "bg-slate-50",
    icon: "bg-slate-100 text-slate-600",
    trend: "text-slate-600"
  },
  success: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-600",
    trend: "text-emerald-600"
  },
  warning: {
    bg: "bg-amber-50",
    icon: "bg-amber-100 text-amber-600",
    trend: "text-amber-600"
  },
  danger: {
    bg: "bg-red-50",
    icon: "bg-red-100 text-red-600",
    trend: "text-red-600"
  },
  info: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    trend: "text-blue-600"
  }
}

export function StatsCard({ title, value, description, icon: Icon, trend, variant = 'default' }: StatsCardProps) {
  const styles = variantStyles[variant]
  
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
          {trend && (
            <div className={cn("flex items-center gap-1 text-sm font-medium", styles.trend)}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-slate-400">dari bulan lalu</span>
            </div>
          )}
        </div>
        <div className={cn("rounded-xl p-3", styles.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
