import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select } from "@/components/admin/ui/select";
import { Textarea } from "@/components/admin/ui/textarea";
import { saveProductAction } from "@/lib/cms/actions";
import { readDatabase } from "@/lib/cms/storage";

export default async function ProductEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const database = await readDatabase();
  const product = id === "new" ? null : database.products.find((item) => item.id === id);
  if (id !== "new" && !product) notFound();
  return <>
    <AdminPageHeader eyebrow="Product editor" title={product ? "编辑产品" : "新建产品"} description="维护产品基础信息、详情、主图和独立 SEO 字段。" />
    <form action={saveProductAction} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <input type="hidden" name="id" value={product?.id || ""} />
      <div className="space-y-6"><Card><CardHeader><CardTitle>产品内容</CardTitle></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="name">产品名称 *</Label><Input id="name" name="name" defaultValue={product?.name} required /></div><div className="space-y-2"><Label htmlFor="slug">URL Slug</Label><Input id="slug" name="slug" defaultValue={product?.slug} /></div><div className="space-y-2"><Label htmlFor="summary">产品摘要</Label><Textarea id="summary" name="summary" className="min-h-24" defaultValue={product?.summary} /></div><div className="space-y-2"><Label htmlFor="description">产品详情</Label><Textarea id="description" name="description" className="min-h-72 leading-7" defaultValue={product?.description} /></div></CardContent></Card><Card><CardHeader><CardTitle>SEO 设置</CardTitle></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="seoTitle">SEO Title</Label><Input id="seoTitle" name="seoTitle" defaultValue={product?.seoTitle} /></div><div className="space-y-2"><Label htmlFor="seoDescription">Meta Description</Label><Textarea id="seoDescription" name="seoDescription" className="min-h-24" defaultValue={product?.seoDescription} /></div></CardContent></Card></div>
      <aside><Card className="sticky top-28"><CardHeader><CardTitle>发布设置</CardTitle></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="status">状态</Label><Select id="status" name="status" defaultValue={product?.status || "draft"}><option value="draft">草稿</option><option value="published">已发布</option></Select></div><div className="space-y-2"><Label htmlFor="categoryId">产品分类</Label><Select id="categoryId" name="categoryId" defaultValue={product?.categoryId || ""}><option value="">未分类</option>{database.categories.filter((item) => item.type === "product").map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></div><div className="space-y-2"><Label htmlFor="image">主图地址</Label><Input id="image" name="image" defaultValue={product?.image} placeholder="/uploads/product.jpg" /><p className="text-xs leading-5 text-slate-400">可先在媒体管理上传图片，再复制图片地址。</p></div><Button type="submit" className="w-full">保存产品</Button></CardContent></Card></aside>
    </form>
  </>;
}
