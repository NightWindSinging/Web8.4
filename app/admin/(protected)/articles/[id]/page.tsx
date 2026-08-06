import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ArticleImageField from "@/components/admin/ArticleImageField";
import DatabaseSetupNotice from "@/components/admin/DatabaseSetupNotice";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select } from "@/components/admin/ui/select";
import { Textarea } from "@/components/admin/ui/textarea";
import { saveDatabaseArticleAction } from "@/lib/cms/article-actions";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

const errorMessages: Record<string, string> = {
  title: "请填写文章标题。",
  "slug-format": "Slug 必须包含英文字母或数字。",
  "slug-duplicate": "Slug 已被其他文章使用，请更换。",
  category: "所选文章分类不存在。",
  canonical: "Canonical URL 必须是以 / 开头的站内路径，或完整的 HTTP/HTTPS 地址。",
};

export default async function ArticleEditorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!isDatabaseConfigured()) return <><AdminPageHeader eyebrow="Article editor" title="文章编辑器" description="连接 PostgreSQL 后即可使用。" /><DatabaseSetupNotice /></>;

  const [article, categories] = await Promise.all([
    id === "new" ? null : prisma.article.findUnique({ where: { id } }),
    prisma.category.findMany({ where: { type: "ARTICLE" }, orderBy: { name: "asc" } }),
  ]);
  if (id !== "new" && !article) notFound();

  return <>
    <AdminPageHeader eyebrow="Article editor" title={article ? "编辑文章" : "新建文章"} description="TipTap 支持标题、文字格式、链接、列表与图片上传。" />
    {query.saved ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">文章已保存并写入 PostgreSQL。</div> : null}
    {query.error ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessages[query.error] || "保存失败，请检查输入。"}</div> : null}
    <form action={saveDatabaseArticleAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <input type="hidden" name="id" value={article?.id || ""} />
      <div className="min-w-0 space-y-6">
        <Card><CardHeader><CardTitle>文章内容</CardTitle><CardDescription>标题和 Slug 用于前台文章页面。</CardDescription></CardHeader><CardContent className="space-y-5">
          <div className="space-y-2"><Label htmlFor="title">文章标题 *</Label><Input id="title" name="title" defaultValue={article?.title} required maxLength={240} /></div>
          <div className="space-y-2"><Label htmlFor="slug">URL Slug *</Label><Input id="slug" name="slug" defaultValue={article?.slug} placeholder="custom-packaging-guide" pattern="[a-zA-Z0-9-]+" /><p className="text-xs text-slate-400">留空时根据英文标题自动生成。</p></div>
          <div className="space-y-2"><Label htmlFor="description">文章摘要</Label><Textarea id="description" name="description" className="min-h-24" defaultValue={article?.description || ""} maxLength={1000} placeholder="用于列表页和文章页导语。" /></div>
          <div className="space-y-2"><Label>正文</Label><RichTextEditor defaultValue={article?.content || ""} /></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Google SEO 设置</CardTitle><CardDescription>这些字段由服务端输出到页面 HTML，不会增加前台 JavaScript。</CardDescription></CardHeader><CardContent className="space-y-5">
          <div className="space-y-2"><Label htmlFor="seoTitle">SEO Title</Label><Input id="seoTitle" name="seoTitle" defaultValue={article?.seoTitle || ""} maxLength={70} placeholder="Primary keyword | DATANGXING Packaging" /><p className="text-xs text-slate-400">建议约 50–60 个英文字符；留空时使用文章标题。</p></div>
          <div className="space-y-2"><Label htmlFor="seoDescription">Meta Description</Label><Textarea id="seoDescription" name="seoDescription" className="min-h-24" defaultValue={article?.seoDescription || ""} maxLength={180} placeholder="Summarize the article and its value for packaging buyers." /><p className="text-xs text-slate-400">建议约 140–160 个英文字符；留空时使用文章摘要。</p></div>
          <div className="space-y-2"><Label htmlFor="keywords">关键词</Label><Textarea id="keywords" name="keywords" className="min-h-20" defaultValue={article?.keywords.join(", ") || ""} placeholder="custom packaging, rigid gift boxes, paper packaging" /><p className="text-xs text-slate-400">使用英文逗号、中文逗号或换行分隔。</p></div>
          <div className="space-y-2"><Label htmlFor="canonicalUrl">Canonical URL</Label><Input id="canonicalUrl" name="canonicalUrl" defaultValue={article?.canonicalUrl || ""} maxLength={1000} placeholder="/blog/custom-packaging-guide" /><p className="text-xs text-slate-400">通常留空即可自动使用当前文章 URL。仅在合并重复内容或迁移旧链接时填写。</p></div>
        </CardContent></Card>
      </div>
      <aside className="space-y-6">
        <Card className="xl:sticky xl:top-28"><CardHeader><CardTitle>发布设置</CardTitle></CardHeader><CardContent className="space-y-5">
          <div className="space-y-2"><Label htmlFor="status">状态</Label><Select id="status" name="status" defaultValue={article?.status || "DRAFT"}><option value="DRAFT">草稿</option><option value="PUBLISHED">已发布</option><option value="ARCHIVED">已归档</option></Select></div>
          <div className="space-y-2"><Label htmlFor="categoryId">文章分类</Label><Select id="categoryId" name="categoryId" defaultValue={article?.categoryId || ""}><option value="">未分类</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select>{!categories.length ? <p className="text-xs text-amber-600">暂无文章分类，请先执行 pnpm db:seed。</p> : null}</div>
          <div className="space-y-2"><Label>封面图片</Label><ArticleImageField defaultUrl={article?.cover || ""} defaultMediaId={article?.coverMediaId || ""} title={article?.title || ""} /></div>
          <Button type="submit" className="w-full">保存文章</Button>
        </CardContent></Card>
      </aside>
    </form>
  </>;
}
