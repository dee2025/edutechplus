"use client";

import TipTapRendererClient from "./TipTapRendererClient";

export default function TipTapRenderer({ content, fallback }) {
  // content: HTML or TipTap JSON/HTML string from the editor
  // fallback: plain-text/markdown to use if client renderer fails
  return <TipTapRendererClient content={content} fallback={fallback} />;
}
