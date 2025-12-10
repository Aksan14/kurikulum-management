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
import { Plus, Trash2 } from "lucide-react";
import type { SubCPMKForm, CPMKForm } from "@/types/rps-form";

interface SubCPMKTabProps {
  subCpmkList: SubCPMKForm[];
  cpmkList: CPMKForm[];
  isViewOnly?: boolean;
  onChange?: (index: number, field: keyof SubCPMKForm, value: string | number) => void;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
}

export function SubCPMKTab({
  subCpmkList,
  cpmkList,
  isViewOnly = false,
  onChange,
  onAdd,
  onRemove,
}: SubCPMKTabProps) {
  if (isViewOnly) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Sub-CPMK</h3>
          <Badge variant="outline">{subCpmkList.length} Sub-CPMK</Badge>
        </div>

        {subCpmkList.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Belum ada Sub-CPMK yang ditambahkan
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {subCpmkList.map((subCpmk, index) => {
              const parentCpmk = cpmkList.find(
                (c) => c.id?.toString() === subCpmk.cpmk_id
              );
              return (
                <Card key={subCpmk.id || index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Badge variant="default">Sub-CPMK {index + 1}</Badge>
                      <span className="font-mono text-sm text-muted-foreground">
                        {subCpmk.kode}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Deskripsi
                      </Label>
                      <p className="text-sm">{subCpmk.deskripsi || "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Urutan
                        </Label>
                        <p className="text-sm font-medium">{subCpmk.urutan}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          CPMK Terkait
                        </Label>
                        <p className="text-sm">
                          {parentCpmk ? (
                            <Badge variant="outline">{parentCpmk.kode}</Badge>
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sub-CPMK</h3>
          <p className="text-sm text-muted-foreground">
            Kelola Sub Capaian Pembelajaran Mata Kuliah
          </p>
        </div>
        <Button type="button" onClick={onAdd} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Sub-CPMK
        </Button>
      </div>

      {subCpmkList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Belum ada Sub-CPMK yang ditambahkan
            </p>
            <Button type="button" onClick={onAdd} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Sub-CPMK Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subCpmkList.map((subCpmk, index) => (
            <Card key={subCpmk.id || index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Sub-CPMK {index + 1}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`subcpmk-kode-${index}`}>Kode</Label>
                    <Input
                      id={`subcpmk-kode-${index}`}
                      value={subCpmk.kode}
                      onChange={(e) => onChange?.(index, "kode", e.target.value)}
                      placeholder="Contoh: S-CPMK-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`subcpmk-urutan-${index}`}>Urutan</Label>
                    <Input
                      id={`subcpmk-urutan-${index}`}
                      type="number"
                      min="1"
                      value={subCpmk.urutan}
                      onChange={(e) =>
                        onChange?.(index, "urutan", parseInt(e.target.value) || 1)
                      }
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`subcpmk-cpmk-${index}`}>CPMK Terkait</Label>
                  <Select
                    value={subCpmk.cpmk_id}
                    onValueChange={(value) => onChange?.(index, "cpmk_id", value)}
                  >
                    <SelectTrigger id={`subcpmk-cpmk-${index}`}>
                      <SelectValue placeholder="Pilih CPMK" />
                    </SelectTrigger>
                    <SelectContent>
                      {cpmkList.map((cpmk) => (
                        <SelectItem
                          key={cpmk.id || cpmk.kode}
                          value={cpmk.id?.toString() || ""}
                        >
                          {cpmk.kode} - {cpmk.deskripsi?.substring(0, 50)}
                          {(cpmk.deskripsi?.length || 0) > 50 ? "..." : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`subcpmk-deskripsi-${index}`}>Deskripsi</Label>
                  <Textarea
                    id={`subcpmk-deskripsi-${index}`}
                    value={subCpmk.deskripsi}
                    onChange={(e) =>
                      onChange?.(index, "deskripsi", e.target.value)
                    }
                    placeholder="Deskripsi Sub-CPMK"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {subCpmkList.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">
            Total Sub-CPMK: {subCpmkList.length}
          </span>
        </div>
      )}
    </div>
  );
}
