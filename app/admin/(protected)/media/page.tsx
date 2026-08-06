import { HardDrive, ImageIcon } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DatabaseSetupNotice from "@/components/admin/DatabaseSetupNotice";
import MediaCardActions from "@/components/admin/MediaCardActions";
import MediaUploader from "@/components/admin/MediaUploader";
import { Badge } from "@/components/admin/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { deleteDatabaseMediaAction } from "@/lib/cms/media-actions";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { mediaStorageMode } from "@/lib/media/storage";

function fileSize(bytes: number | null) {
  if (!bytes) return "未知大小";
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

const errors: Record<string, string> = {
  "in-use": "图片正在被文章封面、产品主图或产品图库使用，请先解除关联。",
  "not-found": "图片不存在或已经被删除。",
};

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ deleted?: string; error?: string }> }) {
  const query = await searchParams;
  if (!isDatabaseConfigured()) return <><AdminPageHeader eyebrow="Media library" title="媒体管理" description="连接 PostgreSQL 后即可上传和管理图片。" /><DatabaseSetupNotice /></>;
  const [media, storageMode] = await Promise.all([
    prisma.media.findMany({ include: { _count: { select: { articleCovers: true, productMainImages: true, galleryProducts: true } } }, orderBy: { createdAt: "desc" } }),
    Promise.resolve(mediaStorageMode()),
  ]);
  return <>
    <AdminPageHeader eyebrow="Media library" title="媒体管理" description="上传产品图、文章封面和正文图片。支持 JPG、JPEG、PNG、WebP，单张最大 10MB。" />
    {query.deleted === "1" ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">图片及存储对象已删除。</div> : null}
    {query.deleted === "storage-warning" ? <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">数据库记录已删除，但存储对象清理失败，请检查存储凭据。</div> : null}
    {query.error ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errors[query.error] || "媒体操作失败。"}</div> : null}
    <Card className="mb-8"><CardHeader><div className="flex flex-wrap items-start justify-between gap-4"><div><CardTitle>上传新图片</CardTitle><CardDescription className="mt-1.5">R2 模式下图片从浏览器直传，不经过网站服务器。</CardDescription></div>{storageMode ? <Badge variant={storageMode === "R2" ? "success" : "warning"}>{storageMode === "R2" ? "Cloudflare R2" : "本地 Storage"}</Badge> : <Badge variant="warning">未配置 Storage</Badge>}</div></CardHeader><CardContent>
      {!storageMode ? <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">生产环境需要配置 Cloudflare R2，或在自托管服务器显式设置 <code>MEDIA_LOCAL_STORAGE=true</code>。</div> : null}
      <MediaUploader storageMode={storageMode} />
    </CardContent></Card>
    {media.length ? <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{media.map((item) => {
      const usage = item._count.articleCovers + item._count.productMainImages + item._count.galleryProducts;
      return <Card key={item.id} className="overflow-hidden"><div className="aspect-square bg-slate-100"><img src={item.url} alt={item.alt || item.name} loading="lazy" className="size-full object-cover" /></div><CardContent className="p-4">
        <div className="flex items-start justify-between gap-2"><strong className="min-w-0 truncate text-sm" title={item.name}>{item.name}</strong><Badge variant={item.storageProvider === "R2" ? "success" : "neutral"}>{item.storageProvider}</Badge></div>
        <span className="mt-1 block text-xs text-slate-400">{fileSize(item.size)} · {item.mimeType.replace("image/", "").toUpperCase()}{item.width && item.height ? ` · ${item.width}×${item.height}` : ""}</span>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-500"><HardDrive className="size-3.5 shrink-0" /><code className="truncate" title={item.storageKey || item.url}>{item.storageKey || item.url}</code></div>
        {usage ? <p className="mt-2 text-xs text-amber-600">正在被 {usage} 处内容使用，解除关联后才能删除。</p> : null}
        <MediaCardActions url={item.url} deleteAction={deleteDatabaseMediaAction.bind(null, item.id)} deleteDisabled={usage > 0} />
      </CardContent></Card>;
    })}</section> : <Card><CardContent className="grid min-h-56 place-items-center text-center"><div><ImageIcon className="mx-auto mb-3 size-8 text-slate-300" /><strong className="block text-sm text-slate-700">媒体库还是空的</strong><p className="mt-1 text-sm text-slate-400">上传第一张产品或博客图片。</p></div></CardContent></Card>}
  </>;
}
