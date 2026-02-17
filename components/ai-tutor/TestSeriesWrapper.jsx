"use client";

import AuthModal from "@/components/UserAuth/AuthModal";
import { BarChart3, History, LayoutGrid, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import TestHistoryPage from "./TestHistoryPage";
import TestSeriesClient from "./TestSeriesClient";
import TestSeriesProfile from "./TestSeriesProfile";

export default function TestSeriesWrapper() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("home"); // home, profile, history

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/me");
      const userData = await res.json();
      if (userData?.id) {
        setUser(userData);
      } else {
        setShowAuth(true);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setShowAuth(true);
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout");
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-linear-to-br from-[#0B0B0B] to-[#1a1a2e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4" />
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-linear-to-br from-[#0B0B0B] to-[#1a1a2e] flex items-center justify-center p-4">
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            fetchUser();
            setShowAuth(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0B0B0B] to-[#1a1a2e]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0B0B0B]/80 backdrop-blur border-b border-gray-700/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-white font-semibold text-sm">{user.name}</h2>
              <p className="text-gray-400 text-xs">{user.email}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "home"
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "profile"
                  ? "bg-purple-600/30 text-purple-300 border border-purple-500/30"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "history"
                  ? "bg-green-600/30 text-green-300 border border-green-500/30"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 transition text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "home" && (
          <TestSeriesClient
            userId={user.id}
            onTestComplete={() => {
              // Could refresh some data here if needed
            }}
          />
        )}

        {activeTab === "profile" && <TestSeriesProfile userId={user.id} />}

        {activeTab === "history" && <TestHistoryPage userId={user.id} />}
      </div>
    </div>
  );
}
