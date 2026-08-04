import { LockKeyhole, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { loginAction } from "@/lib/cms/actions";
import { getAdminSession, isAuthConfigured } from "@/lib/cms/session";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminSession()) redirect("/admin");
  const { error } = await searchParams;
  const configured = isAuthConfigured();
  return (
    <main className="grid min-h-svh place-items-center bg-[radial-gradient(circle_at_top_left,#e0e7ff,transparent_36%),linear-gradient(135deg,#f8fafc,#eef2ff)] px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-7 flex items-center justify-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">DTX</div><div><strong className="block text-sm tracking-wider">DATANGXING</strong><span className="text-xs text-slate-500">Enterprise CMS</span></div></div>
        <Card className="border-white/70 bg-white/90 shadow-2xl shadow-slate-300/40 backdrop-blur-xl">
          <CardHeader className="pb-4 text-center"><div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-slate-100"><LockKeyhole className="size-5 text-slate-700" /></div><CardTitle className="text-xl">管理员登录</CardTitle><CardDescription>请输入后台用户名和密码</CardDescription></CardHeader>
          <CardContent>
            {!configured || error === "config" ? <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">后台账号尚未配置。请在项目目录运行 <code className="rounded bg-amber-100 px-1.5 py-0.5">pnpm admin:setup</code>，然后重启开发服务器。</div> : null}
            {error === "credentials" ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">用户名或密码不正确，请重新输入。</div> : null}
            <form action={loginAction} className="space-y-5">
              <div className="space-y-2"><Label htmlFor="username">用户名</Label><Input id="username" name="username" autoComplete="username" placeholder="admin" required /></div>
              <div className="space-y-2"><Label htmlFor="password">密码</Label><Input id="password" name="password" type="password" autoComplete="current-password" placeholder="请输入密码" required /></div>
              <Button type="submit" className="w-full" size="lg" disabled={!configured}>登录后台</Button>
            </form>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck className="size-4" />密码使用 bcrypt 哈希 · Session 使用 HttpOnly Cookie</div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
