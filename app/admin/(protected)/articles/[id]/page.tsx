import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select } from "@/components/admin/ui/select";
import { Textarea } from "@/components/admin/ui/textarea";
import { saveArticleAction } from "@/lib/cms/actions";
import { readDatabase } from "@/lib/cms/storage";

export default async function ArticleEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const database = await readDatabase();
  const article = id === "new" ? null : database.articles.find((item) => item.id === id);
  if (id !== "new" && !article) notFound();
  return <>
    <AdminPageHeader eyebrow="Article editor" title={article ? "编辑文章" : "新建文章"} description="正文当前使用纯文本/Markdown 输入，便于后续迁移到富文本编辑器。" />
    <form action={saveArticleAction} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <input type="hidden" name="id" value={article?.id || ""} />
      <div className="space-y-6"><Card><CardHeader><CardTitle>文章内容</CardTitle></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="title">文章标题 *</Label><Input id="title" name="title" defaultValue={article?.title} required /></div><div className="space-y-2"><Label htmlFor="slug">URL Slug</Label><Input id="slug" name="slug" defaultValue={article?.slug} placeholder="custom-packaging-guide" /></div><div className="space-y-2"><Label htmlFor="excerpt">摘要</Label><Textarea id="excerpt" name="excerpt" className="min-h-24" defaultValue={article?.excerpt} /></div><div className="space-y-2"><Label htmlFor="content">正文</Label><Textarea id="content" name="content" className="min-h-[420px] font-mono leading-7" defaultValue={article?.content} /></div></CardContent></Card><Card><CardHeader><CardTitle>SEO 设置</CardTitle></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="seoTitle">SEO Title</Label><Input id="seoTitle" name="seoTitle" defaultValue={article?.seoTitle} maxLength={240} /></div><div className="space-y-2"><Label htmlFor="seoDescription">Meta Description</Label><Textarea id="seoDescription" name="seoDescription" className="min-h-24" defaultValue={article?.seoDescription} maxLength={320} /></div></CardContent></Card></div>
      <aside><Card className="sticky top-28"><CardHeader><CardTitle>发布设置</CardTitle></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="status">状态</Label><Select id="status" name="status" defaultValue={article?.status || "draft"}><option value="draft">草稿</option><option value="published">已发布</option></Select></div><div className="space-y-2"><Label htmlFor="categoryId">文章分类</Label><Select id="categoryId" name="categoryId" defaultValue={article?.categoryId || ""}><option value="">未分类</option>{database.categories.filter((item) => item.type === "article").map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></div><Button type="submit" className="w-full">保存文章</Button></CardContent></Card></aside>
    </form>
  </>;
}
