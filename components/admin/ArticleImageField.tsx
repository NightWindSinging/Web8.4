"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { MEDIA_UPLOAD_ACCEPT, uploadMediaFile } from "@/lib/media/upload-client";

export default function ArticleImageField({
  defaultUrl = "",
  defaultMediaId = "",
  title = "",
}: {
  defaultUrl?: string;
  defaultMediaId?: string;
  title?: string;
}) {
  const [url, setUrl] = useState(defaultUrl);
  const [mediaId, setMediaId] = useState(defaultMediaId);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadMediaFile(file, title || file.name);
      setUrl(uploaded.url);
      setMediaId(uploaded.id);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "图片上传失败");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return <div className="space-y-3">
    <input type="hidden" name="coverMediaId" value={mediaId} />
    <Input
      name="cover"
      value={url}
      onChange={(event) => { setUrl(event.target.value); setMediaId(""); }}
      placeholder="https://... 或上传图片"
    />
    <input ref={fileRef} type="file" className="hidden" accept={MEDIA_UPLOAD_ACCEPT} onChange={(event) => void onFile(event.target.files?.[0])} />
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
        {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
        {uploading ? "上传中" : "上传封面"}
      </Button>
      {url ? <Button type="button" variant="ghost" size="sm" onClick={() => { setUrl(""); setMediaId(""); }}><X className="size-4" />清除</Button> : null}
    </div>
    {url ? <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><img src={url} alt="文章封面预览" className="aspect-[16/9] w-full object-cover" /></div> : null}
    {error ? <p className="text-xs text-red-600">{error}</p> : null}
  </div>;
}
