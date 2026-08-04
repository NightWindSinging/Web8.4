import Link from "next/link";
import { ArrowUpRight, Boxes, FileText, FolderTree, Images } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/admin/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { readDatabase } from "@/lib/cms/storage";

export default async function AdminDashboardPage() {
  const database = await readDatabase();
  const cards = [
    { label: "文章", value: database.articles.length, href: "/admin/articles", icon: FileText, note: `${database.articles.filter((item) => item.status === "published").length} 已发布` },
    { label: "产品", value: database.products.length, href: "/admin/products", icon: Boxes, note: `${database.products.filter((item) => item.status === "published").length} 已发布` },
    { label: "分类", value: database.categories.length, href: "/admin/categories", icon: FolderTree, note: "文章与产品分类" },
    { label: "媒体", value: database.media.length, href: "/admin/media", icon: Images, note: "图片资源" },
  ];
  const recent = [...database.articles.map((item) => ({ id: item.id, name: item.title, type: "文章", status: item.status, updatedAt: item.updatedAt, href: `/admin/articles/${item.id}` })), ...database.products.map((item) => ({ id: item.id, name: item.name, type: "产品", status: item.status, updatedAt: item.updatedAt, href: `/admin/products/${item.id}` }))].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);

  return <>
    <AdminPageHeader eyebrow="Dashboard" title="内容管理概览" description="集中管理网站文章、产品、分类、媒体与企业基础信息。" />
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, href, icon: Icon, note }) => <Link href={href} key={label}><Card className="group h-full transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"><CardContent className="p-6"><div className="flex items-start justify-between"><div className="grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-700"><Icon className="size-5" /></div><ArrowUpRight className="size-4 text-slate-300 transition group-hover:text-slate-700" /></div><strong className="mt-6 block text-3xl font-semibold tracking-tight">{value}</strong><span className="mt-1 block text-sm font-medium text-slate-700">{label}</span><small className="mt-2 block text-xs text-slate-400">{note}</small></CardContent></Card></Link>)}
    </section>
    <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
      <Card><CardHeader><CardTitle>最近更新</CardTitle><CardDescription>文章和产品的最近编辑记录</CardDescription></CardHeader><CardContent><div className="divide-y divide-slate-100">{recent.map((item) => <Link key={`${item.type}-${item.id}`} href={item.href} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div className="min-w-0"><strong className="block truncate text-sm font-medium">{item.name}</strong><span className="mt-1 block text-xs text-slate-400">{item.type} · {new Date(item.updatedAt).toLocaleDateString("zh-CN")}</span></div><Badge variant={item.status === "published" ? "success" : "warning"}>{item.status === "published" ? "已发布" : "草稿"}</Badge></Link>)}</div></CardContent></Card>
      <Card className="bg-slate-950 text-white"><CardHeader><CardTitle>使用提示</CardTitle><CardDescription className="text-slate-400">当前 CMS 与前台保持隔离</CardDescription></CardHeader><CardContent className="space-y-4 text-sm leading-6 text-slate-300"><p>后台内容会保存在服务器端内容库中，不会增加前台 JavaScript。</p><p>完成内容审核后，可在下一阶段把公开产品页和博客页切换到 CMS 数据源。</p><Link href="/concept-b" target="_blank" className="inline-flex items-center gap-2 font-medium text-white">查看当前网站 <ArrowUpRight className="size-4" /></Link></CardContent></Card>
    </section>
  </>;
}
