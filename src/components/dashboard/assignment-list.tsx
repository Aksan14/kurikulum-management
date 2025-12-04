import { Badge } from "@/components/ui/badge"
import { cn, formatDateTime } from "@/lib/utils"
import { CPLAssignment } from "@/types"
import { UserCheck, Clock, CheckCircle, XCircle, Hourglass } from "lucide-react"

interface AssignmentListProps {
  items: CPLAssignment[]
}

const statusConfig = {
  assigned: { label: 'Ditugaskan', variant: 'warning' as const, icon: Hourglass },
  accepted: { label: 'Diterima', variant: 'info' as const, icon: UserCheck },
  rejected: { label: 'Ditolak', variant: 'danger' as const, icon: XCircle },
  done: { label: 'Selesai', variant: 'success' as const, icon: CheckCircle },
}

export function AssignmentList({ items }: AssignmentListProps) {
  return (
    <div className="space-y-3">
      {items.map((assignment) => {
        const status = statusConfig[assignment.status]
        const StatusIcon = status.icon
        
        return (
          <div
            key={assignment.id}
            className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                assignment.status === 'done' ? "bg-emerald-100" :
                assignment.status === 'accepted' ? "bg-blue-100" :
                assignment.status === 'rejected' ? "bg-red-100" :
                "bg-amber-100"
              )}>
                <StatusIcon className={cn(
                  "h-5 w-5",
                  assignment.status === 'done' ? "text-emerald-600" :
                  assignment.status === 'accepted' ? "text-blue-600" :
                  assignment.status === 'rejected' ? "text-red-600" :
                  "text-amber-600"
                )} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-slate-900 group-hover:text-blue-600">
                    {assignment.mataKuliah}
                  </h4>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">
                  {assignment.dosenName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <Clock className="h-4 w-4" />
              <span>{formatDateTime(assignment.assignedAt)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
