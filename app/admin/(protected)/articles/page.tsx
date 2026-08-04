import Link from "next/link";
import { Plus } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/admin/ui/badge";
import { buttonVariants, Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { deleteArticleAction } from "@/lib/cms/actions";
import { readDatabase } from "@/lib/cms/storage";

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [database, query] = await Promise.all([readDatabase(), searchParams]);
  return <>
    <AdminPageHeader eyebrow="Content" title="文章管理" description="创建和维护博客文章、采购指南与 SEO 内容。" action={<Link className={buttonVariants()} href="/admin/articles/new"><Plus className="size-4" />新建文章</Link>} />
    {query.saved ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">文章已保存。</div> : null}
    <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>标题</TableHead><TableHead>分类</TableHead><TableHead>状态</TableHead><TableHead>更新时间</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader><TableBody>
      {database.articles.map((article) => { const category = database.categories.find((item) => item.id === article.categoryId); return <TableRow key={article.id}><TableCell><strong className="block text-slate-900">{article.title}</strong><span className="mt-1 block text-xs text-slate-400">/{article.slug}</span></TableCell><TableCell>{category?.name || "未分类"}</TableCell><TableCell><Badge variant={article.status === "published" ? "success" : "warning"}>{article.status === "published" ? "已发布" : "草稿"}</Badge></TableCell><TableCell>{new Date(article.updatedAt).toLocaleDateString("zh-CN")}</TableCell><TableCell><div className="flex justify-end gap-2"><Link href={`/admin/articles/${article.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>编辑</Link><form action={deleteArticleAction.bind(null, article.id)}><Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">删除</Button></form></div></TableCell></TableRow>; })}
      {!database.articles.length ? <TableRow><TableCell colSpan={5} className="py-16 text-center text-slate-400">暂无文章，点击“新建文章”开始创建。</TableCell></TableRow> : null}
    </TableBody></Table></CardContent></Card>
  </>;
}
