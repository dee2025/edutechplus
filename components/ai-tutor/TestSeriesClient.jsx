"use client";

import TestResults from "@/components/ai-tutor/TestResults";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const examOptions = ["JEE Mains", "NEET", "UPSC", "SAT", "GATE"];

export default function TestSeriesClient({
  userId = 1,
  onTestComplete = () => {},
}) {
  // Setup Phase State
  const [examName, setExamName] = useState("");
  const [difficulty, setDifficulty] = useState("Mixed");
  const [questionCount, setQuestionCount] = useState(5);
  const [language, setLanguage] = useState("en");
  const [topic, setTopic] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Test Phase State
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const questionsEndRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (!testStarted || testSubmitted || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testSubmitted, timeLeft]);

  const canStartTest =
    !!examName.trim() && !!difficulty && Number.isFinite(questionCount);

  const startTest = async () => {
    if (!canStartTest) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          examName,
          topic: topic,
          difficulty: difficulty,
          language: language,
          questionCount: questionCount,
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let fullResponse = "";

      // Stream and collect the response
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.replace("data:", "").trim();
          if (payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.token) {
              fullResponse += parsed.token;
            }
          } catch (e) {
            console.error("Failed to parse SSE data:", e);
          }
        }
      }

      // Parse the accumulated JSON response
      let parsedQuestions = [];
      try {
        parsedQuestions = JSON.parse(fullResponse);
        if (!Array.isArray(parsedQuestions)) {
          parsedQuestions = [];
        }
      } catch (e) {
        console.error("Failed to parse questions JSON:", e);
        console.log("Response was:", fullResponse.substring(0, 200));
        parsedQuestions = [];
      }

      if (parsedQuestions.length === 0) {
        throw new Error(
          "Failed to parse questions. Please check that the API is generating valid questions.",
        );
      }

      console.log(`✓ Successfully loaded ${parsedQuestions.length} questions`);
      setQuestions(parsedQuestions);
      setUserAnswers({});
      setTimeLeft(questionCount * 60); // 1 minute per question
      setTestStarted(true);
      setTestSubmitted(false);
    } catch (err) {
      console.error("Test generation error:", err);
      setError(err.message || "Failed to generate test. Please try again.");
      setQuestions([]);
      setTestStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    if (testSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  const handleSubmitTest = async () => {
    setTestSubmitted(true);

    // Calculate score
    let correctCount = 0;
    questions.forEach((q) => {
      const userAnswer = userAnswers[q.id];
      if (userAnswer) {
        // Extract the letter from the selected option (e.g., "A) text" -> "A")
        const userAnswerKey = userAnswer.match(/^([A-D])\)/)?.[1].toUpperCase();

        // Compare with the correct answer
        if (userAnswerKey === q.answer?.toUpperCase()) {
          correctCount++;
        }
      }
    });

    const score = (correctCount / questions.length) * 100;
    const testResult = {
      userId,
      examName,
      topic,
      difficulty,
      language,
      questionCount: questions.length,
      correctAnswers: correctCount,
      wrongAnswers: questions.length - correctCount,
      score,
      userAnswers,
      questions,
      completedAt: new Date().toISOString(),
    };

    // Save to database
    try {
      const response = await fetch("/api/test-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testResult),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || "Failed to save test result to database",
        );
      }

      const data = await response.json();
      console.log("Test result saved successfully:", data);

      // Call completion callback
      onTestComplete?.();
    } catch (err) {
      console.error("Failed to save test result:", err);
      setError(
        err instanceof Error
          ? `Error saving test: ${err.message}`
          : "Failed to save test result to database",
      );
      // Still show results even if save failed
      setTimeout(() => {
        onTestComplete?.();
      }, 2000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Setup Phase UI
  if (!testStarted) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Create Your Test
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customize your test parameters and start learning
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Main Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Form */}
            <div className="lg:col-span-2 space-y-5">
              {/* Exam Selection */}
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">
                  Select Exam
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {examOptions.map((exam) => (
                    <button
                      key={exam}
                      onClick={() => setExamName(exam)}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        examName === exam
                          ? "bg-[#10a37f]/20 border-[#10a37f]/60 text-[#10a37f]"
                          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#10a37f]/40"
                      }`}
                    >
                      {exam}
                    </button>
                  ))}
                </div>
                <input
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="Or enter custom exam name..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#10a37f]/50 transition-all text-sm"
                />
              </div>

              {/* Topic Input */}
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">
                  Topic (Optional)
                </label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Biology, Thermodynamics, Organic Chemistry"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#10a37f]/50 transition-all text-sm"
                />
              </div>

              {/* Language and Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Language */}
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f]/50 transition-all cursor-pointer text-sm"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f]/50 transition-all cursor-pointer text-sm"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
              </div>

              {/* Question Count */}
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">
                  Number of Questions
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-300 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-[#10a37f]"
                  />
                  <div className="bg-[#10a37f]/10 border border-[#10a37f]/30 rounded-lg px-4 py-2 min-w-fit">
                    <span className="text-base font-bold text-[#10a37f]">
                      {questionCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Summary Card */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-5 h-fit sticky top-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Test Summary
              </h3>

              <div className="space-y-3 mb-6">
                {[
                  { label: "Exam", value: examName || "Not selected" },
                  { label: "Topic", value: topic || "General" },
                  { label: "Difficulty", value: difficulty },
                  {
                    label: "Language",
                    value: language === "en" ? "English" : "हिंदी",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-start gap-3 pb-3 border-b border-gray-300 dark:border-gray-700"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.label}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white text-right truncate">
                      {item.value}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center gap-3 pt-3 bg-[#10a37f]/10 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Questions
                  </span>
                  <span className="text-lg font-bold text-[#10a37f]">
                    {questionCount}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-6 text-center border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  ⏱ Estimated time
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {questionCount * 2} min
                </p>
              </div>

              <button
                onClick={startTest}
                disabled={!canStartTest || loading}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                  canStartTest && !loading
                    ? "bg-[#10a37f] hover:bg-[#0d9467] text-white shadow-md"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>Start Test</span>
                    <span className="text-lg">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test in Progress UI
  if (!testSubmitted) {
    const answeredCount = Object.keys(userAnswers).length;
    const progressPercent = (answeredCount / questionCount) * 100;

    return (
      <div className="w-full min-h-screen bg-white dark:bg-[#0d0d0d]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-6xl mx-auto">
            {/* Title and Timer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  {examName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                  {questionCount} Questions • {difficulty}
                </p>
              </div>
              <div
                className={`flex-shrink-0 text-center px-4 py-2 rounded-lg border text-sm font-mono font-semibold ${
                  timeLeft > 120
                    ? "text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30"
                    : timeLeft > 30
                      ? "text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30"
                      : "text-red-700 dark:text-red-400 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30"
                }`}
              >
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  Progress
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {answeredCount}/{questionCount}
                </span>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 border border-gray-400 dark:border-gray-600 overflow-hidden">
                <div
                  className="bg-[#10a37f] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Questions Container */}
          <div className="space-y-4 pb-24 sm:pb-20">
            {questions.map((question, idx) => (
              <div
                key={question.id}
                id={`q-${question.id}`}
                className="scroll-mt-32"
              >
                <TestMcqCard
                  {...question}
                  questionNumber={idx + 1}
                  isAnswered={question.id in userAnswers}
                  onSelect={(option) => handleAnswerSelect(question.id, option)}
                  disabled={testSubmitted}
                  totalQuestions={questionCount}
                />
              </div>
            ))}
            <div ref={questionsEndRef} />
          </div>
        </div>

        {/* Sticky Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <button
              onClick={() => setTestStarted(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition-colors text-sm"
            >
              Exit
            </button>
            <button
              onClick={handleSubmitTest}
              disabled={answeredCount === 0}
              className={`flex-1 py-2 px-4 font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2 ${
                answeredCount === 0
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  : "bg-[#10a37f] hover:bg-[#0d9467] text-white shadow-md"
              }`}
            >
              <span>Submit Test</span>
              <span>✓</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results UI
  return (
    <TestResults
      questions={questions}
      userAnswers={userAnswers}
      examName={examName}
      questionCount={questionCount}
      onRestart={() => {
        setTestStarted(false);
        setTestSubmitted(false);
        setQuestions([]);
        setUserAnswers({});
        setExamName("");
        setTopic("");
      }}
    />
  );
}

function TestMcqCard({
  questionNumber,
  question,
  options,
  isAnswered,
  onSelect,
  disabled,
  totalQuestions,
}) {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelect = (opt) => {
    if (disabled) return;
    setSelectedOption(opt);
    onSelect(opt);
  };

  return (
    <div
      className={`border rounded-lg p-4 sm:p-5 transition-all duration-300 ${
        isAnswered
          ? "bg-[#10a37f]/5 border-[#10a37f]/40 dark:bg-[#10a37f]/10 dark:border-[#10a37f]/30 shadow-sm dark:shadow-md dark:shadow-black/20"
          : "bg-gray-50 dark:bg-gray-800/40 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800/60"
      }`}
    >
      {/* Question Header */}
      <div className="mb-4 flex items-start gap-3 sm:gap-4">
        {/* Question Number Badge */}
        <div
          className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
            isAnswered
              ? "bg-[#10a37f] text-white border border-[#10a37f]"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
          }`}
        >
          {questionNumber}
        </div>

        {/* Question Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-gray-900 dark:text-gray-100 font-semibold leading-snug text-sm sm:text-base break-words">
            {question}
          </p>
        </div>

        {/* Answered Indicator */}
        {isAnswered && (
          <div className="flex-shrink-0 text-[#10a37f] text-lg font-bold mt-0.5">
            ✓
          </div>
        )}
      </div>

      {/* Options Container */}
      <div className="space-y-2.5">
        {options.map((opt, i) => {
          const isSelected = opt === selectedOption;
          const getOptionKey = (text) =>
            text.match(/^([A-Da-d])/)?.[1].toUpperCase();
          const optionKey = getOptionKey(opt);
          const optionText = opt.replace(/^[A-Da-d]\s*[.)-]\s*/, "");

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              className={`w-full text-left p-3 sm:p-3.5 rounded-lg border-2 transition-all flex items-center gap-3 sm:gap-3.5 group text-xs sm:text-sm ${
                isSelected
                  ? "bg-[#10a37f]/10 border-[#10a37f] dark:bg-[#10a37f]/20"
                  : "bg-white dark:bg-gray-800/30 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
              disabled={disabled}
            >
              {/* Option Circle */}
              <div
                className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all ${
                  isSelected
                    ? "bg-[#10a37f] border-[#10a37f] text-white"
                    : "bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 group-hover:border-gray-500 dark:group-hover:border-gray-500"
                }`}
              >
                {optionKey}
              </div>

              {/* Option Text */}
              <span className="flex-1 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors break-words">
                {optionText}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
