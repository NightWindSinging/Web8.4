import Link from "next/link";
import { PackageOpen, Plus } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DatabaseSetupNotice from "@/components/admin/DatabaseSetupNotice";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { buttonVariants } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { deleteDatabaseProductAction } from "@/lib/cms/product-actions";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ deleted?: string; error?: string }> }) {
  const query = await searchParams;
  const configured = isDatabaseConfigured();
  const products = configured
    ? await prisma.product.findMany({ include: { category: { select: { name: true } } }, orderBy: { updatedAt: "desc" } })
    : [];
  return <>
    <AdminPageHeader eyebrow="Catalog" title="产品管理" description="管理产品资料、图库、参数和独立 SEO 信息。" action={configured ? <Link className={buttonVariants()} href="/admin/products/new"><Plus className="size-4" />新建产品</Link> : undefined} />
    {!configured ? <DatabaseSetupNotice /> : <>
      {query.deleted ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">产品已删除。</div> : null}
      {query.error === "not-found" ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">产品不存在或已被删除。</div> : null}
      <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>产品图片</TableHead><TableHead>产品名称</TableHead><TableHead>分类</TableHead><TableHead>更新时间</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader><TableBody>
        {products.map((product) => <TableRow key={product.id}>
          <TableCell>{product.mainImage ? <img src={product.mainImage} alt="" className="size-16 rounded-xl border border-slate-100 object-cover" /> : <div className="flex size-16 items-center justify-center rounded-xl bg-slate-100 text-slate-300"><PackageOpen className="size-6" /></div>}</TableCell>
          <TableCell><strong className="block text-slate-900">{product.name}</strong><span className="mt-1 block text-xs text-slate-400">/products/{product.slug}</span></TableCell>
          <TableCell>{product.category?.name || "未分类"}</TableCell>
          <TableCell>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(product.updatedAt)}</TableCell>
          <TableCell><div className="flex justify-end gap-2"><Link href={`/admin/products/${product.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>编辑</Link><DeleteProductButton action={deleteDatabaseProductAction.bind(null, product.id)} /></div></TableCell>
        </TableRow>)}
        {!products.length ? <TableRow><TableCell colSpan={5} className="py-16 text-center text-slate-400">暂无数据库产品，点击“新建产品”开始创建。</TableCell></TableRow> : null}
      </TableBody></Table></CardContent></Card>
    </>}
  </>;
}
