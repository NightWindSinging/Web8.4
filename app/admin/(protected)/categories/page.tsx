import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select } from "@/components/admin/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { deleteCategoryAction, saveCategoryAction } from "@/lib/cms/actions";
import { readDatabase } from "@/lib/cms/storage";

export default async function CategoriesPage() {
  const database = await readDatabase();
  return <>
    <AdminPageHeader eyebrow="Taxonomy" title="分类管理" description="分别建立文章分类和产品分类，保持内容结构清晰。" />
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card><CardHeader><CardTitle>新增分类</CardTitle><CardDescription>Slug 留空时将根据英文名称自动生成。</CardDescription></CardHeader><CardContent><form action={saveCategoryAction} className="space-y-5"><div className="space-y-2"><Label htmlFor="name">分类名称 *</Label><Input id="name" name="name" required /></div><div className="space-y-2"><Label htmlFor="slug">Slug</Label><Input id="slug" name="slug" placeholder="luxury-packaging" /></div><div className="space-y-2"><Label htmlFor="type">分类类型</Label><Select id="type" name="type"><option value="article">文章分类</option><option value="product">产品分类</option></Select></div><Button type="submit" className="w-full">新增分类</Button></form></CardContent></Card>
      <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>名称</TableHead><TableHead>Slug</TableHead><TableHead>类型</TableHead><TableHead>内容数量</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader><TableBody>{database.categories.map((category) => { const count = category.type === "article" ? database.articles.filter((item) => item.categoryId === category.id).length : database.products.filter((item) => item.categoryId === category.id).length; return <TableRow key={category.id}><TableCell className="font-medium text-slate-900">{category.name}</TableCell><TableCell>/{category.slug}</TableCell><TableCell><Badge>{category.type === "article" ? "文章" : "产品"}</Badge></TableCell><TableCell>{count}</TableCell><TableCell><div className="flex justify-end"><form action={deleteCategoryAction.bind(null, category.id)}><Button type="submit" variant="ghost" size="sm" disabled={count > 0} className="text-red-600 hover:bg-red-50">删除</Button></form></div></TableCell></TableRow>; })}</TableBody></Table></CardContent></Card>
    </div>
  </>;
}
