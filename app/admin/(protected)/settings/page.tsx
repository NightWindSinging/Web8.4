import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Textarea } from "@/components/admin/ui/textarea";
import { saveSettingsAction } from "@/lib/cms/actions";
import { readDatabase } from "@/lib/cms/storage";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [database, query] = await Promise.all([readDatabase(), searchParams]);
  const settings = database.settings;
  return <>
    <AdminPageHeader eyebrow="System" title="系统设置" description="管理网站名称、默认介绍和企业联系信息。" />
    {query.saved ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">系统设置已保存。</div> : null}
    <form action={saveSettingsAction} className="max-w-4xl space-y-6">
      <Card><CardHeader><CardTitle>网站信息</CardTitle><CardDescription>后续接入前台后，可用于全局 Metadata 和页脚。</CardDescription></CardHeader><CardContent className="grid gap-5 md:grid-cols-2"><div className="space-y-2"><Label htmlFor="siteTitle">网站名称</Label><Input id="siteTitle" name="siteTitle" defaultValue={settings.siteTitle} /></div><div className="space-y-2 md:col-span-2"><Label htmlFor="siteDescription">网站默认描述</Label><Textarea id="siteDescription" name="siteDescription" className="min-h-24" defaultValue={settings.siteDescription} /></div></CardContent></Card>
      <Card><CardHeader><CardTitle>企业信息</CardTitle><CardDescription>用于联系页面、页脚和企业结构化数据。</CardDescription></CardHeader><CardContent className="grid gap-5 md:grid-cols-2"><div className="space-y-2 md:col-span-2"><Label htmlFor="companyName">公司名称</Label><Input id="companyName" name="companyName" defaultValue={settings.companyName} /></div><div className="space-y-2"><Label htmlFor="contactEmail">联系邮箱</Label><Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contactEmail} /></div><div className="space-y-2"><Label htmlFor="contactPhone">联系电话</Label><Input id="contactPhone" name="contactPhone" defaultValue={settings.contactPhone} /></div><div className="space-y-2 md:col-span-2"><Label htmlFor="address">公司地址</Label><Textarea id="address" name="address" defaultValue={settings.address} /></div></CardContent></Card>
      <Button type="submit" size="lg">保存系统设置</Button>
    </form>
  </>;
}
