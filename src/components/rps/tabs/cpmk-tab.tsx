"use client"

import React from "react"
import { Plus, Trash2, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { CPMKTabProps, CPMKForm } from "@/types/rps-form"

export function CPMKTab({
  cpmkList,
  setCpmkList,
  cplList,
  subCpmkList = [],
  setSubCpmkList,
  isViewOnly = false
}: CPMKTabProps) {
  
  const addCpmk = () => {
    if (!setCpmkList || !setSubCpmkList) return
    const newCpmk: CPMKForm = {
      kode: `CPMK-${String(cpmkList.length + 1).padStart(2, '0')}`,
      deskripsi: "",
      cpl_ids: []
    }
    setCpmkList([...cpmkList, newCpmk])
    setSubCpmkList([...subCpmkList, []])
  }
  
  const removeCpmk = (index: number) => {
    if (!setCpmkList || !setSubCpmkList) return
    if (cpmkList.length > 1) {
      setCpmkList(cpmkList.filter((_, i) => i !== index))
      setSubCpmkList(subCpmkList.filter((_, i) => i !== index))
    }
  }
  
  const updateCpmk = (index: number, field: keyof CPMKForm, value: string | string[]) => {
    if (!setCpmkList) return
    const updated = [...cpmkList]
    updated[index] = { ...updated[index], [field]: value }
    setCpmkList(updated)
  }
  
  const toggleCplForCpmk = (cpmkIndex: number, cplId: string) => {
    if (!setCpmkList) return
    const updated = [...cpmkList]
    const currentCplIds = updated[cpmkIndex].cpl_ids || []
    if (currentCplIds.includes(cplId)) {
      updated[cpmkIndex].cpl_ids = currentCplIds.filter(id => id !== cplId)
    } else {
      updated[cpmkIndex].cpl_ids = [...currentCplIds, cplId]
    }
    setCpmkList(updated)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Capaian Pembelajaran Mata Kuliah (CPMK)
        </CardTitle>
        <CardDescription>
          Definisikan CPMK dan hubungkan dengan CPL yang relevan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cpmkList.map((cpmk, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-blue-50">
                  {cpmk.kode}
                </Badge>
                {!isViewOnly && cpmkList.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCpmk(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Kode CPMK</Label>
                  <Input
                    value={cpmk.kode}
                    onChange={(e) => updateCpmk(index, 'kode', e.target.value)}
                    readOnly={isViewOnly}
                    className={isViewOnly ? "bg-slate-50" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jumlah Sub-CPMK</Label>
                  <Input
                    value={subCpmkList[index]?.length || 0}
                    readOnly
                    className="bg-slate-50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Deskripsi CPMK</Label>
                <Textarea
                  value={cpmk.deskripsi}
                  onChange={(e) => updateCpmk(index, 'deskripsi', e.target.value)}
                  rows={2}
                  placeholder="Jelaskan capaian pembelajaran mata kuliah..."
                  readOnly={isViewOnly}
                  className={isViewOnly ? "bg-slate-50" : ""}
                />
              </div>
              
              <div className="space-y-2">
                <Label>CPL Terkait</Label>
                {isViewOnly ? (
                  <div className="flex flex-wrap gap-2">
                    {(cpmk.cpl_ids || []).map(cplId => {
                      const cpl = cplList.find(c => c.id === cplId)
                      return cpl ? (
                        <Badge key={cplId} variant="outline">
                          {cpl.kode}
                        </Badge>
                      ) : null
                    })}
                    {(!cpmk.cpl_ids || cpmk.cpl_ids.length === 0) && (
                      <span className="text-sm text-slate-500">Belum ada CPL terkait</span>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {cplList.map((cpl) => (
                      <div key={cpl.id} className="flex items-start space-x-2 p-2 border rounded hover:bg-slate-50">
                        <Checkbox
                          id={`cpl-${index}-${cpl.id}`}
                          checked={(cpmk.cpl_ids || []).includes(cpl.id)}
                          onCheckedChange={() => toggleCplForCpmk(index, cpl.id)}
                        />
                        <label
                          htmlFor={`cpl-${index}-${cpl.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          <span className="font-medium">{cpl.kode}</span>
                          <p className="text-xs text-slate-500 line-clamp-2">{cpl.deskripsi}</p>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {!isViewOnly && (
          <Button
            type="button"
            variant="outline"
            onClick={addCpmk}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah CPMK
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default CPMKTab
