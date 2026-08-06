"use client";

import { Check, Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/admin/ui/button";

export default function MediaCardActions({ url, deleteAction, deleteDisabled }: { url: string; deleteAction: () => Promise<void>; deleteDisabled: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return <div className="mt-3 grid grid-cols-2 gap-2">
    <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "已复制" : "复制 URL"}</Button>
    <form action={deleteAction} onSubmit={(event) => { if (!window.confirm("确定永久删除这张图片吗？")) event.preventDefault(); }}><Button type="submit" variant="outline" size="sm" disabled={deleteDisabled} title={deleteDisabled ? "图片正在被文章或产品使用" : "删除图片"} className="w-full text-red-600"><Trash2 className="size-4" />删除</Button></form>
  </div>;
}
