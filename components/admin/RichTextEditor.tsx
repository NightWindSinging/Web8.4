"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, Redo2, Strikethrough, Undo2, Unlink } from "lucide-react";
import { useRef, useState } from "react";
import { MEDIA_UPLOAD_ACCEPT, uploadMediaFile } from "@/lib/media/upload-client";

function ToolbarButton({ active = false, label, onClick, disabled = false, children }: { active?: boolean; label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button type="button" title={label} aria-label={label} aria-pressed={active} disabled={disabled} onClick={onClick} className={`article-editor-tool ${active ? "is-active" : ""}`}>{children}</button>;
}

export default function RichTextEditor({ defaultValue = "", name = "content", placeholder = "开始撰写文章正文……" }: { defaultValue?: string; name?: string; placeholder?: string }) {
  const [html, setHtml] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
      Image.configure({ allowBase64: false, HTMLAttributes: { loading: "lazy" } }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue,
    editorProps: { attributes: { class: "tiptap article-editor-content" } },
    onUpdate: ({ editor: currentEditor }) => setHtml(currentEditor.getHTML()),
  });

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("请输入链接地址", previousUrl || "https://");
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim(), target: "_blank" }).run();
  }

  async function onImage(file?: File) {
    if (!file || !editor) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadMediaFile(file, file.name);
      editor.chain().focus().setImage({ src: uploaded.url, alt: file.name }).run();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "图片上传失败");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return <div className="article-editor-shell">
    <input type="hidden" name={name} value={html} />
    <input ref={fileRef} type="file" className="hidden" accept={MEDIA_UPLOAD_ACCEPT} onChange={(event) => void onImage(event.target.files?.[0])} />
    <div className="article-editor-toolbar" role="toolbar" aria-label="正文格式工具">
      <ToolbarButton label="粗体" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold /></ToolbarButton>
      <ToolbarButton label="斜体" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic /></ToolbarButton>
      <ToolbarButton label="删除线" active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()}><Strikethrough /></ToolbarButton>
      <span className="article-editor-separator" />
      <ToolbarButton label="二级标题" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 /></ToolbarButton>
      <ToolbarButton label="三级标题" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 /></ToolbarButton>
      <ToolbarButton label="无序列表" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List /></ToolbarButton>
      <ToolbarButton label="有序列表" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered /></ToolbarButton>
      <span className="article-editor-separator" />
      <ToolbarButton label="添加链接" active={editor?.isActive("link")} onClick={setLink}><Link2 /></ToolbarButton>
      <ToolbarButton label="移除链接" disabled={!editor?.isActive("link")} onClick={() => editor?.chain().focus().unsetLink().run()}><Unlink /></ToolbarButton>
      <ToolbarButton label="上传正文图片" disabled={uploading} onClick={() => fileRef.current?.click()}>{uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}</ToolbarButton>
      <span className="article-editor-separator" />
      <ToolbarButton label="撤销" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}><Undo2 /></ToolbarButton>
      <ToolbarButton label="重做" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}><Redo2 /></ToolbarButton>
    </div>
    <EditorContent editor={editor} />
    {error ? <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">{error}</p> : null}
  </div>;
}
