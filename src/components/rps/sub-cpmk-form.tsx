"use client"

import React from "react"
import { Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { CPMK } from "@/lib/api/rps"

export interface SubCPMKForm {
  id?: string
  cpmk_id: string
  kode: string
  deskripsi: string
  urutan: number
}

interface SubCPMKFormProps {
  subCpmkList: SubCPMKForm[]
  setSubCpmkList: React.Dispatch<React.SetStateAction<SubCPMKForm[]>>
  cpmkList: CPMK[]
  formErrors?: Record<string, string>
}

export function SubCPMKFormComponent({
  subCpmkList,
  setSubCpmkList,
  cpmkList,
  formErrors = {}
}: SubCPMKFormProps) {

  const addSubCpmk = (cpmkId: string) => {
    const cpmk = cpmkList.find(c => c.id === cpmkId)
    if (!cpmk) return

    const existingSubs = subCpmkList.filter(s => s.cpmk_id === cpmkId)
    const nextNum = existingSubs.length + 1
    
    setSubCpmkList([...subCpmkList, {
      cpmk_id: cpmkId,
      kode: `${cpmk.kode}-${String(nextNum).padStart(2, '0')}`,
      deskripsi: "",
      urutan: nextNum
    }])
  }

  const removeSubCpmk = (index: number) => {
    setSubCpmkList(subCpmkList.filter((_, i) => i !== index))
  }

  const updateSubCpmk = (index: number, field: keyof SubCPMKForm, value: string | number) => {
    const updated = [...subCpmkList]
    updated[index] = { ...updated[index], [field]: value }
    setSubCpmkList(updated)
  }

  // Group sub-CPMKs by CPMK
  const groupedByCpmk = cpmkList.map(cpmk => ({
    cpmk,
    subCpmks: subCpmkList
      .map((sub, index) => ({ ...sub, originalIndex: index }))
      .filter(sub => sub.cpmk_id === cpmk.id)
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sub-CPMK (Kemampuan Akhir Tiap Tahapan)</CardTitle>
        <CardDescription>
          Breakdown CPMK menjadi kemampuan-kemampuan yang lebih spesifik
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {formErrors.sub_cpmk && (
          <p className="text-sm text-red-500">{formErrors.sub_cpmk}</p>
        )}

        {cpmkList.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Belum ada CPMK. Tambahkan CPMK terlebih dahulu di tab CPMK.
          </div>
        ) : (
          groupedByCpmk.map(({ cpmk, subCpmks }) => (
            <Card key={cpmk.id} className="bg-slate-50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline">{cpmk.kode}</Badge>
                    <p className="text-sm text-slate-600 mt-1">{cpmk.deskripsi}</p>
                  </div>
                  <Button size="sm" onClick={() => addSubCpmk(cpmk.id)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah Sub-CPMK
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {subCpmks.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-2">
                    Belum ada Sub-CPMK untuk {cpmk.kode}
                  </p>
                ) : (
                  subCpmks.map((subCpmk) => (
                    <div key={subCpmk.originalIndex} className="bg-white p-3 rounded-lg border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-700">{subCpmk.kode}</Badge>
                          <span className="text-xs text-slate-500">Urutan: {subCpmk.urutan}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeSubCpmk(subCpmk.originalIndex)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Kode</Label>
                          <Input
                            value={subCpmk.kode}
                            onChange={(e) => updateSubCpmk(subCpmk.originalIndex, 'kode', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Urutan</Label>
                          <Input
                            type="number"
                            min={1}
                            value={subCpmk.urutan}
                            onChange={(e) => updateSubCpmk(subCpmk.originalIndex, 'urutan', parseInt(e.target.value) || 1)}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Deskripsi *</Label>
                        <Textarea
                          value={subCpmk.deskripsi}
                          onChange={(e) => updateSubCpmk(subCpmk.originalIndex, 'deskripsi', e.target.value)}
                          placeholder="Deskripsi kemampuan akhir yang diharapkan..."
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default SubCPMKFormComponent
