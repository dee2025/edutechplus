"use client";

import ChatHistorySidebar from "@/components/ChatHistorySidebar";
import FormattedMessage from "@/components/FormattedMessage";
import {
  BookOpen,
  Check,
  Copy,
  Loader2,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AITutorClient({ userId = 1 }) {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [feedbackStates, setFeedbackStates] = useState({});
  const [examName, setExamName] = useState("");
  const [difficulty, setDifficulty] = useState("Mixed");
  const [questionCount, setQuestionCount] = useState(10);
  const [language, setLanguage] = useState("en");

  const messagesEndRef = useRef(null);
  const lessonId = searchParams.get("lessonId") || null;

  // Load chat if chatId exists
  useEffect(() => {
    const chatId = searchParams.get("chatId");
    if (chatId) {
      loadChat(chatId);
    }
  }, [searchParams]);

  const loadChat = async (chatId) => {
    try {
      const res = await fetch(
        `/api/ai/history?userId=${userId}&chatId=${chatId}`,
      );
      const data = await res.json();
      setMessages(data.messages);
      setCurrentChatId(chatId);
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hide sidebar by default on first load
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  const canSend =
    !!examName.trim() &&
    !!difficulty &&
    Number.isFinite(questionCount) &&
    Number(questionCount) > 0 &&
    !loading;

  const sendMessage = async () => {
    if (!canSend) return;

    const requestMessage = [
      examName.trim() ? `Exam: ${examName.trim()}` : null,
      difficulty ? `Level: ${difficulty}` : null,
      Number.isFinite(questionCount)
        ? `Number of questions: ${questionCount}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const userMessage = {
      role: "user",
      text: requestMessage,
      timestamp: new Date().toISOString(),
      id: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          lessonId,
          message: requestMessage,
          mode: "practice-test", // Fixed mode for JEE Mains practice
          language: language,
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
                if (
                  lastMessage?.role === "assistant" &&
                  lastMessage.id === assistantMessageId
                ) {
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

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
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

  // Exam practice suggestion prompts
  const suggestions = [
    "Generate practice questions on Thermodynamics",
    "Create MCQs for bacterial infections (NEET)",
    "Give me problems on Quadratic equations",
    "Practice questions on Constitutional Law (UPSC)",
    "Data interpretation questions for bank exams",
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
        <header className="border-b border-gray-800/30 bg-linear-to-b from-gray-900/80 to-[#0B0B0B] backdrop-blur-md sticky top-0 z-10">
          <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-orange-500/10 text-gray-400 hover:text-orange-400 rounded-lg transition-all duration-200"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-orange-500/30 to-red-500/20 rounded-lg flex items-center justify-center border border-orange-500/20">
                  <MessageSquare className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-100 text-base">
                    {currentChatId ? "Practice Test" : "New Practice Session"}
                  </h1>
                  {currentChatId && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {messages.length}{" "}
                      {messages.length === 1 ? "message" : "messages"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={startNewChat}
              className="flex items-center gap-2 px-3 py-2 md:px-4 bg-linear-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 rounded-lg border border-orange-500/30 transition-all duration-200 group"
            >
              <Plus className="w-4 h-4 text-orange-400 group-hover:text-orange-300 transition-colors" />
              <span className="text-sm text-orange-400 group-hover:text-orange-300 hidden md:inline transition-colors">
                New Session
              </span>
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] md:min-h-[70vh] text-center py-6 md:py-8">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-linear-to-br from-orange-500/30 via-orange-500/10 to-red-500/20 rounded-3xl flex items-center justify-center mb-6 md:mb-8 border border-orange-500/20 shadow-2xl shadow-orange-500/5">
                  <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-orange-400" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-gray-100 via-gray-200 to-gray-100 bg-clip-text text-transparent mb-4">
                  Practice Test Papers
                </h2>
                <p className="text-gray-400 max-w-xl mb-8 md:mb-10 leading-relaxed text-sm">
                  Ask questions for any exam prep - JEE Mains, NEET, UPSC, SAT,
                  GATE, bank exams, and more. I will generate exam-standard
                  practice questions with step-by-step solutions.
                </p>

                <div className="w-full max-w-2xl mb-8 md:mb-10">
                  <p className="text-xs text-gray-500 font-semibold mb-5 uppercase tracking-wider">
                    Quick Starts
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(suggestion)}
                        className="group p-4 bg-linear-to-r from-gray-900/60 to-gray-800/40 border border-gray-800/60 rounded-xl hover:border-orange-500/50 hover:from-orange-500/10 hover:to-red-500/5 transition-all duration-200 text-left"
                      >
                        <p className="text-sm text-gray-300 group-hover:text-orange-300 flex items-center gap-3 transition-colors">
                          <span className="text-orange-400 text-lg">→</span>
                          <span>{suggestion}</span>
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-linear-to-br from-orange-500/10 via-orange-500/5 to-red-500/5 border border-orange-500/30 rounded-2xl p-8 max-w-2xl w-full">
                  <p className="text-sm text-orange-300 font-semibold mb-4">
                    Pro Tips for Better Answers
                  </p>
                  <ul className="text-xs text-gray-400 space-y-3 text-left">
                    <li className="flex gap-3">
                      <span className="text-orange-400 font-bold">1.</span>
                      <span>
                        Mention the exam name (JEE, NEET, UPSC, SAT, etc.) for
                        targeted content
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-orange-400 font-bold">2.</span>
                      <span>
                        Be specific with topics or chapters for focused practice
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-orange-400 font-bold">3.</span>
                      <span>
                        Ask for difficulty levels (Easy, Medium, Hard)
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-orange-400 font-bold">4.</span>
                      <span>
                        Request step-by-step solutions and key concepts
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex gap-4 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative max-w-3xl ${
                        msg.role === "user" ? "w-auto" : "w-full"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="absolute -left-14 top-1 w-9 h-9 bg-linear-to-br from-orange-500/30 to-red-500/20 rounded-lg border border-orange-500/30 flex items-center justify-center shadow-lg shadow-orange-500/10">
                          <BookOpen className="w-5 h-5 text-orange-400" />
                        </div>
                      )}

                      <div
                        className={`${
                          msg.role === "user"
                            ? "bg-linear-to-br from-orange-500/15 to-red-500/5 border border-orange-500/30 rounded-2xl px-5 py-4 shadow-lg shadow-orange-500/5"
                            : "prose-container group bg-gray-900/40 border border-gray-800/60 rounded-xl p-5 hover:border-gray-700/80 transition-colors duration-200"
                        } ${msg.isError ? "bg-red-500/10 border-red-500/30" : ""}`}
                      >
                        <div className="text-sm leading-relaxed text-gray-200">
                          <FormattedMessage text={msg.text} />
                        </div>

                        {/* Message Actions */}
                        {msg.role === "assistant" && msg.id && !msg.isError && (
                          <div className="flex items-center gap-1.5 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-200 pt-3 border-t border-gray-700/50">
                            <button
                              onClick={() => copyToClipboard(msg.text, msg.id)}
                              className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                              title="Copy to clipboard"
                            >
                              {copiedMessageId === msg.id ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-500" />
                              )}
                            </button>

                            <div className="flex items-center gap-0.5 ml-2">
                              <button
                                onClick={() => sendFeedback(msg.id, "helpful")}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  feedbackStates[msg.id] === "helpful"
                                    ? "bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20"
                                    : "hover:bg-gray-700/50 text-gray-500 hover:text-gray-300"
                                }`}
                                title="This was helpful"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  sendFeedback(msg.id, "not_helpful")
                                }
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  feedbackStates[msg.id] === "not_helpful"
                                    ? "bg-red-500/20 text-red-400 shadow-lg shadow-red-500/20"
                                    : "hover:bg-gray-700/50 text-gray-500 hover:text-gray-300"
                                }`}
                                title="This wasn't helpful"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {msg.timestamp && (
                        <div className="mt-2 text-xs text-gray-600 px-1">
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
                  <div className="flex gap-4 justify-start">
                    <div className="relative max-w-3xl w-full">
                      <div className="absolute -left-14 top-1 w-9 h-9 bg-linear-to-br from-orange-500/30 to-red-500/20 rounded-lg border border-orange-500/30 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                      </div>
                      <div className="bg-linear-to-r from-gray-900/60 to-gray-800/40 rounded-xl border border-gray-800/60 p-6 shadow-lg shadow-orange-500/5">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 bg-linear-to-r from-orange-400 to-red-400 rounded-full animate-pulse" />
                          <div className="w-2.5 h-2.5 bg-linear-to-r from-orange-400 to-red-400 rounded-full animate-pulse [animation-delay:150ms]" />
                          <div className="w-2.5 h-2.5 bg-linear-to-r from-orange-400 to-red-400 rounded-full animate-pulse [animation-delay:300ms]" />
                          <span className="text-xs text-gray-400 ml-2">
                            Generating answer...
                          </span>
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
        <div className="border-t border-gray-800/40 bg-linear-to-t from-[#0B0B0B] via-[#0B0B0B]/95 to-transparent sticky bottom-0 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-5">
            <div className="rounded-xl border border-gray-800/60 bg-gray-900/40 p-3 mb-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="sr-only">Exam name</label>
                  <input
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="Exam (e.g., NEET)"
                    className="w-full h-9 bg-gray-900/60 border border-gray-800/60 rounded-md px-2.5 text-[11px] text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50"
                  />
                </div>
                <div>
                  <label className="sr-only">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-9 bg-gray-900/60 border border-gray-800/60 rounded-md px-2.5 text-[11px] text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>
                </div>
                <div>
                  <label className="sr-only">Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full h-9 bg-gray-900/60 border border-gray-800/60 rounded-md px-2.5 text-[11px] text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50"
                  >
                    <option value="Mixed">Mixed level</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="sr-only">Questions</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full h-9 bg-gray-900/60 border border-gray-800/60 rounded-md px-2.5 text-[11px] text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50"
                  >
                    <option value={5}>5 questions</option>
                    <option value={10}>10 questions</option>
                    <option value={15}>15 questions</option>
                    <option value={20}>20 questions</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>📚</span>
                <span>Practice Test Mode</span>
                <span className="text-gray-700">•</span>
                <span>Select all three options</span>
              </div>
              {canSend && (
                <button
                  onClick={sendMessage}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto bg-linear-to-r from-orange-500/20 to-red-500/10 hover:from-orange-500/30 hover:to-red-500/20 px-5 py-2.5 rounded-lg transition-all duration-200 border border-orange-500/40 hover:border-orange-500/60 shadow-lg shadow-orange-500/10"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">
                        Generate
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
