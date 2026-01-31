"use client";

import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export default function TipTapRendererClient({ content, fallback }) {
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit,
      Link,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Highlight,
    ],
    content: content || "",
  });

  // When the content prop changes, update the editor
  useEffect(() => {
    if (!editor) return;
    try {
      editor.commands.setContent(content || "");
    } catch (e) {
      // if setContent fails (unexpected format), fallback to plaintext
      console.warn("TipTapRenderer: failed to set content, falling back", e);
    }
  }, [content, editor]);

  if (!editor) {
    // Render fallback (plain text/markdown) while editor initializes
    return (
      <div className="prose prose-base md:prose-lg max-w-none prose-invert">
        <pre className="whitespace-pre-wrap text-gray-300">
          {fallback || ""}
        </pre>
      </div>
    );
  }

  return (
    <div className="tiptap-readonly">
      <EditorContent editor={editor} />
    </div>
  );
}
