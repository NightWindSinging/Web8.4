import Link from "next/link";
import { Pencil, Plus, X } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DatabaseSetupNotice from "@/components/admin/DatabaseSetupNotice";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";
import { Badge } from "@/components/admin/ui/badge";
import { Button, buttonVariants } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select } from "@/components/admin/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { Textarea } from "@/components/admin/ui/textarea";
import { deleteDatabaseCategoryAction, saveDatabaseCategoryAction } from "@/lib/cms/category-actions";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

const errorMessages: Record<string, string> = {
  name: "请填写分类名称。",
  "slug-format": "Slug 必须包含英文字母或数字。",
  "slug-duplicate": "该类型下已经存在相同 Slug，请更换。",
  "type-in-use": "分类已经关联内容，不能修改分类类型。",
  "in-use": "该分类仍有关联文章或产品，必须先转移内容后才能删除。",
  "not-found": "分类不存在或已经被删除。",
};

const navigationGroupLabel = {
  PACKAGING_TYPE: "包装类型",
  INDUSTRY: "行业分类",
} as const;

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ edit?: string; saved?: string; deleted?: string; error?: string }> }) {
  const query = await searchParams;
  if (!isDatabaseConfigured()) return <><AdminPageHeader eyebrow="Taxonomy" title="分类管理" description="连接 PostgreSQL 后即可使用分类管理。" /><DatabaseSetupNotice /></>;
  const categories = await prisma.category.findMany({ include: { _count: { select: { articles: true, products: true } } }, orderBy: [{ type: "asc" }, { name: "asc" }] });
  const editing = query.edit ? categories.find((category) => category.id === query.edit) || null : null;
  const editingCount = editing ? editing._count.articles + editing._count.products : 0;

  return <>
    <AdminPageHeader eyebrow="Taxonomy" title="分类管理" description="分别维护产品分类和文章分类；有关联内容的分类受数据库保护，不能直接删除。" />
    {query.saved ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">分类已{query.saved === "updated" ? "更新" : "创建"}。</div> : null}
    {query.deleted ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">分类已删除。</div> : null}
    {query.error ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessages[query.error] || "分类操作失败。"}</div> : null}
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Card className="h-fit xl:sticky xl:top-28"><CardHeader><div className="flex items-start justify-between gap-4"><div><CardTitle>{editing ? "编辑分类" : "新增分类"}</CardTitle><CardDescription className="mt-1.5">Slug 留空时根据英文名称自动生成。</CardDescription></div>{editing ? <Link href="/admin/categories" className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="取消编辑"><X className="size-4" /></Link> : null}</div></CardHeader><CardContent>
        <form action={saveDatabaseCategoryAction} className="space-y-5">
          <input type="hidden" name="id" value={editing?.id || ""} />
          <div className="space-y-2"><Label htmlFor="name">名称 *</Label><Input id="name" name="name" defaultValue={editing?.name || ""} required maxLength={160} /></div>
          <div className="space-y-2"><Label htmlFor="slug">Slug *</Label><Input id="slug" name="slug" defaultValue={editing?.slug || ""} placeholder="luxury-packaging" pattern="[a-zA-Z0-9-]+" /></div>
          <div className="space-y-2"><Label htmlFor="description">描述</Label><Textarea id="description" name="description" className="min-h-28" defaultValue={editing?.description || ""} maxLength={5000} placeholder="说明该分类包含的内容和适用范围。" /></div>
          <div className="space-y-2"><Label htmlFor="type">分类类型</Label>{editing && editingCount > 0 ? <><input type="hidden" name="type" value={editing.type} /><Select id="type" defaultValue={editing.type} disabled><option value="ARTICLE">文章分类</option><option value="PRODUCT">产品分类</option></Select><p className="text-xs leading-5 text-amber-600">已有 {editingCount} 条关联内容，分类类型已锁定。</p></> : <Select id="type" name="type" defaultValue={editing?.type || "ARTICLE"}><option value="ARTICLE">文章分类</option><option value="PRODUCT">产品分类</option></Select>}</div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <strong className="text-sm text-slate-900">超级菜单设置</strong>
            <p className="mt-1 text-xs leading-5 text-slate-500">仅产品分类生效；保存后自动同步到前台 Products 超级菜单。</p>
            <div className="mt-4 space-y-4">
              <div className="space-y-2"><Label htmlFor="navigationGroup">导航分组</Label><Select id="navigationGroup" name="navigationGroup" defaultValue={editing?.navigationGroup || "PACKAGING_TYPE"}><option value="">不在导航显示</option><option value="PACKAGING_TYPE">By packaging type</option><option value="INDUSTRY">By industry</option></Select></div>
              <div className="space-y-2"><Label htmlFor="navigationOrder">显示顺序</Label><Input id="navigationOrder" name="navigationOrder" type="number" min="0" max="999" defaultValue={editing?.navigationOrder ?? 0} /><p className="text-xs text-slate-400">数字越小越靠前。</p></div>
              <div className="space-y-2"><Label htmlFor="navigationImage">菜单推荐图片 URL</Label><Input id="navigationImage" name="navigationImage" defaultValue={editing?.navigationImage || ""} maxLength={1200} placeholder="/uploads/media/... 或 https://..." /><p className="text-xs leading-5 text-slate-400">分组中第一张已设置的图片会用于右侧 Featured solution。</p></div>
            </div>
          </div>
          <Button type="submit" className="w-full">{editing ? <><Pencil className="size-4" />保存修改</> : <><Plus className="size-4" />新增分类</>}</Button>
        </form>
      </CardContent></Card>
      <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>名称</TableHead><TableHead>Slug</TableHead><TableHead>类型</TableHead><TableHead>导航</TableHead><TableHead>关联内容</TableHead><TableHead>描述</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader><TableBody>
        {categories.map((category) => {
          const count = category._count.articles + category._count.products;
          return <TableRow key={category.id}>
            <TableCell className="font-medium text-slate-900">{category.name}</TableCell>
            <TableCell>/{category.slug}</TableCell>
            <TableCell><Badge>{category.type === "ARTICLE" ? "文章分类" : "产品分类"}</Badge></TableCell>
            <TableCell>{category.type === "PRODUCT" && category.navigationGroup ? <span className="text-sm text-slate-600">{navigationGroupLabel[category.navigationGroup]} · {category.navigationOrder}</span> : <span className="text-slate-400">不显示</span>}</TableCell>
            <TableCell><span className={count ? "font-semibold text-slate-900" : "text-slate-400"}>{count}</span>{category._count.articles && category._count.products ? <span className="ml-1 text-xs text-slate-400">文章 {category._count.articles} / 产品 {category._count.products}</span> : null}</TableCell>
            <TableCell><p className="max-w-56 truncate text-sm text-slate-500" title={category.description || ""}>{category.description || "—"}</p></TableCell>
            <TableCell><div className="flex justify-end gap-2"><Link href={`/admin/categories?edit=${category.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}><Pencil className="size-4" />编辑</Link><DeleteCategoryButton action={deleteDatabaseCategoryAction.bind(null, category.id)} disabled={count > 0} /></div></TableCell>
          </TableRow>;
        })}
        {!categories.length ? <TableRow><TableCell colSpan={7} className="py-16 text-center text-slate-400">暂无分类，请先创建文章分类或产品分类。</TableCell></TableRow> : null}
      </TableBody></Table></CardContent></Card>
    </div>
  </>;
}
