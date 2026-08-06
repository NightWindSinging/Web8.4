import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DatabaseSetupNotice from "@/components/admin/DatabaseSetupNotice";
import ProductImagesField, { type ProductImageItem } from "@/components/admin/ProductImagesField";
import ProductSpecificationsField from "@/components/admin/ProductSpecificationsField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select } from "@/components/admin/ui/select";
import { Textarea } from "@/components/admin/ui/textarea";
import { saveDatabaseProductAction } from "@/lib/cms/product-actions";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

const errorMessages: Record<string, string> = {
  name: "请填写产品名称。",
  "slug-format": "Slug 必须包含英文字母或数字。",
  "slug-duplicate": "Slug 已被其他产品使用，请更换。",
  category: "所选产品分类不存在。",
  canonical: "Canonical URL 必须是以 / 开头的站内路径，或完整的 HTTP/HTTPS 地址。",
};

export default async function ProductEditorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!isDatabaseConfigured()) return <><AdminPageHeader eyebrow="Product editor" title="产品编辑器" description="连接 PostgreSQL 后即可使用。" /><DatabaseSetupNotice /></>;
  const [product, categories] = await Promise.all([
    id === "new" ? null : prisma.product.findUnique({ where: { id }, include: { galleryMedia: { select: { id: true, url: true, name: true } } } }),
    prisma.category.findMany({ where: { type: "PRODUCT" }, orderBy: { name: "asc" } }),
  ]);
  if (id !== "new" && !product) notFound();
  const galleryByUrl = new Map<string, ProductImageItem>();
  for (const media of product?.galleryMedia || []) galleryByUrl.set(media.url, media);
  for (const url of product?.gallery || []) if (!galleryByUrl.has(url)) galleryByUrl.set(url, { url });

  return <>
    <AdminPageHeader eyebrow="Product editor" title={product ? "编辑产品" : "新建产品"} description="类似 WordPress 的分区编辑体验：内容、参数、图库、发布和 SEO 设置相互独立。" />
    {query.saved ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">产品已保存并写入 PostgreSQL。</div> : null}
    {query.error ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessages[query.error] || "保存失败，请检查输入。"}</div> : null}
    <form action={saveDatabaseProductAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <input type="hidden" name="id" value={product?.id || ""} />
      <div className="min-w-0 space-y-6">
        <Card><CardHeader><CardTitle>产品内容</CardTitle><CardDescription>产品名称和 Slug 构成前台产品的核心地址信息。</CardDescription></CardHeader><CardContent className="space-y-5">
          <div className="space-y-2"><Label htmlFor="name">产品名称 *</Label><Input id="name" name="name" defaultValue={product?.name} required maxLength={240} /></div>
          <div className="space-y-2"><Label htmlFor="slug">URL Slug *</Label><Input id="slug" name="slug" defaultValue={product?.slug} placeholder="rigid-gift-boxes" pattern="[a-zA-Z0-9-]+" /><p className="text-xs text-slate-400">留空时根据英文产品名称自动生成。</p></div>
          <div className="space-y-2"><Label>产品描述</Label><RichTextEditor name="description" defaultValue={product?.description || ""} placeholder="介绍产品结构、材料、应用场景、定制能力与采购信息……" /></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>产品参数</CardTitle><CardDescription>添加 Material、Size、Printing、MOQ 等参数，前台可按顺序展示。</CardDescription></CardHeader><CardContent><ProductSpecificationsField defaultValue={product?.specifications} /></CardContent></Card>
        <Card><CardHeader><CardTitle>产品图片</CardTitle><CardDescription>支持批量上传、图库管理和主图选择。</CardDescription></CardHeader><CardContent><ProductImagesField defaultGallery={[...galleryByUrl.values()]} defaultMainImage={product?.mainImage || ""} defaultMainImageId={product?.mainImageId || ""} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Google SEO 设置</CardTitle><CardDescription>产品页会自动生成 Product Schema 和 Breadcrumb Schema。</CardDescription></CardHeader><CardContent className="space-y-5">
          <div className="space-y-2"><Label htmlFor="seoTitle">SEO Title</Label><Input id="seoTitle" name="seoTitle" defaultValue={product?.seoTitle || ""} maxLength={70} placeholder="Custom Product Name Manufacturer | DATANGXING" /><p className="text-xs text-slate-400">建议约 50–60 个英文字符；留空时使用产品名称。</p></div>
          <div className="space-y-2"><Label htmlFor="seoDescription">SEO Description</Label><Textarea id="seoDescription" name="seoDescription" className="min-h-24" defaultValue={product?.seoDescription || ""} maxLength={180} placeholder="Describe the product, customization capability and buyer value." /><p className="text-xs text-slate-400">建议约 140–160 个英文字符。</p></div>
          <div className="space-y-2"><Label htmlFor="keywords">关键词</Label><Textarea id="keywords" name="keywords" className="min-h-20" defaultValue={product?.keywords.join(", ") || ""} placeholder="custom rigid boxes, luxury packaging, gift box manufacturer" /><p className="text-xs text-slate-400">使用逗号或换行分隔。</p></div>
          <div className="space-y-2"><Label htmlFor="canonicalUrl">Canonical URL</Label><Input id="canonicalUrl" name="canonicalUrl" defaultValue={product?.canonicalUrl || ""} maxLength={1000} placeholder="/products/rigid-gift-boxes" /><p className="text-xs text-slate-400">默认自动使用当前产品 URL；一般无需填写。</p></div>
        </CardContent></Card>
      </div>
      <aside><Card className="xl:sticky xl:top-28"><CardHeader><CardTitle>发布设置</CardTitle></CardHeader><CardContent className="space-y-5">
        <div className="space-y-2"><Label htmlFor="status">状态</Label><Select id="status" name="status" defaultValue={product?.status || "DRAFT"}><option value="DRAFT">草稿</option><option value="PUBLISHED">已发布</option><option value="ARCHIVED">已归档</option></Select></div>
        <div className="space-y-2"><Label htmlFor="categoryId">产品分类</Label><Select id="categoryId" name="categoryId" defaultValue={product?.categoryId || ""}><option value="">未分类</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select>{!categories.length ? <p className="text-xs text-amber-600">暂无产品分类，请先执行 pnpm db:seed。</p> : null}</div>
        <Button type="submit" className="w-full">保存产品</Button>
      </CardContent></Card></aside>
    </form>
  </>;
}
