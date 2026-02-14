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
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function TipTapRendererClient({ content, fallback }) {
  const [highlightedContent, setHighlightedContent] = useState(null);

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit.configure({
        codeBlock: {
          languageClassPrefix: "language-",
        },
      }),
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
      if (content && content.includes("<pre>")) {
        console.log("TipTapRenderer: Found code blocks in content");
      }
      editor.commands.setContent(content || "");
    } catch (e) {
      console.warn("TipTapRenderer: failed to set content, falling back", e);
    }
  }, [content, editor]);

  // Apply syntax highlighting to code blocks after DOM renders
  useEffect(() => {
    if (!editor) return;

    const timer = setTimeout(() => {
      const codeBlocks = document.querySelectorAll(".tiptap-readonly pre code");
      codeBlocks.forEach((block) => {
        if (block.getAttribute("data-highlighted")) return;

        const code = block.textContent || "";
        const lang =
          block.className?.match(/language-(\w+)/)?.[1]?.toLowerCase() ||
          "javascript";

        try {
          // Use Prism syntax highlighter
          const div = document.createElement("div");
          div.innerHTML = SyntaxHighlighter.highlight(code, {
            language: lang,
            style: vscDarkPlus,
          });

          // Replace block content with highlighted version
          block.innerHTML = div.innerHTML;
          block.setAttribute("data-highlighted", "true");
        } catch (e) {
          console.warn(`Syntax highlight failed for ${lang}:`, e);
          block.setAttribute("data-highlighted", "true");
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [editor]);

  if (!editor) {
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
