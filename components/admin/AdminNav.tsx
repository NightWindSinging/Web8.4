"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, FileText, FolderTree, Gauge, Images, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/articles", label: "文章管理", icon: FileText },
  { href: "/admin/products", label: "产品管理", icon: Boxes },
  { href: "/admin/categories", label: "分类管理", icon: FolderTree },
  { href: "/admin/media", label: "媒体管理", icon: Images },
  { href: "/admin/settings", label: "系统设置", icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-sidebar-nav flex flex-col gap-1 px-3" aria-label="CMS navigation">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white")}><Icon className="size-4" /><span>{label}</span></Link>;
      })}
    </nav>
  );
}
