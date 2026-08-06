"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";

export default function DeleteArticleButton({ action }: { action: () => Promise<void> }) {
  return <form action={action} onSubmit={(event) => { if (!window.confirm("确定删除这篇文章吗？此操作无法撤销。")) event.preventDefault(); }}>
    <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="size-4" />删除</Button>
  </form>;
}
