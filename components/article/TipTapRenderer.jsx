import dynamic from "next/dynamic";

const TipTapRendererClient = dynamic(() => import("./TipTapRendererClient"), {
  ssr: false,
  loading: () => (
    <div className="text-sm text-gray-400">Rendering article content…</div>
  ),
});

export default function TipTapRenderer({ content, fallback }) {
  // content: HTML or TipTap JSON/HTML string from the editor
  // fallback: plain-text/markdown to use if client renderer fails
  return <TipTapRendererClient content={content} fallback={fallback} />;
}
