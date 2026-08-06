"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";

type Specification = { name: string; value: string };

function normalize(value: unknown): Specification[] {
  if (Array.isArray(value)) return value.map((row) => ({ name: String(row?.name || ""), value: String(row?.value || "") }));
  if (value && typeof value === "object") return Object.entries(value).map(([name, item]) => ({ name, value: String(item) }));
  return [];
}

export default function ProductSpecificationsField({ defaultValue }: { defaultValue?: unknown }) {
  const [rows, setRows] = useState<Specification[]>(() => normalize(defaultValue));
  const update = (index: number, key: keyof Specification, value: string) => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
  return <div className="space-y-3">
    <input type="hidden" name="specifications" value={JSON.stringify(rows)} />
    {rows.map((row, index) => <div key={index} className="grid grid-cols-[24px_minmax(0,.8fr)_minmax(0,1.2fr)_36px] items-center gap-2">
      <GripVertical className="size-4 text-slate-300" aria-hidden="true" />
      <Input value={row.name} onChange={(event) => update(index, "name", event.target.value)} placeholder="参数名，如 Material" />
      <Input value={row.value} onChange={(event) => update(index, "value", event.target.value)} placeholder="参数值，如 1200gsm greyboard" />
      <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" aria-label="删除参数" onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}><Trash2 className="size-4" /></Button>
    </div>)}
    {!rows.length ? <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">暂未添加产品参数。</div> : null}
    <Button type="button" variant="outline" size="sm" onClick={() => setRows((current) => [...current, { name: "", value: "" }])}><Plus className="size-4" />添加参数</Button>
  </div>;
}
