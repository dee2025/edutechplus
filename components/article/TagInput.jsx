"use client";

import { TrendingUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function TagInput({ value = [], onChange, max = 5 }) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Fetch all available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags/all");
        const data = await res.json();
        setAllTags(data.tags || []);
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };

    fetchTags();
  }, []);

  // Fetch trending tags
  useEffect(() => {
    const fetchTrendingTags = async () => {
      try {
        const res = await fetch("/api/tags/trending");
        const data = await res.json();
        setTrendingTags((data.tags || []).slice(0, 10));
      } catch (err) {
        console.error("Error fetching trending tags:", err);
      }
    };

    fetchTrendingTags();
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const query = inputValue.toLowerCase();
      const filtered = allTags
        .filter(
          (tag) =>
            (tag.name.toLowerCase().includes(query) ||
              tag.slug.toLowerCase().includes(query)) &&
            !value.some((v) => v.toLowerCase() === tag.name.toLowerCase()),
        )
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, allTags, value]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tagName) => {
    const trimmed = tagName.trim();

    if (!trimmed) return;

    if (value.length >= max) {
      return;
    }

    // Check if tag already exists (case-insensitive)
    if (value.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }

    // Validate tag format (alphanumeric, spaces, hyphens only)
    if (!/^[a-zA-Z0-9\s-]+$/.test(trimmed)) {
      return;
    }

    onChange([...value, trimmed]);
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeTag = (indexToRemove) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    } else if (e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setIsInputFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setIsInputFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => {
      setIsInputFocused(false);
      if (!inputValue) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  const canAddMore = value.length < max;

  const displayTags = inputValue.trim()
    ? suggestions
    : trendingTags.filter(
        (tag) => !value.some((v) => v.toLowerCase() === tag.name.toLowerCase()),
      );

  return (
    <div className="space-y-2">
      {/* Tags Container */}
      <div className="min-h-[42px] px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-500 transition-all">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Display selected tags */}
          {value.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 rounded-md text-sm font-medium group hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-200 transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          ))}

          {/* Input field */}
          {canAddMore && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={
                value.length === 0
                  ? "Add tags (e.g., javascript, react)..."
                  : ""
              }
              className="flex-1 min-w-[200px] bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          )}
        </div>
      </div>

      {/* Info and Suggestions */}
      <div className="space-y-2">
        {/* Tag count and help text */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {canAddMore ? (
              <>
                Press{" "}
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
                  Enter
                </kbd>{" "}
                or{" "}
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
                  ,
                </kbd>{" "}
                to add tag
              </>
            ) : (
              "Maximum tags reached"
            )}
          </span>
          <span className={value.length >= max ? "text-amber-500" : ""}>
            {value.length}/{max} tags
          </span>
        </div>

        {/* Suggestions or Trending Tags dropdown */}
        {showSuggestions && displayTags.length > 0 && canAddMore && (
          <div
            ref={suggestionsRef}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
          >
            {/* Header for trending tags */}
            {!inputValue.trim() && trendingTags.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <TrendingUp size={14} className="text-cyan-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Trending Tags
                </span>
              </div>
            )}

            <div className="py-1 max-h-[280px] overflow-y-auto">
              {displayTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => addTag(tag.name)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${tag.color || "#06B6D4"}20`,
                        color: tag.color || "#06B6D4",
                      }}
                    >
                      {tag.name}
                    </span>
                    {tag.description && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {tag.description}
                      </span>
                    )}
                    {!inputValue.trim() && tag.article_count && (
                      <span className="text-xs text-gray-400">
                        {tag.article_count} articles
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to add
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create new tag hint */}
        {showSuggestions &&
          inputValue &&
          suggestions.length === 0 &&
          inputValue.length >= 2 && (
            <div
              ref={suggestionsRef}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3"
            >
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Press{" "}
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
                  Enter
                </kbd>{" "}
                to create{" "}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  "{inputValue}"
                </span>
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
