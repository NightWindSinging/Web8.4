"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";

export default function DeleteCategoryButton({ action, disabled = false }: { action: () => Promise<void>; disabled?: boolean }) {
  return <form action={action} onSubmit={(event) => { if (!window.confirm("确定删除这个分类吗？")) event.preventDefault(); }}>
    <Button type="submit" variant="ghost" size="sm" disabled={disabled} title={disabled ? "该分类仍有关联内容，不能删除" : "删除分类"} className="text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="size-4" />删除</Button>
  </form>;
}
