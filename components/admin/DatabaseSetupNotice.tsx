import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";

export default function DatabaseSetupNotice() {
  return <Card className="border-amber-200 bg-amber-50/70">
    <CardHeader><CardTitle>需要连接 PostgreSQL</CardTitle></CardHeader>
    <CardContent className="space-y-3 text-sm leading-6 text-amber-900">
      <p>文章模块已经使用 Prisma 数据库，请先配置 <code className="rounded bg-white/70 px-1.5 py-0.5">DATABASE_URL</code> 并执行 migration。</p>
      <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">pnpm db:migrate{`\n`}pnpm db:seed</pre>
      <p>配置说明见 <Link className="font-semibold underline" href="https://www.prisma.io/docs/orm/prisma-migrate/getting-started" target="_blank">Prisma Migrate 文档</Link>。</p>
    </CardContent>
  </Card>;
}
