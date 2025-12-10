"use client"

import React, { useState } from 'react'
import { FileDown, Loader2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { 
  downloadAndGenerateRPS, 
  downloadBlob, 
  transformRPSToDocumentData,
  type RPSDocumentData 
} from '@/lib/docx-generator'
import { rpsService, mataKuliahService, cplService } from '@/lib/api'
import type { RPS, CPMK, SubCPMK, RencanaPembelajaran, RencanaTugas, BahanBacaan } from '@/lib/api/rps'
import type { MataKuliah } from '@/lib/api/mata-kuliah'
import type { CPL } from '@/lib/api/cpl'

interface DownloadRPSButtonProps {
  rpsId: string
  rpsData?: RPS
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

const TEMPLATE_OPTIONS = [
  { 
    id: 'simple', 
    name: 'Template RPS 2025', 
    // File dari folder public/ diakses langsung dengan path relatif
    url: '/TEMPLATE RPS.docx',
    description: 'Format standar RPS 2025'
  },
  { 
    id: 'detailed', 
    name: 'Template RPS 2025 (Simple)', 
    url: '/TEMPLATE RPS.docx',
    description: 'Format sederhana RPS 2025'
  },
]

export function DownloadRPSButton({ 
  rpsId, 
  rpsData,
  variant = 'outline',
  size = 'default',
  className 
}: DownloadRPSButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATE_OPTIONS[0].id)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch RPS data if not provided
      let rps: RPS
      if (rpsData) {
        rps = rpsData
      } else {
        const rpsResponse = await rpsService.getById(rpsId)
        if (!rpsResponse.success || !rpsResponse.data) {
          throw new Error('Gagal mengambil data RPS')
        }
        rps = rpsResponse.data
      }

      // Fetch related data
      const [mkResponse, cplResponse] = await Promise.all([
        mataKuliahService.getAll(),
        cplService.getAll()
      ])

      // Find mata kuliah
      let mataKuliah: MataKuliah | null = null
      if (mkResponse.data) {
        const mkList = Array.isArray(mkResponse.data) 
          ? mkResponse.data 
          : (mkResponse.data as { data?: MataKuliah[] }).data || []
        mataKuliah = mkList.find(mk => mk.id === rps.mata_kuliah_id) || null
      }

      // Get CPL list
      let cplList: CPL[] = []
      if (cplResponse.data) {
        cplList = Array.isArray(cplResponse.data) 
          ? cplResponse.data 
          : (cplResponse.data as { data?: CPL[] }).data || []
      }

      // Get CPMK from RPS
      const cpmkList: CPMK[] = rps.cpmk || []

      // Build Sub-CPMK map
      const subCpmkMap = new Map<string, SubCPMK[]>()
      for (const cpmk of cpmkList) {
        try {
          const subCpmkResponse = await rpsService.subCpmk.getAll(cpmk.id)
          if (subCpmkResponse.success && subCpmkResponse.data) {
            subCpmkMap.set(cpmk.id, subCpmkResponse.data)
          }
        } catch {
          console.warn(`Failed to fetch sub-CPMK for CPMK ${cpmk.id}`)
        }
      }

      // Get Rencana Pembelajaran
      let rencanaPembelajaran: RencanaPembelajaran[] = []
      try {
        const rpResponse = await rpsService.rencanaPembelajaran.getAll(rpsId)
        if (rpResponse.success && rpResponse.data) {
          rencanaPembelajaran = rpResponse.data
        }
      } catch {
        rencanaPembelajaran = rps.rencana_pembelajaran || []
      }

      // Get Rencana Tugas
      let rencanaTugas: RencanaTugas[] = []
      try {
        const rtResponse = await rpsService.rencanaTugas.getAll(rpsId)
        if (rtResponse.success && rtResponse.data) {
          rencanaTugas = rtResponse.data
        }
      } catch {
        rencanaTugas = rps.rencana_tugas || []
      }

      // Get Bahan Bacaan
      const bahanBacaan: BahanBacaan[] = rps.bahan_bacaan || []

      // Transform data
      const documentData: RPSDocumentData = transformRPSToDocumentData(
        rps,
        mataKuliah,
        cplList,
        cpmkList,
        subCpmkMap,
        rencanaPembelajaran,
        rencanaTugas,
        bahanBacaan
      )

      // Get template URL
      const template = TEMPLATE_OPTIONS.find(t => t.id === selectedTemplate)
      if (!template) {
        throw new Error('Template tidak ditemukan')
      }

      // Generate document
      const blob = await downloadAndGenerateRPS(template.url, documentData)

      // Create filename
      const filename = `RPS_${mataKuliah?.kode || 'MK'}_${mataKuliah?.nama || 'Dokumen'}_${new Date().toISOString().split('T')[0]}.docx`
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_.-]/g, '')

      // Download
      downloadBlob(blob, filename)

      setOpen(false)
    } catch (err) {
      console.error('Error generating document:', err)
      setError(err instanceof Error ? err.message : 'Gagal membuat dokumen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <FileDown className="h-4 w-4 mr-2" />
          Download RPS
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Dokumen RPS</DialogTitle>
          <DialogDescription>
            Pilih template untuk mengunduh dokumen RPS dalam format Word (.docx)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Template Dokumen</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih template" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_OPTIONS.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {template.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleDownload} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DownloadRPSButton
