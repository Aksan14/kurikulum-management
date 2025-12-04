import { Badge } from "@/components/ui/badge"
import { cn, formatDateTime } from "@/lib/utils"
import { RPS } from "@/types"
import { FileText, Clock, CheckCircle, XCircle, Send, FileCheck } from "lucide-react"

interface RecentRPSListProps {
  items: RPS[]
  showDosen?: boolean
}

const statusConfig = {
  draft: { label: 'Draft', variant: 'default' as const, icon: FileText },
  submitted: { label: 'Menunggu Review', variant: 'warning' as const, icon: Send },
  approved: { label: 'Disetujui', variant: 'success' as const, icon: CheckCircle },
  rejected: { label: 'Ditolak', variant: 'danger' as const, icon: XCircle },
  published: { label: 'Published', variant: 'info' as const, icon: FileCheck },
}

export function RecentRPSList({ items, showDosen = true }: RecentRPSListProps) {
  return (
    <div className="space-y-4">
      {items.map((rps) => {
        const status = statusConfig[rps.status]
        const StatusIcon = status.icon
        
        return (
          <div
            key={rps.id}
            className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                rps.status === 'approved' ? "bg-emerald-100" :
                rps.status === 'rejected' ? "bg-red-100" :
                rps.status === 'submitted' ? "bg-amber-100" :
                "bg-slate-100"
              )}>
                <StatusIcon className={cn(
                  "h-6 w-6",
                  rps.status === 'approved' ? "text-emerald-600" :
                  rps.status === 'rejected' ? "text-red-600" :
                  rps.status === 'submitted' ? "text-amber-600" :
                  "text-slate-600"
                )} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900 group-hover:text-blue-600">
                    {rps.mataKuliahNama}
                  </h4>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">
                  {rps.kodeMK} • {rps.sks} SKS • Semester {rps.semester}
                </p>
                {showDosen && (
                  <p className="mt-1 text-sm text-slate-400">
                    Dosen: {rps.dosenNama}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <Clock className="h-4 w-4" />
                <span>{formatDateTime(rps.updatedAt)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
