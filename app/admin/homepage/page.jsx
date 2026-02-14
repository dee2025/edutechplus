"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_LAYOUT = {
  sections: {
    hero_main: { items: [] },
    hero_side: { items: [] },
    featured: { items: [] },
    latest: { auto: true, count: 6 },
  },
};

const SECTION_DEFS = [
  {
    id: "hero_main",
    title: "Hero - Main",
    description: "1 large editor pick",
    max: 1,
  },
  {
    id: "hero_side",
    title: "Hero - Small",
    description: "4 supporting stories",
    max: 4,
  },
  {
    id: "featured",
    title: "Featured",
    description: "1 featured article",
    max: 1,
  },
  {
    id: "latest",
    title: "Latest Articles",
    description: "Auto latest articles",
    auto: true,
    max: 6,
  },
];

export default function Homepage() {
  const [articles, setArticles] = useState([]);
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [limitMessage, setLimitMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [layoutRes, articlesRes] = await Promise.allSettled([
          fetch("/api/admin/homepage-layout", { credentials: "same-origin" }),
          fetch("/api/admin/articles", { credentials: "same-origin" }),
        ]);

        let nextLayout = DEFAULT_LAYOUT;
        if (layoutRes.status === "fulfilled" && layoutRes.value.ok) {
          try {
            const layoutJson = await layoutRes.value.json();
            if (layoutJson?.sections) nextLayout = layoutJson;
          } catch (e) {
            // ignore layout parse errors
          }
        }

        let nextArticles = [];
        if (articlesRes.status === "fulfilled" && articlesRes.value.ok) {
          try {
            const articlesJson = await articlesRes.value.json();
            nextArticles = Array.isArray(articlesJson) ? articlesJson : [];
          } catch (e) {
            // ignore articles parse errors
          }
        }

        setLayout(nextLayout);
        setArticles(nextArticles);
      } catch (error) {
        console.error("Failed to load homepage layout:", error);
        setLayout(DEFAULT_LAYOUT);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const openModal = (sectionId) => {
    const current = layout.sections?.[sectionId]?.items || [];
    setActiveSection(sectionId);
    setSelectedIds([...current]);
    setSearchQuery("");
    setLimitMessage("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveSection(null);
    setSelectedIds([]);
    setSearchQuery("");
    setLimitMessage("");
  };

  const activeSectionDef = useMemo(
    () => SECTION_DEFS.find((s) => s.id === activeSection),
    [activeSection],
  );

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;
    return articles.filter((a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [articles, searchQuery]);

  const updateLayout = async (nextLayout) => {
    setSaving(true);
    try {
      await fetch("/api/admin/homepage-layout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: nextLayout }),
      });
      setLayout(nextLayout);
    } catch (error) {
      console.error("Failed to save layout:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSelect = (articleId) => {
    if (!activeSectionDef) return;
    const max = activeSectionDef.max || 0;
    const isSelected = selectedIds.includes(articleId);

    if (isSelected) {
      setSelectedIds(selectedIds.filter((id) => id !== articleId));
      setLimitMessage("");
      return;
    }

    if (max > 0 && selectedIds.length >= max) {
      setLimitMessage(`This section allows ${max} article(s).`);
      return;
    }

    const next =
      activeSectionDef.max === 1 ? [articleId] : [...selectedIds, articleId];
    setSelectedIds(next);
    setLimitMessage("");
  };

  const moveSelected = (index, direction) => {
    const next = [...selectedIds];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSelectedIds(next);
  };

  const saveSelection = async () => {
    if (!activeSection) return;
    const nextLayout = {
      ...layout,
      sections: {
        ...layout.sections,
        [activeSection]: {
          ...(layout.sections?.[activeSection] || {}),
          items: selectedIds,
        },
      },
    };
    await updateLayout(nextLayout);
    closeModal();
  };

  const updateLatestCount = (value) => {
    const count = value ? Number(value) : 6;
    const nextLayout = {
      ...layout,
      sections: {
        ...layout.sections,
        latest: {
          ...(layout.sections?.latest || {}),
          auto: true,
          count,
        },
      },
    };
    updateLayout(nextLayout);
  };

  const getArticleById = (id) => articles.find((a) => a.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Homepage Layout</h1>
          <p className="text-sm text-gray-400 mt-1">
            Pick articles for each homepage section.
          </p>
        </div>
        {saving && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving layout...
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {SECTION_DEFS.map((section) => {
          const selected = layout.sections?.[section.id]?.items || [];
          return (
            <div
              key={section.id}
              className="bg-[#0b0f19] border border-gray-800 rounded-lg p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="text-gray-100 font-medium">
                    {section.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    {section.description}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {section.auto ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Count</span>
                      <input
                        type="number"
                        min="1"
                        value={layout.sections?.latest?.count || 6}
                        onChange={(e) => updateLatestCount(e.target.value)}
                        className="w-20 px-2 py-1 bg-[#0b0f19] border border-gray-700 rounded text-xs text-gray-100"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => openModal(section.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded bg-cyan-500 text-black hover:bg-cyan-400"
                    >
                      Select Articles
                    </button>
                  )}
                </div>
              </div>

              {!section.auto && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.length === 0 ? (
                    <span className="text-xs text-gray-500">
                      No articles selected
                    </span>
                  ) : (
                    selected.map((id, idx) => {
                      const article = getArticleById(id);
                      return (
                        <div
                          key={`${id}-${idx}`}
                          className="px-2 py-1 text-xs bg-gray-800 text-gray-200 rounded"
                        >
                          {article?.title || `Article ${id}`}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalOpen && activeSectionDef && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 p-3 sm:p-4">
          <div className="w-full max-w-4xl bg-[#0b0f19] border border-gray-800 rounded-xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div>
                <div className="text-gray-100 font-medium">
                  Select for {activeSectionDef.title}
                </div>
                <div className="text-xs text-gray-400">
                  {activeSectionDef.description}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 grid gap-4 md:grid-cols-[1.5fr_1fr] flex-1 overflow-y-auto">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-[#0b0f19] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {limitMessage && (
                  <div className="text-xs text-amber-400">{limitMessage}</div>
                )}

                <div className="max-h-64 md:max-h-105 overflow-y-auto border border-gray-800 rounded-lg">
                  {filteredArticles.length === 0 ? (
                    <div className="p-4 text-xs text-gray-500">
                      No articles found
                    </div>
                  ) : (
                    filteredArticles.map((article) => {
                      const isSelected = selectedIds.includes(article.id);
                      return (
                        <button
                          key={article.id}
                          onClick={() => toggleSelect(article.id)}
                          className={`w-full text-left p-3 border-b border-gray-800 hover:bg-gray-900 transition-colors ${
                            isSelected ? "bg-gray-900" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm text-gray-100 truncate">
                                {article.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {article.categories?.[0]?.name ||
                                  "Uncategorized"}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                  article.status === "published"
                                    ? "bg-green-900/40 text-green-400"
                                    : article.status === "draft"
                                      ? "bg-yellow-900/40 text-yellow-400"
                                      : "bg-gray-900/40 text-gray-400"
                                }`}
                              >
                                {article.status}
                              </span>
                              {isSelected && (
                                <Check className="w-4 h-4 text-cyan-400" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-gray-400">
                  Selected ({selectedIds.length}/{activeSectionDef.max})
                </div>

                <div className="space-y-2">
                  {selectedIds.length === 0 ? (
                    <div className="text-xs text-gray-500">
                      No articles selected
                    </div>
                  ) : (
                    selectedIds.map((id, index) => {
                      const article = getArticleById(id);
                      return (
                        <div
                          key={`${id}-${index}`}
                          className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg p-2"
                        >
                          <div className="text-xs text-gray-500">
                            {index + 1}.
                          </div>
                          <div className="text-xs text-gray-200 flex-1 truncate">
                            {article?.title || `Article ${id}`}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveSelected(index, -1)}
                              className="p-1 text-gray-400 hover:text-gray-200"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveSelected(index, 1)}
                              className="p-1 text-gray-400 hover:text-gray-200"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toggleSelect(id)}
                              className="p-1 text-gray-400 hover:text-gray-200"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-t border-gray-800">
              <div className="text-xs text-gray-500">
                Click an article to add or remove. Drag order with arrows.
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  onClick={closeModal}
                  className="w-full sm:w-auto px-3 py-1.5 text-xs text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSelection}
                  className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium rounded bg-cyan-500 text-black hover:bg-cyan-400"
                >
                  Save Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
