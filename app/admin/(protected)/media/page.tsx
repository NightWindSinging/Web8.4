import { Copy, Upload } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { deleteMediaAction } from "@/lib/cms/actions";
import { readDatabase } from "@/lib/cms/storage";

function fileSize(bytes: number) { return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`; }

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ uploaded?: string; error?: string }> }) {
  const [database, query] = await Promise.all([readDatabase(), searchParams]);
  return <>
    <AdminPageHeader eyebrow="Media library" title="媒体管理" description="上传产品图、博客封面和企业图片。支持 JPG、PNG、WebP、AVIF，单张不超过 8 MB。" />
    {query.uploaded ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">图片上传成功。</div> : null}
    {query.error ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">图片格式或大小不符合要求。</div> : null}
    <Card className="mb-8"><CardHeader><CardTitle>上传新图片</CardTitle><CardDescription>图片保存在服务器的 public/uploads 目录。</CardDescription></CardHeader><CardContent><form action="/api/admin/media" method="post" encType="multipart/form-data" className="grid items-end gap-4 md:grid-cols-[1fr_1fr_auto]"><div className="space-y-2"><Label htmlFor="file">选择图片 *</Label><Input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required className="h-auto py-2" /></div><div className="space-y-2"><Label htmlFor="alt">图片 Alt 文本</Label><Input id="alt" name="alt" placeholder="Custom rigid gift box with magnetic closure" /></div><Button type="submit"><Upload className="size-4" />上传图片</Button></form></CardContent></Card>
    {database.media.length ? <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{database.media.map((media) => <Card key={media.id} className="overflow-hidden"><div className="aspect-square bg-slate-100"><img src={media.url} alt={media.alt || media.name} className="size-full object-cover" /></div><CardContent className="p-4"><strong className="block truncate text-sm">{media.name}</strong><span className="mt-1 block text-xs text-slate-400">{fileSize(media.size)} · {media.mimeType.replace("image/", "").toUpperCase()}</span><div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-500"><Copy className="size-3.5 shrink-0" /><code className="truncate">{media.url}</code></div><form action={deleteMediaAction.bind(null, media.id)} className="mt-3"><Button type="submit" variant="outline" size="sm" className="w-full text-red-600">删除图片</Button></form></CardContent></Card>)}</section> : <Card><CardContent className="grid min-h-56 place-items-center text-center"><div><Upload className="mx-auto mb-3 size-8 text-slate-300" /><strong className="block text-sm text-slate-700">媒体库还是空的</strong><p className="mt-1 text-sm text-slate-400">上传第一张产品或博客图片。</p></div></CardContent></Card>}
  </>;
}
