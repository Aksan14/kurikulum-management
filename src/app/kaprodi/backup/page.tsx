"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Database,
  Download,
  RefreshCw,
  Check,
  AlertTriangle,
  HardDrive,
  Calendar,
  FileText,
  Archive,
  Trash2,
  Settings,
  History,
  CloudDownload,
  CloudUpload,
  Server,
  Lock,
  Info,
  Loader2,
  AlertCircle,
  Upload
} from 'lucide-react'
import { backupService, Backup, authService } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'

export default function BackupRestorePage() {
  const router = useRouter()
  
  // Data State
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Settings State
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true)
  const [encryptionEnabled, setEncryptionEnabled] = useState(true)
  const [selectedBackupType, setSelectedBackupType] = useState<'full' | 'rps' | 'users' | 'system' | 'cpl' | 'mata_kuliah'>('full')
  
  // Progress State
  const [backupProgress, setBackupProgress] = useState(0)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [restoreProgress, setRestoreProgress] = useState(0)
  const [isRestoring, setIsRestoring] = useState(false)
  const [activeBackupId, setActiveBackupId] = useState<string | null>(null)

  // Fetch backups
  const fetchBackups = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await backupService.getAll({ limit: 50 })
      
      if (response.success && response.data) {
        const backupList = Array.isArray(response.data) 
          ? response.data 
          : response.data.data || []
        setBackups(backupList)
      } else {
        setBackups([])
      }
    } catch (err) {
      console.error('Error fetching backups:', err)
      setError('Gagal memuat data backup. Pastikan server API berjalan.')
      // Use empty array as fallback
      setBackups([])
    } finally {
      setLoading(false)
    }
  }, [router])

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const response = await backupService.getSettings()
      if (response.success && response.data) {
        setAutoBackupEnabled(response.data.auto_backup_enabled)
        setEncryptionEnabled(response.data.encryption_enabled)
      }
    } catch (err) {
      console.error('Error fetching backup settings:', err)
    }
  }, [])

  useEffect(() => {
    fetchBackups()
    fetchSettings()
  }, [fetchBackups, fetchSettings])

  const startBackup = async () => {
    setIsBackingUp(true)
    setBackupProgress(0)
    setError(null)

    try {
      // Start backup via API
      const response = await backupService.create({
        type: selectedBackupType,
        name: `${getBackupTypeName(selectedBackupType)} - ${new Date().toISOString().split('T')[0]}`,
        description: getBackupDescription(selectedBackupType)
      })

      // Simulate progress (in real implementation, poll for status)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setBackupProgress(i)
      }

      if (response.success && response.data) {
        setBackups(prev => [response.data!, ...prev])
        alert('Backup berhasil dibuat!')
      } else {
        throw new Error(response.message || 'Gagal membuat backup')
      }
    } catch (err) {
      console.error('Error creating backup:', err)
      setError(err instanceof Error ? err.message : 'Gagal membuat backup')
      alert('Gagal membuat backup: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsBackingUp(false)
      setBackupProgress(0)
    }
  }

  const startRestore = async (backupId: string) => {
    if (!confirm('Apakah Anda yakin ingin melakukan restore? Proses ini akan mengganti data yang ada.')) {
      return
    }

    setIsRestoring(true)
    setRestoreProgress(0)
    setActiveBackupId(backupId)
    setError(null)

    try {
      // Call restore API
      const response = await backupService.restore({
        backup_id: backupId,
        confirm: true
      })

      // Simulate progress
      for (let i = 0; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 150))
        setRestoreProgress(i)
      }

      if (response.success) {
        alert('Restore berhasil dilakukan!')
      } else {
        throw new Error(response.message || 'Gagal melakukan restore')
      }
    } catch (err) {
      console.error('Error restoring backup:', err)
      setError(err instanceof Error ? err.message : 'Gagal melakukan restore')
      alert('Gagal melakukan restore: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsRestoring(false)
      setRestoreProgress(0)
      setActiveBackupId(null)
    }
  }

  const downloadBackup = async (backup: Backup) => {
    try {
      const blob = await backupService.download(backup.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = backup.name || `backup-${backup.id}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading backup:', err)
      alert('Gagal mengunduh backup')
    }
  }

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus backup ini?')) {
      return
    }

    try {
      const response = await backupService.delete(backupId)
      if (response.success) {
        setBackups(prev => prev.filter(b => b.id !== backupId))
        alert('Backup berhasil dihapus')
      } else {
        throw new Error(response.message || 'Gagal menghapus backup')
      }
    } catch (err) {
      console.error('Error deleting backup:', err)
      alert('Gagal menghapus backup: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const updateSettings = async () => {
    try {
      await backupService.updateSettings({
        auto_backup_enabled: autoBackupEnabled,
        encryption_enabled: encryptionEnabled
      })
    } catch (err) {
      console.error('Error updating settings:', err)
    }
  }

  const getBackupTypeName = (type: string) => {
    switch (type) {
      case 'full': return 'Full System Backup'
      case 'rps': return 'RPS Data Backup'
      case 'users': return 'User Management Backup'
      case 'system': return 'System Configuration Backup'
      case 'cpl': return 'CPL Data Backup'
      case 'mata_kuliah': return 'Mata Kuliah Backup'
      default: return 'Backup'
    }
  }

  const getBackupDescription = (type: string) => {
    switch (type) {
      case 'full': return 'Backup lengkap sistem termasuk semua data dan konfigurasi'
      case 'rps': return 'Backup data RPS dan dokumen terkait'
      case 'users': return 'Backup data pengguna, roles, dan permissions'
      case 'system': return 'Backup konfigurasi sistem dan pengaturan aplikasi'
      case 'cpl': return 'Backup data CPL dan mapping'
      case 'mata_kuliah': return 'Backup data mata kuliah dan penugasan'
      default: return 'Backup data sistem'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Selesai</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Gagal</Badge>
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Proses</Badge>
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Menunggu</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full':
        return <Database className="h-4 w-4 text-blue-600" />
      case 'rps':
        return <FileText className="h-4 w-4 text-green-600" />
      case 'users':
        return <Server className="h-4 w-4 text-purple-600" />
      case 'system':
        return <Settings className="h-4 w-4 text-orange-600" />
      default:
        return <Archive className="h-4 w-4 text-gray-600" />
    }
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return '-'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const totalBackupSize = backups.reduce((total, backup) => total + (backup.size || 0), 0)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Memuat data backup...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Backup & Restore</h1>
            <p className="text-slate-600">
              Kelola backup data sistem dan pemulihan data
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchBackups}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              {error}
            </CardContent>
          </Card>
        )}

        {/* System Status */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HardDrive className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{backups.length}</p>
                  <p className="text-sm text-slate-600">Total Backups</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {backups.filter(b => b.status === 'completed').length}
                  </p>
                  <p className="text-sm text-slate-600">Berhasil</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Server className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{formatSize(totalBackupSize)}</p>
                  <p className="text-sm text-slate-600">Total Size</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudDownload className="h-5 w-5 text-blue-600" />
              Buat Backup Baru
            </CardTitle>
            <CardDescription>
              Pilih jenis data yang akan di-backup
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="backup-type">Jenis Backup</Label>
                    <select
                      id="backup-type"
                      value={selectedBackupType}
                      onChange={(e) => setSelectedBackupType(e.target.value as typeof selectedBackupType)}
                      className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="full">Full System Backup</option>
                      <option value="rps">RPS Data Only</option>
                      <option value="users">User Management</option>
                      <option value="system">System Config</option>
                      <option value="cpl">CPL Data</option>
                      <option value="mata_kuliah">Mata Kuliah Data</option>
                    </select>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-slate-900 mb-1">
                          {getBackupTypeName(selectedBackupType)}
                        </p>
                        <p className="text-slate-600">
                          {getBackupDescription(selectedBackupType)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Pengaturan Backup</Label>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Auto Backup</p>
                          <p className="text-sm text-slate-600">Backup otomatis setiap minggu</p>
                        </div>
                        <button
                          onClick={() => {
                            setAutoBackupEnabled(!autoBackupEnabled)
                            updateSettings()
                          }}
                          className={`relative w-11 h-6 rounded-full transition-colors ${autoBackupEnabled ? "bg-blue-600" : "bg-slate-200"}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoBackupEnabled ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Enkripsi</p>
                          <p className="text-sm text-slate-600">Enkripsi backup dengan password</p>
                        </div>
                        <button
                          onClick={() => {
                            setEncryptionEnabled(!encryptionEnabled)
                            updateSettings()
                          }}
                          className={`relative w-11 h-6 rounded-full transition-colors ${encryptionEnabled ? "bg-green-600" : "bg-slate-200"}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${encryptionEnabled ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Backup Progress */}
              {isBackingUp && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                    <p className="font-medium text-blue-900">
                      Membuat backup... {backupProgress}%
                    </p>
                  </div>
                  <Progress value={backupProgress} className="h-2" />
                </div>
              )}

              {/* Restore Progress */}
              {isRestoring && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <CloudUpload className="h-5 w-5 text-green-600 animate-pulse" />
                    <p className="font-medium text-green-900">
                      Melakukan restore... {restoreProgress}%
                    </p>
                  </div>
                  <Progress value={restoreProgress} className="h-2" />
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={startBackup} 
                  disabled={isBackingUp || isRestoring}
                  className="flex items-center gap-2"
                >
                  {isBackingUp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isBackingUp ? 'Membuat Backup...' : 'Mulai Backup'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backup History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-green-600" />
              Riwayat Backup
            </CardTitle>
            <CardDescription>
              Daftar backup yang telah dibuat
            </CardDescription>
          </CardHeader>
          <CardContent>
            {backups.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Belum ada backup</p>
                <p className="text-sm text-slate-500 mt-1">Buat backup pertama Anda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map(backup => (
                  <div 
                    key={backup.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        {getTypeIcon(backup.type)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{backup.name}</p>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <span>{backup.size_formatted || formatSize(backup.size)}</span>
                          <span>•</span>
                          <span>{formatDateTime(backup.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(backup.status)}
                      
                      {backup.status === 'completed' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadBackup(backup)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => startRestore(backup.id)}
                            disabled={isRestoring}
                          >
                            {isRestoring && activeBackupId === backup.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteBackup(backup.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
