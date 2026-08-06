import Link from "next/link";
import { Plus } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DatabaseSetupNotice from "@/components/admin/DatabaseSetupNotice";
import DeleteArticleButton from "@/components/admin/DeleteArticleButton";
import { Badge } from "@/components/admin/ui/badge";
import { buttonVariants } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { deleteDatabaseArticleAction } from "@/lib/cms/article-actions";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

const statusLabel = { DRAFT: "草稿", PUBLISHED: "已发布", ARCHIVED: "已归档" } as const;

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> }) {
  const query = await searchParams;
  const configured = isDatabaseConfigured();
  const articles = configured
    ? await prisma.article.findMany({ include: { category: { select: { name: true } } }, orderBy: { updatedAt: "desc" } })
    : [];

  return <>
    <AdminPageHeader eyebrow="Content" title="文章管理" description="使用富文本编辑器创建、发布和维护 SEO 内容。" action={configured ? <Link className={buttonVariants()} href="/admin/articles/new"><Plus className="size-4" />新建文章</Link> : undefined} />
    {!configured ? <DatabaseSetupNotice /> : <>
      {query.saved ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">文章已保存并写入数据库。</div> : null}
      {query.deleted ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">文章已删除。</div> : null}
      {query.error === "not-found" ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">文章不存在或已被删除。</div> : null}
      <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>标题</TableHead><TableHead>分类</TableHead><TableHead>状态</TableHead><TableHead>发布时间</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader><TableBody>
        {articles.map((article) => <TableRow key={article.id}>
          <TableCell><strong className="block text-slate-900">{article.title}</strong><span className="mt-1 block text-xs text-slate-400">/blog/{article.slug}</span></TableCell>
          <TableCell>{article.category?.name || "未分类"}</TableCell>
          <TableCell><Badge variant={article.status === "PUBLISHED" ? "success" : article.status === "DRAFT" ? "warning" : "neutral"}>{statusLabel[article.status]}</Badge></TableCell>
          <TableCell>{article.status === "PUBLISHED" && article.publishedAt ? new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(article.publishedAt) : "—"}</TableCell>
          <TableCell><div className="flex justify-end gap-2"><Link href={`/admin/articles/${article.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>编辑</Link><DeleteArticleButton action={deleteDatabaseArticleAction.bind(null, article.id)} /></div></TableCell>
        </TableRow>)}
        {!articles.length ? <TableRow><TableCell colSpan={5} className="py-16 text-center text-slate-400">暂无数据库文章，点击“新建文章”开始创建。</TableCell></TableRow> : null}
      </TableBody></Table></CardContent></Card>
    </>}
  </>;
}
