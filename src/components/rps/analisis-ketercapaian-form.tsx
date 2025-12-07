"use client"

import React from "react"
import { Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { CPMK, SubCPMK } from "@/lib/api/rps"
import type { CPL } from "@/lib/api/cpl"

export interface AnalisisKetercapaianForm {
  id?: string
  minggu_mulai: number
  minggu_selesai: number
  cpl_id: string
  cpmk_ids: string[]
  sub_cpmk_ids: string[]
  topik_materi: string
  jenis_assessment: string
  bobot_kontribusi: number
}

interface AnalisisKetercapaianFormProps {
  analisisKetercapaian: AnalisisKetercapaianForm[]
  setAnalisisKetercapaian: React.Dispatch<React.SetStateAction<AnalisisKetercapaianForm[]>>
  cplList: CPL[]
  cpmkList: CPMK[]
  subCpmkList: SubCPMK[]
  formErrors?: Record<string, string>
}

export function AnalisisKetercapaianFormComponent({
  analisisKetercapaian,
  setAnalisisKetercapaian,
  cplList,
  cpmkList,
  subCpmkList,
  formErrors = {}
}: AnalisisKetercapaianFormProps) {

  const addAnalisis = () => {
    setAnalisisKetercapaian([...analisisKetercapaian, {
      minggu_mulai: 1,
      minggu_selesai: 4,
      cpl_id: "",
      cpmk_ids: [],
      sub_cpmk_ids: [],
      topik_materi: "",
      jenis_assessment: "Tugas + Kuis",
      bobot_kontribusi: 25
    }])
  }

  const removeAnalisis = (index: number) => {
    setAnalisisKetercapaian(analisisKetercapaian.filter((_, i) => i !== index))
  }

  const updateAnalisis = (index: number, field: keyof AnalisisKetercapaianForm, value: string | number | string[]) => {
    const updated = [...analisisKetercapaian]
    updated[index] = { ...updated[index], [field]: value }
    setAnalisisKetercapaian(updated)
  }

  const totalBobot = analisisKetercapaian.reduce((sum, a) => sum + a.bobot_kontribusi, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Analisis Ketercapaian CPL</CardTitle>
            <CardDescription>
              Definisikan bagaimana mata kuliah ini berkontribusi pada pencapaian CPL
              <br />
              <span className={totalBobot !== 100 ? "text-amber-500" : "text-green-500"}>
                Total Bobot Kontribusi: {totalBobot}%
              </span>
            </CardDescription>
          </div>
          <Button onClick={addAnalisis}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Analisis
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {formErrors.analisis_ketercapaian && (
          <p className="text-sm text-red-500">{formErrors.analisis_ketercapaian}</p>
        )}

        {analisisKetercapaian.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Belum ada analisis ketercapaian CPL. Klik tombol &quot;Tambah Analisis&quot; untuk menambahkan.
          </div>
        ) : (
          analisisKetercapaian.map((analisis, index) => (
            <Card key={index} className="bg-slate-50">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    Analisis #{index + 1} - Minggu {analisis.minggu_mulai}-{analisis.minggu_selesai}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => removeAnalisis(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Minggu Mulai</Label>
                    <Input
                      type="number"
                      min={1}
                      max={16}
                      value={analisis.minggu_mulai}
                      onChange={(e) => updateAnalisis(index, 'minggu_mulai', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Minggu Selesai</Label>
                    <Input
                      type="number"
                      min={1}
                      max={16}
                      value={analisis.minggu_selesai}
                      onChange={(e) => updateAnalisis(index, 'minggu_selesai', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Bobot Kontribusi (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={analisis.bobot_kontribusi}
                      onChange={(e) => updateAnalisis(index, 'bobot_kontribusi', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>CPL yang Dicapai *</Label>
                  <div className="flex flex-wrap gap-2">
                    {cplList.map(cpl => (
                      <Badge
                        key={cpl.id}
                        variant={analisis.cpl_id === cpl.id ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => updateAnalisis(index, 'cpl_id', cpl.id)}
                      >
                        {cpl.kode}
                      </Badge>
                    ))}
                  </div>
                  {analisis.cpl_id && (
                    <p className="text-xs text-slate-500 mt-1">
                      {cplList.find(c => c.id === analisis.cpl_id)?.deskripsi?.substring(0, 100)}...
                    </p>
                  )}
                </div>

                {cpmkList.length > 0 && (
                  <div className="space-y-2">
                    <Label>CPMK Terkait</Label>
                    <div className="flex flex-wrap gap-2">
                      {cpmkList.map(cpmk => (
                        <Badge
                          key={cpmk.id}
                          variant={analisis.cpmk_ids.includes(cpmk.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newIds = analisis.cpmk_ids.includes(cpmk.id)
                              ? analisis.cpmk_ids.filter(id => id !== cpmk.id)
                              : [...analisis.cpmk_ids, cpmk.id]
                            updateAnalisis(index, 'cpmk_ids', newIds)
                          }}
                        >
                          {cpmk.kode}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {subCpmkList.length > 0 && (
                  <div className="space-y-2">
                    <Label>Sub-CPMK Terkait</Label>
                    <div className="flex flex-wrap gap-2">
                      {subCpmkList.map(subCpmk => (
                        <Badge
                          key={subCpmk.id}
                          variant={analisis.sub_cpmk_ids.includes(subCpmk.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newIds = analisis.sub_cpmk_ids.includes(subCpmk.id)
                              ? analisis.sub_cpmk_ids.filter(id => id !== subCpmk.id)
                              : [...analisis.sub_cpmk_ids, subCpmk.id]
                            updateAnalisis(index, 'sub_cpmk_ids', newIds)
                          }}
                        >
                          {subCpmk.kode}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Topik Materi</Label>
                  <Textarea
                    value={analisis.topik_materi}
                    onChange={(e) => updateAnalisis(index, 'topik_materi', e.target.value)}
                    placeholder="Topik materi yang diajarkan..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Jenis Assessment</Label>
                  <Input
                    value={analisis.jenis_assessment}
                    onChange={(e) => updateAnalisis(index, 'jenis_assessment', e.target.value)}
                    placeholder="Contoh: Tugas + Kuis, UTS, Praktikum"
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default AnalisisKetercapaianFormComponent
