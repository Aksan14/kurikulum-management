"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  Settings,
  Bell,
  FileOutput,
  GitBranch,
  ClipboardList,
  ChevronLeft,
  GraduationCap,
  FolderKanban,
  User,
} from "lucide-react"

interface SidebarProps {
  role: 'kaprodi' | 'dosen'
  isCollapsed: boolean
  onToggle: () => void
}

const kaprodiMenuItems = [
  { href: '/kaprodi/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kaprodi/cpl', label: 'Kelola CPL', icon: GraduationCap },
  { href: '/kaprodi/assignment', label: 'Penugasan', icon: Users },
  { href: '/kaprodi/rps', label: 'Review RPS', icon: FileText },
  { href: '/kaprodi/mapping', label: 'Mapping CPL', icon: GitBranch },
  { href: '/kaprodi/dokumen', label: 'Generate Dokumen', icon: FileOutput },
  { href: '/kaprodi/mata-kuliah', label: 'Mata Kuliah', icon: BookOpen },
  { href: '/kaprodi/report', label: 'Laporan', icon: ClipboardList },
  { href: '/kaprodi/notifications', label: 'Notifikasi', icon: Bell },
  { href: '/kaprodi/profile', label: 'Profile', icon: User },
  { href: '/kaprodi/settings', label: 'Pengaturan', icon: Settings },
]

const dosenMenuItems = [
  { href: '/dosen/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dosen/assignment', label: 'Tugas Saya', icon: ClipboardList },
  { href: '/dosen/rps', label: 'RPS Saya', icon: FileText },
  { href: '/dosen/mapping', label: 'Mapping CPMK', icon: GitBranch },
  { href: '/dosen/mata-kuliah', label: 'Mata Kuliah', icon: BookOpen },
  { href: '/dosen/report', label: 'Laporan', icon: FileOutput },
  { href: '/dosen/notifications', label: 'Notifikasi', icon: Bell },
  { href: '/dosen/profile', label: 'Profile', icon: User },
  { href: '/dosen/settings', label: 'Pengaturan', icon: Settings },
]

export function Sidebar({ role, isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const menuItems = role === 'kaprodi' ? kaprodiMenuItems : dosenMenuItems

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-700/50 px-4">
        <Link href={`/${role}`} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25">
            <FolderKanban className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">Kurikulum</span>
              <span className="text-xs text-slate-400">Management System</span>
            </div>
          )}
        </Link>
        <button
          onClick={onToggle}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-700/50 hover:text-white",
            isCollapsed && "absolute -right-3 top-6 z-50 h-6 w-6 rounded-full bg-slate-800 shadow-lg"
          )}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
        </button>
      </div>

      {/* Role Badge */}
      {!isCollapsed && (
        <div className="mx-4 mt-4 rounded-lg bg-slate-800/50 p-3">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Role
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            {role === 'kaprodi' ? 'Ketua Program Studi' : 'Dosen Pengampu'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-6 space-y-1 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== `/${role}` && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? "text-white" : "text-slate-400 group-hover:text-white"
              )} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Version Info */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-lg bg-slate-800/30 p-3 text-center">
            <p className="text-xs text-slate-500">Versi 1.0.0</p>
            <p className="mt-1 text-xs text-slate-600">© 2024 Kurikulum App</p>
          </div>
        </div>
      )}
    </aside>
  )
}
