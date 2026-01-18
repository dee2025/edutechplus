"use client";

import ArticleForm from "@/components/admin/ArticleForm";
import { useRouter } from "next/navigation";

export default function CreateArticlePage() {
  const router = useRouter();

  const handleCreate = async (data) => {
    await fetch("/api/admin/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    router.push("/admin/articles");
  };

  return (
    <div className="bg-[#111827] p-6 rounded-xl">
      <h1 className="text-xl font-bold mb-4">Create Article</h1>
      <ArticleForm onSubmit={handleCreate} />
    </div>
  );
}
