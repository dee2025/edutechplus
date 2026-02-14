"use client";

import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { useState } from "react";

const MenuButton = ({ icon: Icon, onClick, isActive = false, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded transition-colors ${
      isActive
        ? "bg-cyan-500 text-white"
        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
    }`}
  >
    <Icon size={16} />
  </button>
);

export default function Editor({ value, onChange }) {
  const [linkInput, setLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your article...",
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
      }),
      Image.configure({
        allowBase64: true,
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: value || "<p>Start writing...</p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
    );
  }

  const addLink = () => {
    if (!linkInput) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkInput })
      .run();

    setLinkInput("");
    setShowLinkInput(false);
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 p-3 flex flex-wrap gap-2 flex-shrink-0">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <MenuButton
            icon={Bold}
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold (Ctrl+B)"
          />
          <MenuButton
            icon={Italic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic (Ctrl+I)"
          />
          <MenuButton
            icon={Strikethrough}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="Strikethrough"
          />
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <MenuButton
            icon={List}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          />
          <MenuButton
            icon={ListOrdered}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Numbered List"
          />
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <MenuButton
            icon={Heading2}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          />
          <MenuButton
            icon={Heading3}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          />
        </div>

        {/* Quote & Code */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <MenuButton
            icon={Quote}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Quote"
          />
          <MenuButton
            icon={Code}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            title="Code Block"
          />
        </div>

        {/* Insert Elements */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <MenuButton
            icon={ImagePlus}
            onClick={addImage}
            title="Insert Image"
          />

          {showLinkInput ? (
            <div className="flex gap-1">
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://example.com"
                className="px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded"
                onKeyDown={(e) => e.key === "Enter" && addLink()}
              />
              <button
                type="button"
                onClick={addLink}
                className="px-2 py-1 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkInput("");
                }}
                className="px-2 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          ) : (
            <MenuButton
              icon={LinkIcon}
              onClick={() => setShowLinkInput(true)}
              title="Add Link"
            />
          )}
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <MenuButton
            icon={Undo2}
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          />
          <MenuButton
            icon={Redo2}
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 p-4">
        <style jsx global>{`
          .ProseMirror {
            outline: none;
            min-height: 300px;
          }

          .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #adb5bd;
            pointer-events: none;
            height: 0;
          }

          .ProseMirror h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0.75rem 0;
          }

          .ProseMirror h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0.5rem 0;
          }

          .ProseMirror ul,
          .ProseMirror ol {
            padding-left: 1.5rem;
            margin: 0.5rem 0;
          }

          .ProseMirror code {
            background-color: #f3f4f6;
            color: #1f2937;
            border-radius: 0.25rem;
            padding: 0.1rem 0.4rem;
            font-family: monospace;
            font-size: 0.875em;
          }

          .dark .ProseMirror code {
            background-color: #374151;
            color: #f3f4f6;
          }

          .ProseMirror pre {
            background-color: #1f2937;
            color: #f3f4f6;
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 0.5rem 0;
            overflow-x: auto;
          }

          .dark .ProseMirror pre {
            background-color: #111827;
          }

          .ProseMirror pre code {
            background: none;
            color: inherit;
            padding: 0;
          }

          .ProseMirror blockquote {
            border-left: 3px solid #3b82f6;
            padding-left: 1rem;
            margin-left: 0;
            color: #6b7280;
            font-style: italic;
          }

          .dark .ProseMirror blockquote {
            color: #9ca3af;
          }

          .ProseMirror a {
            color: #0ea5e9;
            cursor: pointer;
            text-decoration: underline;
          }

          .dark .ProseMirror a {
            color: #06b6d4;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>

      {/* Character Count */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
        {(editor?.getText() || "").length} characters
      </div>
    </div>
  );
}
