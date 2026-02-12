"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreVertical,
  Clock,
  BookOpen,
  Archive,
} from "lucide-react";

export default function ChatHistorySidebar({
  userId,
  currentChatId,
  isOpen,
  onToggle,
  onNewChat,
  onSelectChat,
}) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const router = useRouter();

  const loadChats = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);
    try {
      const offset = reset ? 0 : page * 20;
      const res = await fetch(
        `/api/ai/history?userId=${userId}&limit=20&offset=${offset}`
      );
      const data = await res.json();

      if (reset) {
        setChats(data.chats);
        setPage(1);
      } else {
        setChats((prev) => [...prev, ...data.chats]);
        setPage((p) => p + 1);
      }

      setHasMore(data.chats.length === 20);
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      loadChats(true);
    }
  }, [isOpen, userId]);

  const deleteChat = async (chatId) => {
    try {
      const res = await fetch("/api/ai/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, userId }),
      });

      if (res.ok) {
        setChats((prev) => prev.filter((chat) => chat.id !== chatId));
        if (currentChatId === chatId) {
          onNewChat();
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
    setShowDeleteConfirm(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Today";
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-20 z-20 p-2 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </button>
    );
  }

  return (
    <div className="w-80 bg-[#0F0F0F] border-r border-gray-800/60 flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-800/60">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-200">Chat History</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewChat}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="New Chat"
            >
              <Plus className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search - Optional */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {chats.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <MessageSquare className="w-8 h-8 text-gray-700 mb-2" />
            <p className="text-sm text-gray-600">No chat history yet</p>
            <button
              onClick={onNewChat}
              className="mt-3 text-sm text-blue-400 hover:text-blue-300"
            >
              Start a new chat
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group relative rounded-lg transition-colors ${
                  chat.id === currentChatId
                    ? "bg-blue-500/10 border border-blue-500/20"
                    : "hover:bg-gray-900/50"
                }`}
              >
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className="w-full text-left p-3 pr-12"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-300 truncate">
                        {chat.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-600">
                          {formatDate(chat.last_message_at)}
                        </span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-600">
                          {chat.message_count} messages
                        </span>
                      </div>
                      {chat.lesson_title && (
                        <div className="flex items-center gap-1 mt-1">
                          <BookOpen className="w-3 h-3 text-gray-600" />
                          <span className="text-xs text-gray-600 truncate">
                            {chat.lesson_title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                {/* Delete button */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {showDeleteConfirm === chat.id ? (
                    <div className="flex items-center gap-1 bg-gray-900 rounded-lg border border-gray-800 p-1">
                      <button
                        onClick={() => deleteChat(chat.id)}
                        className="p-1 hover:bg-red-500/20 rounded text-red-400"
                        title="Confirm delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="p-1 hover:bg-gray-800 rounded text-gray-400"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(chat.id)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Delete chat"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Load more */}
            {hasMore && (
              <button
                onClick={() => loadChats()}
                disabled={loading}
                className="w-full mt-4 p-2 text-sm text-gray-500 hover:text-gray-400 hover:bg-gray-900/50 rounded-lg transition-colors"
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-800/60">
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <Archive className="w-4 h-4" />
          <span>Archived chats</span>
        </div>
      </div>
    </div>
  );
}