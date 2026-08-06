import Link from "next/link";
import { ArrowUpRight, Boxes, FileText, FolderTree, Images } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/admin/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import DatabaseSetupNotice from "@/components/admin/DatabaseSetupNotice";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export default async function AdminDashboardPage() {
  if (!isDatabaseConfigured()) return <><AdminPageHeader eyebrow="Dashboard" title="内容管理概览" description="连接 PostgreSQL 后即可查看 CMS 实时统计。" /><DatabaseSetupNotice /></>;

  const [articleCount, publishedArticleCount, productCount, publishedProductCount, categoryCount, mediaCount, recentArticles, recentProducts] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.product.count(),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.category.count(),
    prisma.media.count(),
    prisma.article.findMany({ select: { id: true, title: true, status: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.product.findMany({ select: { id: true, name: true, status: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 6 }),
  ]);

  const cards = [
    { label: "文章", value: articleCount, href: "/admin/articles", icon: FileText, note: `${articleCount - publishedArticleCount} 草稿 · ${publishedArticleCount} 已发布` },
    { label: "产品", value: productCount, href: "/admin/products", icon: Boxes, note: `${productCount - publishedProductCount} 草稿 · ${publishedProductCount} 已发布` },
    { label: "分类", value: categoryCount, href: "/admin/categories", icon: FolderTree, note: "文章与产品分类" },
    { label: "媒体", value: mediaCount, href: "/admin/media", icon: Images, note: "图片资源" },
  ];
  const recent = [
    ...recentArticles.map((item) => ({ id: item.id, name: item.title, type: "文章", status: item.status, updatedAt: item.updatedAt, href: `/admin/articles/${item.id}` })),
    ...recentProducts.map((item) => ({ id: item.id, name: item.name, type: "产品", status: item.status, updatedAt: item.updatedAt, href: `/admin/products/${item.id}` })),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 6);

  return <>
    <AdminPageHeader eyebrow="Dashboard" title="内容管理概览" description="集中管理网站文章、产品、分类、媒体与企业基础信息。" />
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, href, icon: Icon, note }) => <Link href={href} key={label}><Card className="group h-full transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"><CardContent className="p-6"><div className="flex items-start justify-between"><div className="grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-700"><Icon className="size-5" /></div><ArrowUpRight className="size-4 text-slate-300 transition group-hover:text-slate-700" /></div><strong className="mt-6 block text-3xl font-semibold tracking-tight">{value}</strong><span className="mt-1 block text-sm font-medium text-slate-700">{label}</span><small className="mt-2 block text-xs text-slate-400">{note}</small></CardContent></Card></Link>)}
    </section>
    <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
      <Card><CardHeader><CardTitle>最近更新</CardTitle><CardDescription>文章和产品的最近编辑记录</CardDescription></CardHeader><CardContent><div className="divide-y divide-slate-100">{recent.map((item) => <Link key={`${item.type}-${item.id}`} href={item.href} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div className="min-w-0"><strong className="block truncate text-sm font-medium">{item.name}</strong><span className="mt-1 block text-xs text-slate-400">{item.type} · {item.updatedAt.toLocaleDateString("zh-CN")}</span></div><Badge variant={item.status === "PUBLISHED" ? "success" : item.status === "ARCHIVED" ? "neutral" : "warning"}>{item.status === "PUBLISHED" ? "已发布" : item.status === "ARCHIVED" ? "已归档" : "草稿"}</Badge></Link>)}</div></CardContent></Card>
      <Card className="bg-slate-950 text-white"><CardHeader><CardTitle>使用提示</CardTitle><CardDescription className="text-slate-400">CMS 数据已连接前台</CardDescription></CardHeader><CardContent className="space-y-4 text-sm leading-6 text-slate-300"><p>文章、产品、分类和媒体统一保存在 PostgreSQL，不会增加前台 JavaScript。</p><p>草稿只在后台可见；审核后设为“已发布”，前台博客或产品页会自动更新。</p><Link href="/concept-b" target="_blank" className="inline-flex items-center gap-2 font-medium text-white">查看当前网站 <ArrowUpRight className="size-4" /></Link></CardContent></Card>
    </section>
  </>;
}
