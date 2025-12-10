"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Target } from "lucide-react";
import type {
  AnalisisKetercapaianForm,
  CPMKForm,
  SubCPMKForm,
} from "@/types/rps-form";

interface CPLOption {
  id: string;
  kode: string;
  deskripsi: string;
}

interface AnalisisTabProps {
  analisisList: AnalisisKetercapaianForm[];
  cplList: CPLOption[];
  cpmkList: CPMKForm[];
  subCpmkList: SubCPMKForm[];
  isViewOnly?: boolean;
  onChange?: (
    index: number,
    field: keyof AnalisisKetercapaianForm,
    value: string | number | string[] | null
  ) => void;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
}

const JENIS_ASSESSMENT_OPTIONS = [
  "Tes Tertulis",
  "Tes Lisan",
  "Penugasan",
  "Praktikum",
  "Presentasi",
  "Portofolio",
  "Observasi",
  "Proyek",
];

export function AnalisisTab({
  analisisList,
  cplList,
  cpmkList,
  subCpmkList,
  isViewOnly = false,
  onChange,
  onAdd,
  onRemove,
}: AnalisisTabProps) {
  // Helper untuk mendapatkan kode CPL
  const getCPLKode = (cplId: string) => {
    const cpl = cplList.find((c) => c.id === cplId);
    return cpl?.kode || "-";
  };

  // Helper untuk mendapatkan kode CPMK
  const getCPMKKode = (cpmkIds: string[]) => {
    if (!cpmkIds || cpmkIds.length === 0) return "-";
    return cpmkIds
      .map((id) => cpmkList.find((c) => c.id === id)?.kode)
      .filter(Boolean)
      .join(", ");
  };

  // Helper untuk mendapatkan kode Sub-CPMK
  const getSubCPMKKode = (subCpmkIds: string[]) => {
    if (!subCpmkIds || subCpmkIds.length === 0) return "-";
    return subCpmkIds
      .map((id) => subCpmkList.find((s) => s.id === id)?.kode)
      .filter(Boolean)
      .join(", ");
  };

  if (isViewOnly) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Analisis Ketercapaian CPL</h3>
          <Badge variant="outline">{analisisList.length} Analisis</Badge>
        </div>

        {analisisList.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Belum ada analisis ketercapaian yang ditambahkan
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {analisisList.map((analisis, index) => (
              <Card key={analisis.id || index}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        CPL: {getCPLKode(analisis.cpl_id)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Minggu {analisis.minggu_mulai}
                        {analisis.minggu_selesai &&
                        analisis.minggu_selesai !== analisis.minggu_mulai
                          ? ` - ${analisis.minggu_selesai}`
                          : ""}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      Bobot: {analisis.bobot_kontribusi}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        CPMK Terkait
                      </Label>
                      <p className="text-sm">
                        {getCPMKKode(analisis.cpmk_ids)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Sub-CPMK Terkait
                      </Label>
                      <p className="text-sm">
                        {getSubCPMKKode(analisis.sub_cpmk_ids)}
                      </p>
                    </div>
                  </div>

                  {analisis.topik_materi && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Topik Materi
                      </Label>
                      <p className="text-sm">{analisis.topik_materi}</p>
                    </div>
                  )}

                  {analisis.jenis_assessment && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Jenis Assessment
                      </Label>
                      <p className="text-sm">{analisis.jenis_assessment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {analisisList.length > 0 && (
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              Total Analisis: {analisisList.length}
            </span>
            <span className="text-sm font-medium">
              Total Bobot:{" "}
              {analisisList.reduce(
                (sum, item) => sum + (item.bobot_kontribusi || 0),
                0
              )}
              %
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Analisis Ketercapaian CPL</h3>
          <p className="text-sm text-muted-foreground">
            Kelola analisis ketercapaian Capaian Pembelajaran Lulusan
          </p>
        </div>
        <Button type="button" onClick={onAdd} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Analisis
        </Button>
      </div>

      {analisisList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              Belum ada analisis ketercapaian yang ditambahkan
            </p>
            <Button type="button" onClick={onAdd} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Analisis Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {analisisList.map((analisis, index) => (
            <Card key={analisis.id || index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Analisis {index + 1}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove?.(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`analisis-minggu-mulai-${index}`}>
                      Minggu Mulai
                    </Label>
                    <Input
                      id={`analisis-minggu-mulai-${index}`}
                      type="number"
                      min="1"
                      max="16"
                      value={analisis.minggu_mulai}
                      onChange={(e) =>
                        onChange?.(
                          index,
                          "minggu_mulai",
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`analisis-minggu-selesai-${index}`}>
                      Minggu Selesai
                    </Label>
                    <Input
                      id={`analisis-minggu-selesai-${index}`}
                      type="number"
                      min="1"
                      max="16"
                      value={analisis.minggu_selesai || ""}
                      onChange={(e) =>
                        onChange?.(
                          index,
                          "minggu_selesai",
                          e.target.value
                            ? parseInt(e.target.value)
                            : null
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`analisis-bobot-${index}`}>
                      Bobot Kontribusi (%)
                    </Label>
                    <Input
                      id={`analisis-bobot-${index}`}
                      type="number"
                      min="0"
                      max="100"
                      value={analisis.bobot_kontribusi}
                      onChange={(e) =>
                        onChange?.(
                          index,
                          "bobot_kontribusi",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`analisis-cpl-${index}`}>CPL</Label>
                  <Select
                    value={analisis.cpl_id}
                    onValueChange={(value) =>
                      onChange?.(index, "cpl_id", value)
                    }
                  >
                    <SelectTrigger id={`analisis-cpl-${index}`}>
                      <SelectValue placeholder="Pilih CPL" />
                    </SelectTrigger>
                    <SelectContent>
                      {cplList.map((cpl) => (
                        <SelectItem key={cpl.id} value={cpl.id}>
                          {cpl.kode} - {cpl.deskripsi?.substring(0, 40)}
                          {(cpl.deskripsi?.length || 0) > 40 ? "..." : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`analisis-cpmk-${index}`}>CPMK Terkait</Label>
                    <Select
                      value={analisis.cpmk_ids?.[0] || ""}
                      onValueChange={(value) =>
                        onChange?.(index, "cpmk_ids", value ? [value] : [])
                      }
                    >
                      <SelectTrigger id={`analisis-cpmk-${index}`}>
                        <SelectValue placeholder="Pilih CPMK" />
                      </SelectTrigger>
                      <SelectContent>
                        {cpmkList.map((cpmk) => (
                          <SelectItem
                            key={cpmk.id || cpmk.kode}
                            value={cpmk.id || ""}
                          >
                            {cpmk.kode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`analisis-subcpmk-${index}`}>
                      Sub-CPMK Terkait
                    </Label>
                    <Select
                      value={analisis.sub_cpmk_ids?.[0] || ""}
                      onValueChange={(value) =>
                        onChange?.(index, "sub_cpmk_ids", value ? [value] : [])
                      }
                    >
                      <SelectTrigger id={`analisis-subcpmk-${index}`}>
                        <SelectValue placeholder="Pilih Sub-CPMK" />
                      </SelectTrigger>
                      <SelectContent>
                        {subCpmkList.map((subCpmk) => (
                          <SelectItem
                            key={subCpmk.id || subCpmk.kode}
                            value={subCpmk.id || ""}
                          >
                            {subCpmk.kode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`analisis-jenis-${index}`}>
                    Jenis Assessment
                  </Label>
                  <Select
                    value={analisis.jenis_assessment || ""}
                    onValueChange={(value) =>
                      onChange?.(index, "jenis_assessment", value)
                    }
                  >
                    <SelectTrigger id={`analisis-jenis-${index}`}>
                      <SelectValue placeholder="Pilih Jenis Assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      {JENIS_ASSESSMENT_OPTIONS.map((jenis) => (
                        <SelectItem key={jenis} value={jenis}>
                          {jenis}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`analisis-topik-${index}`}>Topik Materi</Label>
                  <Textarea
                    id={`analisis-topik-${index}`}
                    value={analisis.topik_materi || ""}
                    onChange={(e) =>
                      onChange?.(index, "topik_materi", e.target.value)
                    }
                    placeholder="Topik materi yang dibahas"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {analisisList.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">
            Total Analisis: {analisisList.length}
          </span>
          <span className="text-sm font-medium">
            Total Bobot:{" "}
            {analisisList.reduce(
              (sum, item) => sum + (item.bobot_kontribusi || 0),
              0
            )}
            %
          </span>
        </div>
      )}
    </div>
  );
}
