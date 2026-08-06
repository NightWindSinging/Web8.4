"use client";

import { CloudUpload, ImagePlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { MEDIA_UPLOAD_ACCEPT, MEDIA_UPLOAD_MAX_BYTES, uploadMediaFile } from "@/lib/media/upload-client";

export default function MediaUploader({ storageMode }: { storageMode: "R2" | "LOCAL" | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [alt, setAlt] = useState("");
  const [status, setStatus] = useState<{ state: "idle" | "uploading" | "success" | "error"; message: string }>({ state: "idle", message: "" });

  async function upload(files?: FileList | File[] | null) {
    if (!files || !files.length || !storageMode) return;
    const selected = Array.from(files).slice(0, 20);
    setStatus({ state: "uploading", message: `正在上传 1 / ${selected.length}` });
    let completed = 0;
    try {
      for (const file of selected) {
        if (file.size > MEDIA_UPLOAD_MAX_BYTES) throw new Error(`${file.name} 超过 10MB`);
        setStatus({ state: "uploading", message: `正在上传 ${completed + 1} / ${selected.length}：${file.name}` });
        await uploadMediaFile(file, selected.length === 1 ? alt : file.name.replace(/\.[^.]+$/, ""));
        completed += 1;
      }
      setStatus({ state: "success", message: `已成功上传 ${completed} 张图片` });
      setAlt("");
      router.refresh();
    } catch (error) {
      setStatus({ state: "error", message: `${completed ? `已完成 ${completed} 张。` : ""}${error instanceof Error ? error.message : "图片上传失败"}` });
      router.refresh();
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const uploading = status.state === "uploading";
  return <div className="space-y-4">
    <input ref={inputRef} type="file" multiple className="hidden" accept={MEDIA_UPLOAD_ACCEPT} onChange={(event) => void upload(event.target.files)} />
    <div
      className={`grid min-h-52 place-items-center rounded-2xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50/70"}`}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => { event.preventDefault(); if (event.currentTarget === event.target) setDragging(false); }}
      onDrop={(event) => { event.preventDefault(); setDragging(false); void upload(event.dataTransfer.files); }}
    >
      <div><div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">{uploading ? <Loader2 className="size-6 animate-spin" /> : <CloudUpload className="size-6" />}</div><strong className="block text-sm text-slate-800">拖放图片到这里，或选择文件</strong><p className="mt-2 text-xs leading-5 text-slate-400">JPG / JPEG / PNG / WebP · 单张最大 10MB · 最多 20 张</p><Button type="button" className="mt-4" disabled={!storageMode || uploading} onClick={() => inputRef.current?.click()}><ImagePlus className="size-4" />选择图片</Button></div>
    </div>
    <div className="space-y-2"><label htmlFor="media-alt" className="text-sm font-medium text-slate-700">Alt 文本（单图上传）</label><Input id="media-alt" value={alt} onChange={(event) => setAlt(event.target.value)} maxLength={300} placeholder="Custom rigid gift box with magnetic closure" disabled={uploading} /></div>
    {status.message ? <div className={`rounded-xl px-4 py-3 text-sm ${status.state === "error" ? "bg-red-50 text-red-700" : status.state === "success" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>{status.message}</div> : null}
  </div>;
}
