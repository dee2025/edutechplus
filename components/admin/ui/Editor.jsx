"use client";
import {
  IconAlignCenter,
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBlockquote,
  IconBold,
  IconCode,
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconColumnRemove,
  IconH1,
  IconH2,
  IconH3,
  IconHighlight,
  IconItalic,
  IconLayoutDistributeHorizontal,
  IconLine,
  IconLinkMinus,
  IconLinkPlus,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconPhoto,
  IconPhotoPlus,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconRowRemove,
  IconStrikethrough,
  IconSubscript,
  IconSuperscript,
  IconTableMinus,
  IconTablePlus,
  IconUnderline,
} from "@tabler/icons-react";
import Blockquote from "@tiptap/extension-blockquote";
import Bold from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import Code from "@tiptap/extension-code";
import { Color } from "@tiptap/extension-color";
import Document from "@tiptap/extension-document";
import Dropcursor from "@tiptap/extension-dropcursor";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import History from "@tiptap/extension-history";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Italic from "@tiptap/extension-italic";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Strike from "@tiptap/extension-strike";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Text from "@tiptap/extension-text";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import axios from "axios";
import { useCallback, useEffect } from "react";
import "./../../../app/component.css";
import "./EditorButtons.css";

import { Image } from "@tiptap/extension-image";

const LinkedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      href: {
        default: null,
      },
      target: {
        default: "_blank",
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { href, target, ...rest } = HTMLAttributes;
    const img = ["img", rest];
    return href ? ["a", { href, target }, img] : img;
  },

  parseHTML() {
    return [
      {
        tag: "a[href] > img",
        getAttrs: (node) => {
          const parent = node.parentNode;
          return {
            ...node.attributes,
            href: parent.getAttribute("href"),
            target: parent.getAttribute("target") || "_blank",
          };
        },
      },
      {
        tag: "img",
        getAttrs: (node) => ({
          ...node.attributes,
        }),
      },
    ];
  },
});

export default ({ content, onChange }) => {
  const editor = useEditor(
    {
      extensions: [
        Document,
        Paragraph,
        Text,
        Image,
        Dropcursor,
        BulletList,
        ListItem,
        Heading.configure({
          levels: [1, 2, 3],
        }),
        OrderedList,
        Bold,
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph", "table"],
        }),
        Italic,
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        Blockquote,
        HorizontalRule,
        HardBreak,
        Code,
        Highlight.configure({ multicolor: true }),
        Strike,
        History,
        TextStyle,
        Color,
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        LinkedImage, // instead of default Image
        Link,
        Subscript,
        Superscript,
        Placeholder.configure({
          placeholder: "Write Content...",
        }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["http", "https"],
          isAllowedUri: (url, ctx) => {
            try {
              // construct URL
              const parsedUrl = url.includes(":")
                ? new URL(url)
                : new URL(`${ctx.defaultProtocol}://${url}`);

              // use default validation
              if (!ctx.defaultValidate(parsedUrl.href)) {
                return false;
              }

              // disallowed protocols
              const disallowedProtocols = ["ftp", "file", "mailto"];
              const protocol = parsedUrl.protocol.replace(":", "");

              if (disallowedProtocols.includes(protocol)) {
                return false;
              }

              // only allow protocols specified in ctx.protocols
              const allowedProtocols = ctx.protocols.map((p) =>
                typeof p === "string" ? p : p.scheme,
              );

              if (!allowedProtocols.includes(protocol)) {
                return false;
              }

              // disallowed domains
              const disallowedDomains = [
                "example-phishing.com",
                "malicious-site.net",
              ];
              const domain = parsedUrl.hostname;

              if (disallowedDomains.includes(domain)) {
                return false;
              }

              // all checks have passed
              return true;
            } catch {
              return false;
            }
          },
          shouldAutoLink: (url) => {
            try {
              // construct URL
              const parsedUrl = url.includes(":")
                ? new URL(url)
                : new URL(`https://${url}`);

              // only auto-link if the domain is not in the disallowed list
              const disallowedDomains = [
                "example-no-autolink.com",
                "another-no-autolink.com",
              ];
              const domain = parsedUrl.hostname;

              return !disallowedDomains.includes(domain);
            } catch {
              return false;
            }
          },
        }),
      ],

      content,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },

      // Prevent Tiptap from rendering during SSR to avoid hydration mismatches
      immediatelyRender: false,
    },
    [],
  );

  useEffect(() => {
    if (!editor) return;
    if (content === undefined || content === null) return;
    const current = editor.getHTML();
    if (current !== content) {
      editor.commands.setContent(content, false);
    }
  }, [editor, content]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    // update link
    try {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } catch (e) {
      alert(e.message);
    }
  }, [editor]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Upload the image using the existing admin upload API
      const response = await axios.post(`/api/admin/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // response expected: { url: 'https://...' }
      if (response.data && response.data.url) {
        return response.data.url;
      } else {
        throw new Error("Image upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const addImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.click();

    input.onchange = async (event) => {
      const file = event.target.files[0];

      if (file) {
        try {
          const imageUrl = await uploadImage(file);
          editor.chain().focus().setImage({ src: imageUrl }).run();
          onChange(editor.getHTML());
        } catch (error) {
          console.error("Error adding image:", error);
        }
      }
    };
  }, [editor, onChange]);

  const handleAddLinkToImage = () => {
    if (!editor) return;

    const { state } = editor;
    const { selection } = state;
    const pos = selection.from;

    const node = state.doc.nodeAt(pos);
    if (!node || node.type.name !== "image") {
      alert("Please select an image to add a link.");
      return;
    }

    const currentAttrs = node.attrs;
    const currentHref = currentAttrs.href || "";

    const href = prompt("Enter URL to link this image:", currentHref);

    if (href !== null) {
      if (currentHref !== href) {
        editor
          .chain()
          .focus()
          .setNodeSelection(pos)
          .updateAttributes("image", {
            ...currentAttrs,
            href,
            target: "_blank",
          })
          .run();
      } else {
        alert("This image already has the link.");
      }
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <>
      <div className="control-group">
        <div className="d-flex flex-wrap gap-4 border rounded-sm p-2 border-zinc-400">
          {/* 1st Column */}
          <div className="d-flex flex-wrap btnSection">
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().undo().run();
              }}
              disabled={!editor.can().undo()}
            >
              <IconArrowBackUp stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().redo().run();
              }}
              disabled={!editor.can().redo()}
            >
              <IconArrowForwardUp stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().toggleBold().run();
              }}
              className={editor.isActive("bold") ? "is-active" : ""}
            >
              <IconBold stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().toggleUnderline().run();
              }}
              className={editor.isActive("underline") ? "is-active" : ""}
            >
              <IconUnderline stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().toggleItalic().run();
              }}
              className={editor.isActive("italic") ? "is-active" : ""}
            >
              <IconItalic stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().toggleStrike().run();
              }}
              className={editor.isActive("strike") ? "is-active" : ""}
            >
              <IconStrikethrough stroke={2} />
            </button>
          </div>

          {/* 2nd Column */}
          <div className="d-flex flex-wrap btnSection">
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().setHardBreak().run();
              }}
            >
              <IconLine stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().toggleCode().run();
              }}
              className={editor.isActive("code") ? "is-active" : ""}
            >
              <IconCode stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().toggleHighlight().run();
              }}
              className={editor.isActive("highlight") ? "is-active" : ""}
            >
              <IconHighlight stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().setHorizontalRule().run();
              }}
            >
              <IconLayoutDistributeHorizontal stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().toggleSubscript().run();
              }}
              className={editor.isActive("subscript") ? "is-active" : ""}
            >
              <IconSubscript stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().toggleSuperscript().run();
              }}
              className={editor.isActive("superscript") ? "is-active" : ""}
            >
              <IconSuperscript stroke={2} />
            </button>
          </div>

          {/* 3rd Column */}
          <div className="d-flex flex-wrap btnSection">
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().toggleBulletList().run();
              }}
              className={editor.isActive("bulletList") ? "is-active" : ""}
            >
              <IconList stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().toggleOrderedList().run();
              }}
              className={editor.isActive("orderedList") ? "is-active" : ""}
            >
              <IconListNumbers stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().toggleTaskList().run();
              }}
              className={editor.isActive("taskList") ? "is-active" : ""}
            >
              <IconListCheck stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().toggleBlockquote().run();
              }}
              className={editor.isActive("blockquote") ? "is-active" : ""}
            >
              <IconBlockquote stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                addImage();
              }}
            >
              <IconPhotoPlus stroke={2} />
            </button>
          </div>

          {/* 4th Column */}
          <div className="d-flex flex-wrap btnSection">
            <div className="button-group">
              <button
                onClick={(event) => {
                  event.preventDefault();
                  setLink(); // Call setLink function
                  editor.chain().focus().addRowAfter().run();
                }}
                className={editor.isActive("link") ? "is-active" : ""}
              >
                <IconLinkPlus stroke={2} />
              </button>

              <button
                onClick={(event) => {
                  event.preventDefault();
                  editor.chain().focus().unsetLink().run();
                }}
                disabled={!editor.isActive("link")}
              >
                <IconLinkMinus stroke={2} />
              </button>
            </div>
          </div>

          {/* 5th Column */}
          <div className="d-flex flex-wrap btnSection">
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().setTextAlign("left").run();
              }}
              className={
                editor.isActive({ textAlign: "left" }) ? "is-active" : ""
              }
            >
              <IconAlignLeft stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().setTextAlign("center").run();
              }}
              className={
                editor.isActive({ textAlign: "center" }) ? "is-active" : ""
              }
            >
              <IconAlignCenter stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().setTextAlign("right").run();
              }}
              className={
                editor.isActive({ textAlign: "right" }) ? "is-active" : ""
              }
            >
              <IconAlignRight stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().setTextAlign("justify").run();
              }}
              className={
                editor.isActive({ textAlign: "justify" }) ? "is-active" : ""
              }
            >
              <IconAlignJustified stroke={2} />
            </button>
          </div>

          {/* 6th Column */}
          <div className="d-flex flex-wrap btnSection">
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().toggleHeading({ level: 1 }).run();
              }}
              className={
                editor.isActive("heading", { level: 1 }) ? "is-active" : ""
              }
            >
              <IconH1 stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().toggleHeading({ level: 2 }).run();
              }}
              className={
                editor.isActive("heading", { level: 2 }) ? "is-active" : ""
              }
            >
              <IconH2 stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().toggleHeading({ level: 3 }).run();
              }}
              className={
                editor.isActive("heading", { level: 3 }) ? "is-active" : ""
              }
            >
              <IconH3 stroke={2} />
            </button>
          </div>

          {/* 7th Column */}
          <div className="d-flex flex-wrap btnSection">
            <button
              onClick={(event) => {
                event.preventDefault();
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run();
              }}
            >
              <IconTablePlus stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().addRowBefore().run();
              }}
            >
              <IconRowInsertTop stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().addRowAfter().run();
              }}
            >
              <IconRowInsertBottom stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().deleteRow().run();
              }}
            >
              <IconRowRemove stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().addColumnBefore().run();
              }}
            >
              <IconColumnInsertLeft stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().addColumnAfter().run();
              }}
            >
              <IconColumnInsertRight stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().deleteColumn().run();
              }}
            >
              <IconColumnRemove stroke={2} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().deleteTable().run();
              }}
            >
              <IconTableMinus stroke={2} />
            </button>
          </div>

          {/* 8th Column */}
          <div className="d-flex flex-wrap align-items-center btnSection">
            <input
              type="color"
              onInput={(event) =>
                editor.chain().focus().setColor(event.target.value).run()
              }
              value={editor.getAttributes("textStyle").color}
              data-testid="setColor"
            />
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().setColor("#958DF1").run();
              }}
              className={
                editor.isActive("textStyle", { color: "#958DF1" })
                  ? "is-active"
                  : ""
              }
              data-testid="setPurple"
            >
              Purple
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().setColor("#F98181").run();
              }}
              className={
                editor.isActive("textStyle", { color: "#F98181" })
                  ? "is-active"
                  : ""
              }
              data-testid="setRed"
            >
              Red
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().setColor("#FBBC88").run();
              }}
              className={
                editor.isActive("textStyle", { color: "#FBBC88" })
                  ? "is-active"
                  : ""
              }
              data-testid="setOrange"
            >
              Orange
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().setColor("#FAF594").run();
              }}
              className={
                editor.isActive("textStyle", { color: "#FAF594" })
                  ? "is-active"
                  : ""
              }
              data-testid="setYellow"
            >
              Yellow
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().setColor("#70CFF8").run();
              }}
              className={
                editor.isActive("textStyle", { color: "#70CFF8" })
                  ? "is-active"
                  : ""
              }
              data-testid="setBlue"
            >
              Blue
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().setColor("#94FADB").run();
              }}
              className={
                editor.isActive("textStyle", { color: "#94FADB" })
                  ? "is-active"
                  : ""
              }
              data-testid="setTeal"
            >
              Teal
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().setColor("#B9F18D").run();
              }}
              className={
                editor.isActive("textStyle", { color: "#B9F18D" })
                  ? "is-active"
                  : ""
              }
              data-testid="setGreen"
            >
              Green
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                editor.chain().focus().unsetColor().run();
              }}
              data-testid="unsetColor"
            >
              Unset color
            </button>
          </div>

          <div>
            <button
              onClick={(event) => {
                event.preventDefault();
                handleAddLinkToImage();
              }}
            >
              <IconPhoto stroke={2} />
            </button>
          </div>
        </div>
      </div>

      <div className="editor-container">
        <EditorContent editor={editor} />
      </div>
    </>
  );
};
