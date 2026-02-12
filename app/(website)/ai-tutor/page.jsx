"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import FormattedMessage from "@/components/FormattedMessage";
import ChatHistorySidebar from "@/components/ChatHistorySidebar";
import {
  Send,
  Sparkles,
  GraduationCap,
  MessageSquare,
  Globe,
  Loader2,
  BookOpen,
  ChevronDown,
  Menu,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Copy,
  Check,
  X,
} from "lucide-react";

export default function AITutor({ userId = 1 }) {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("tutor");
  const [language, setLanguage] = useState("en");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [feedbackStates, setFeedbackStates] = useState({});
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const lessonId = searchParams.get('lessonId') || 1;

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const res = await fetch(`/api/user/preferences?userId=${userId}`);
        const data = await res.json();
        setLanguage(data.default_language || 'en');
        setMode(data.default_mode || 'tutor');
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };
    loadPreferences();
  }, [userId]);

  // Load chat if chatId exists
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId) {
      loadChat(chatId);
    }
  }, [searchParams]);

  const loadChat = async (chatId) => {
    try {
      const res = await fetch(`/api/ai/history?userId=${userId}&chatId=${chatId}`);
      const data = await res.json();
      setMessages(data.messages);
      setCurrentChatId(chatId);
      setMode(data.chat.mode);
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      text: input,
      timestamp: new Date().toISOString(),
      id: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          lessonId,
          message: userMessage.text,
          mode,
          language,
          chatId: currentChatId,
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let aiResponse = "";
      let assistantMessageId = null;
      let newChatId = currentChatId;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          
          const payload = line.replace("data:", "").trim();
          
          if (payload === "[DONE]") {
            setLoading(false);
            continue;
          }

          try {
            const parsed = JSON.parse(payload);
            
            if (parsed.chatId && !newChatId) {
              newChatId = parsed.chatId;
              setCurrentChatId(newChatId);
            }

            if (parsed.messageId && !assistantMessageId) {
              assistantMessageId = parsed.messageId;
            }

            if (parsed.token) {
              aiResponse += parsed.token;
              
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.role === "assistant" && lastMessage.id === assistantMessageId) {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...lastMessage,
                    text: aiResponse,
                  };
                  return updated;
                } else {
                  return [
                    ...prev,
                    {
                      role: "assistant",
                      text: aiResponse,
                      timestamp: new Date().toISOString(),
                      id: assistantMessageId,
                    },
                  ];
                }
              });
            }
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    } catch (error) {
      console.error("Send message error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I apologize, but I encountered an error. Please try again.",
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setInput("");
  };

  const copyToClipboard = async (text, messageId) => {
    await navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const sendFeedback = async (messageId, rating) => {
    try {
      await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          userId,
          rating,
        }),
      });
      
      setFeedbackStates((prev) => ({
        ...prev,
        [messageId]: rating,
      }));
    } catch (error) {
      console.error("Feedback error:", error);
    }
  };

  const modes = [
    { id: "tutor", label: "Tutor", icon: GraduationCap },
    { id: "explain", label: "Explain", icon: BookOpen },
    { id: "quiz", label: "Quiz", icon: Sparkles },
  ];

  const languages = [
    { id: "en", label: "English" },
    { id: "hi", label: "हिंदी" },
  ];

  return (
    <div className="h-screen bg-[#0B0B0B] text-gray-200 flex overflow-hidden">
      {/* Sidebar */}
      <ChatHistorySidebar
        userId={userId}
        currentChatId={currentChatId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={startNewChat}
        onSelectChat={loadChat}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-gray-800/60 bg-[#0B0B0B]/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-400" />
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h1 className="font-medium text-gray-200">
                    {currentChatId ? "Chat" : "New Chat"}
                  </h1>
                  {currentChatId && (
                    <p className="text-xs text-gray-500">
                      {messages.length} messages
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Mode Selector */}
              <div className="hidden md:flex items-center gap-1 bg-gray-900/50 border border-gray-800 rounded-lg p-1">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      mode === m.id
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
                    }`}
                  >
                    <m.icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Language Selector */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-gray-900/50 border border-gray-800 rounded-lg pl-8 pr-10 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <Globe className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>

              <button
                onClick={startNewChat}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/20 transition-colors"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400 hidden md:inline">New Chat</span>
              </button>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-blue-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-200 mb-3">
                  How can I help you learn?
                </h2>
                <p className="text-gray-500 max-w-md mb-12">
                  Ask me anything about your lesson. I can explain concepts, 
                  create quizzes, or help you understand difficult topics.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                  {[
                    "Can you explain this concept?",
                    "Create a practice quiz",
                    "Give me an example with code",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="p-4 bg-gray-900/30 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors text-left group"
                    >
                      <p className="text-sm text-gray-400 group-hover:text-gray-300">
                        {suggestion}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative max-w-3xl ${
                        msg.role === "user" ? "w-auto" : "w-full"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="absolute -left-12 top-0 w-8 h-8 bg-gray-900/80 rounded-lg border border-gray-800 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                        </div>
                      )}
                      
                      <div
                        className={`${
                          msg.role === "user"
                            ? "bg-blue-500/10 border border-blue-500/20 rounded-2xl px-5 py-3"
                            : "prose-container group"
                        } ${msg.isError ? "bg-red-500/10 border-red-500/20" : ""}`}
                      >
                        <FormattedMessage text={msg.text} />
                        
                        {/* Message Actions */}
                        {msg.role === "assistant" && msg.id && !msg.isError && (
                          <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyToClipboard(msg.text, msg.id)}
                              className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                              title="Copy to clipboard"
                            >
                              {copiedMessageId === msg.id ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => sendFeedback(msg.id, 'helpful')}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  feedbackStates[msg.id] === 'helpful'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'hover:bg-gray-800 text-gray-500'
                                }`}
                                title="Helpful"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => sendFeedback(msg.id, 'not_helpful')}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  feedbackStates[msg.id] === 'not_helpful'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'hover:bg-gray-800 text-gray-500'
                                }`}
                                title="Not helpful"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {msg.timestamp && (
                        <div className="mt-1.5 text-xs text-gray-600">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="relative max-w-3xl w-full">
                      <div className="absolute -left-12 top-0 w-8 h-8 bg-gray-900/80 rounded-lg border border-gray-800 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                      </div>
                      <div className="bg-[#1A1A1A] rounded-lg border border-gray-800/50 p-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:150ms]" />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800/60 bg-[#0B0B0B] sticky bottom-0">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question... (Press Enter to send, Shift+Enter for new line)"
                rows={1}
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-4 pr-28 py-3.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                style={{ maxHeight: "200px" }}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 disabled:opacity-50 disabled:hover:bg-blue-500/10 px-4 py-2 rounded-lg transition-colors border border-blue-500/20"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-medium text-blue-400 hidden md:inline">
                        Send
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
              <span>Shift + Enter for new line</span>
              <span>•</span>
              <span>Mode: {modes.find(m => m.id === mode)?.label}</span>
              <span>•</span>
              <span>Language: {languages.find(l => l.id === language)?.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}