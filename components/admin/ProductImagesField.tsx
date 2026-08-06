"use client";

import { Check, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { MEDIA_UPLOAD_ACCEPT, uploadMediaFile } from "@/lib/media/upload-client";

export type ProductImageItem = { id?: string; url: string; name?: string };

async function uploadProductImage(file: File): Promise<ProductImageItem> {
  return uploadMediaFile(file, file.name);
}

export default function ProductImagesField({ defaultGallery = [], defaultMainImage = "", defaultMainImageId = "" }: { defaultGallery?: ProductImageItem[]; defaultMainImage?: string; defaultMainImageId?: string }) {
  const initialGallery = useMemo(() => {
    const byUrl = new Map<string, ProductImageItem>();
    for (const image of defaultGallery) if (image.url) byUrl.set(image.url, image);
    if (defaultMainImage && !byUrl.has(defaultMainImage)) byUrl.set(defaultMainImage, { id: defaultMainImageId || undefined, url: defaultMainImage });
    return [...byUrl.values()];
  }, [defaultGallery, defaultMainImage, defaultMainImageId]);
  const [gallery, setGallery] = useState<ProductImageItem[]>(initialGallery);
  const [mainImage, setMainImage] = useState(defaultMainImage || initialGallery[0]?.url || "");
  const [mainImageId, setMainImageId] = useState(defaultMainImageId || initialGallery[0]?.id || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files?: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: ProductImageItem[] = [];
      for (const file of Array.from(files).slice(0, 20)) uploaded.push(await uploadProductImage(file));
      setGallery((current) => {
        const urls = new Set(current.map((image) => image.url));
        return [...current, ...uploaded.filter((image) => !urls.has(image.url))];
      });
      if (!mainImage && uploaded[0]) { setMainImage(uploaded[0].url); setMainImageId(uploaded[0].id || ""); }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "图片上传失败");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function chooseMain(image: ProductImageItem) {
    setMainImage(image.url);
    setMainImageId(image.id || "");
  }

  function remove(image: ProductImageItem) {
    const next = gallery.filter((item) => item.url !== image.url);
    setGallery(next);
    if (mainImage === image.url) { setMainImage(next[0]?.url || ""); setMainImageId(next[0]?.id || ""); }
  }

  return <div className="space-y-4">
    <input type="hidden" name="gallery" value={JSON.stringify(gallery.map((image) => image.url))} />
    <input type="hidden" name="galleryMediaIds" value={JSON.stringify(gallery.flatMap((image) => image.id ? [image.id] : []))} />
    <input type="hidden" name="mainImageId" value={mainImageId} />
    <div className="space-y-2"><span className="text-sm font-medium text-slate-700">主图地址</span><Input name="mainImage" value={mainImage} onChange={(event) => { setMainImage(event.target.value); setMainImageId(""); }} placeholder="上传图片或输入 https://..." /></div>
    <input ref={inputRef} type="file" multiple className="hidden" accept={MEDIA_UPLOAD_ACCEPT} onChange={(event) => void upload(event.target.files)} />
    <Button type="button" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
      {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}{uploading ? "正在上传" : "选择多张图片"}
    </Button>
    <p className="text-xs leading-5 text-slate-400">支持 JPG、JPEG、PNG、WebP；单张最大 10MB，一次最多选择 20 张。</p>
    {gallery.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {gallery.map((image) => <div key={image.url} className={`group overflow-hidden rounded-xl border bg-white ${mainImage === image.url ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"}`}>
        <div className="relative aspect-square bg-slate-100"><img src={image.url} alt={image.name || "产品图片"} className="size-full object-cover" />{mainImage === image.url ? <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white"><Check className="size-3" />主图</span> : null}</div>
        <div className="grid grid-cols-2 border-t border-slate-100"><button type="button" className="flex h-9 items-center justify-center gap-1 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700" onClick={() => chooseMain(image)}><Star className="size-3" />设为主图</button><button type="button" className="flex h-9 items-center justify-center gap-1 border-l border-slate-100 text-xs text-red-500 hover:bg-red-50" onClick={() => remove(image)}><Trash2 className="size-3" />移除</button></div>
      </div>)}
    </div> : <div className="rounded-xl border border-dashed border-slate-200 px-5 py-12 text-center text-sm text-slate-400">尚未上传产品图片。</div>}
    {error ? <p className="text-xs text-red-600">{error}</p> : null}
  </div>;
}
