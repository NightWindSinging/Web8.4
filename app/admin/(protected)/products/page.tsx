import Link from "next/link";
import { Plus } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/admin/ui/badge";
import { buttonVariants, Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { deleteProductAction } from "@/lib/cms/actions";
import { readDatabase } from "@/lib/cms/storage";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [database, query] = await Promise.all([readDatabase(), searchParams]);
  return <>
    <AdminPageHeader eyebrow="Catalog" title="产品管理" description="管理包装产品、产品分类、图片和搜索引擎摘要。" action={<Link className={buttonVariants()} href="/admin/products/new"><Plus className="size-4" />新建产品</Link>} />
    {query.saved ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">产品已保存。</div> : null}
    <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>产品</TableHead><TableHead>分类</TableHead><TableHead>状态</TableHead><TableHead>更新时间</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader><TableBody>
      {database.products.map((product) => { const category = database.categories.find((item) => item.id === product.categoryId); return <TableRow key={product.id}><TableCell><div className="flex items-center gap-3">{product.image ? <img src={product.image} alt="" className="size-12 rounded-lg border border-slate-100 object-cover" /> : <div className="size-12 rounded-lg bg-slate-100" />}<div><strong className="block text-slate-900">{product.name}</strong><span className="mt-1 block text-xs text-slate-400">/{product.slug}</span></div></div></TableCell><TableCell>{category?.name || "未分类"}</TableCell><TableCell><Badge variant={product.status === "published" ? "success" : "warning"}>{product.status === "published" ? "已发布" : "草稿"}</Badge></TableCell><TableCell>{new Date(product.updatedAt).toLocaleDateString("zh-CN")}</TableCell><TableCell><div className="flex justify-end gap-2"><Link href={`/admin/products/${product.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>编辑</Link><form action={deleteProductAction.bind(null, product.id)}><Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">删除</Button></form></div></TableCell></TableRow>; })}
      {!database.products.length ? <TableRow><TableCell colSpan={5} className="py-16 text-center text-slate-400">暂无产品，点击“新建产品”开始创建。</TableCell></TableRow> : null}
    </TableBody></Table></CardContent></Card>
  </>;
}
