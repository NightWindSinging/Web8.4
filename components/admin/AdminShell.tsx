import Link from "next/link";
import { ExternalLink, LogOut, ShieldCheck } from "lucide-react";
import AdminNav from "./AdminNav";
import { logoutAction } from "@/lib/cms/actions";
import { Button } from "./ui/button";

export default function AdminShell({ username, children }: { username: string; children: React.ReactNode }) {
  return (
    <div className="admin-shell min-h-svh bg-slate-50">
      <aside className="admin-sidebar fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-950 text-white">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="grid size-10 place-items-center rounded-xl bg-blue-500 text-sm font-black">DTX</div>
          <div><strong className="block text-sm tracking-wide">DATANGXING</strong><span className="text-xs text-slate-400">Enterprise CMS</span></div>
        </div>
        <div className="px-6 pb-3 pt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</div>
        <AdminNav />
        <div className="mt-auto border-t border-white/10 p-4">
          <Link href="/concept-b" target="_blank" className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"><span>查看网站</span><ExternalLink className="size-4" /></Link>
        </div>
      </aside>

      <div className="admin-main min-h-svh md:ml-64">
        <header className="admin-topbar sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-xl lg:px-10">
          <div><span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Content workspace</span><p className="mt-1 text-sm text-slate-600">管理企业网站内容与媒体</p></div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 sm:flex"><ShieldCheck className="size-4" />已安全登录</div>
            <div className="text-right"><strong className="block text-sm text-slate-900">{username}</strong><span className="text-xs text-slate-400">Administrator</span></div>
            <form action={logoutAction}><Button type="submit" size="icon" variant="outline" aria-label="退出登录"><LogOut className="size-4" /></Button></form>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
