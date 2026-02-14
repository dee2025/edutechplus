import { AlertCircle, CheckCircle, RotateCcw, XCircle } from "lucide-react";

export default function TestResults({
  questions,
  userAnswers,
  examName,
  questionCount,
  onRestart,
}) {
  // Calculate statistics
  let correctCount = 0;
  let wrongCount = 0;
  let notAnsweredCount = 0;

  const results = questions.map((q) => {
    const userAnswer = userAnswers[q.id];
    const userAnswerKey = userAnswer?.match(/^([A-Da-d])/)?.[1].toUpperCase();
    const isCorrect = userAnswerKey === q.answer;
    const isNotAnswered = !userAnswer;

    if (isCorrect) correctCount++;
    else if (isNotAnswered) notAnsweredCount++;
    else wrongCount++;

    return {
      ...q,
      userAnswer,
      userAnswerKey,
      isCorrect,
      isNotAnswered,
    };
  });

  const score = ((correctCount / questions.length) * 100).toFixed(1);
  const percentage = ((correctCount / questions.length) * 100).toFixed(0);

  // Performance rating
  const getPerformanceRating = (percent) => {
    if (percent >= 90)
      return {
        label: "Excellent",
        color: "text-[#10a37f] dark:text-[#10a37f]",
        bg: "bg-[#10a37f]/5 dark:bg-[#10a37f]/10 border-[#10a37f]/30 dark:border-[#10a37f]/40",
        icon: "🌟",
      };
    if (percent >= 75)
      return {
        label: "Good",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
        icon: "💪",
      };
    if (percent >= 60)
      return {
        label: "Fair",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
        icon: "👍",
      };
    return {
      label: "Needs Improvement",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
      icon: "💪",
    };
  };

  const performance = getPerformanceRating(parseFloat(percentage));

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#0d0d0d]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Test Results
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Exam:{" "}
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {examName}
            </span>
          </p>
        </div>

        {/* Main Score Card */}
        <div
          className={`${performance.bg} border rounded-lg p-5 sm:p-6 mb-5 shadow-sm dark:shadow-md dark:shadow-black/20 transition-all`}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            <div className="flex-1 text-center sm:text-left w-full">
              <h3 className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
                Overall Performance
              </h3>
              <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-1 justify-center sm:justify-start mb-2">
                <div className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                  {percentage}
                  <span className="text-2xl">%</span>
                </div>
              </div>
              <p className={`text-base font-semibold ${performance.color}`}>
                {performance.label}
              </p>
            </div>
            <div className="text-4xl">{performance.icon}</div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-3 text-center sm:text-left">
            <span className="font-semibold text-gray-900 dark:text-white">
              {correctCount}
            </span>{" "}
            out of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {questions.length}
            </span>{" "}
            correct
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {/* Correct Answers */}
          <div className="bg-[#10a37f]/5 dark:bg-[#10a37f]/10 border border-[#10a37f]/30 dark:border-[#10a37f]/40 rounded-lg p-4 hover:border-[#10a37f]/50 dark:hover:border-[#10a37f]/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase">
                Correct
              </h3>
              <CheckCircle className="w-4 h-4 text-[#10a37f]" />
            </div>
            <div className="text-3xl font-bold text-[#10a37f] mb-2">
              {correctCount}
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-1.5 border border-gray-400 dark:border-gray-600">
              <div
                className="bg-[#10a37f] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(correctCount / questions.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-[#10a37f] mt-1.5">
              {((correctCount / questions.length) * 100).toFixed(0)}%
            </p>
          </div>

          {/* Wrong Answers */}
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 hover:border-red-300 dark:hover:border-red-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase">
                Incorrect
              </h3>
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {wrongCount}
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-1.5 border border-gray-400 dark:border-gray-600">
              <div
                className="bg-red-600 dark:bg-red-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(wrongCount / questions.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
              {((wrongCount / questions.length) * 100).toFixed(0)}%
            </p>
          </div>

          {/* Not Answered */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase">
                Skipped
              </h3>
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
              {notAnsweredCount}
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-1.5 border border-gray-400 dark:border-gray-600">
              <div
                className="bg-amber-600 dark:bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${(notAnsweredCount / questions.length) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">
              {((notAnsweredCount / questions.length) * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Questions Review */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#10a37f] rounded-full"></span>
            Detailed Review
          </h3>

          <div className="space-y-3">
            {results.map((result, idx) => {
              const optionKey = result.userAnswerKey;

              return (
                <div
                  key={result.id}
                  className={`border rounded-lg p-4 transition-all ${
                    result.isCorrect
                      ? "bg-[#10a37f]/5 dark:bg-[#10a37f]/10 border-[#10a37f]/30 dark:border-[#10a37f]/40 hover:border-[#10a37f]/50"
                      : result.isNotAnswered
                        ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700"
                        : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                  }`}
                >
                  {/* Question Header */}
                  <div className="mb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border ${
                            result.isCorrect
                              ? "bg-[#10a37f] text-white border-[#10a37f]"
                              : result.isNotAnswered
                                ? "bg-amber-600/20 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                                : "bg-red-600/20 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
                          }`}
                        >
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 dark:text-gray-100 font-medium mb-2 text-xs sm:text-sm break-words">
                          {result.question}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {result.isCorrect && (
                            <span className="text-xs text-[#10a37f] bg-[#10a37f]/10 dark:bg-[#10a37f]/20 px-2 py-1 rounded-full border border-[#10a37f]/30 dark:border-[#10a37f]/50">
                              ✓ Correct
                            </span>
                          )}
                          {result.isNotAnswered && (
                            <span className="text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-700">
                              ⊘ Skipped
                            </span>
                          )}
                          {!result.isCorrect && !result.isNotAnswered && (
                            <span className="text-xs text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/40 px-2 py-1 rounded-full border border-red-200 dark:border-red-700">
                              ✗ Wrong
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-1.5 mb-3">
                    {result.options.map((opt, i) => {
                      const getOptionKey = (text) =>
                        text.match(/^([A-Da-d])/)?.[1].toUpperCase();
                      const key = getOptionKey(opt);
                      const isUserSelected = key === result.userAnswerKey;
                      const isCorrectAnswer = key === result.answer;

                      return (
                        <div
                          key={i}
                          className={`p-2.5 rounded-md border transition-all text-xs ${
                            isCorrectAnswer
                              ? "bg-[#10a37f]/10 dark:bg-[#10a37f]/20 border-[#10a37f]/40 dark:border-[#10a37f]/60 text-[#10a37f]"
                              : isUserSelected && !result.isCorrect
                                ? "bg-red-100 dark:bg-red-950/40 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400"
                                : "bg-gray-100 dark:bg-gray-800/40 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold min-w-fit">{key}.</span>
                            <span className="flex-1 break-words">
                              {opt.replace(/^[A-Da-d]\s*[.)-]\s*/, "")}
                            </span>
                            {isCorrectAnswer && (
                              <CheckCircle className="w-3 h-3 flex-shrink-0" />
                            )}
                            {isUserSelected && !result.isCorrect && (
                              <XCircle className="w-3 h-3 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {result.explanation && (
                    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-md p-3 border border-gray-300 dark:border-gray-700">
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 block mb-1">
                          💡 Explanation
                        </span>
                        {result.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Restart Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={onRestart}
              className="w-full py-2.5 px-4 flex items-center justify-center gap-2 bg-[#10a37f] hover:bg-[#0d9467] text-white font-semibold rounded-lg transition-all shadow-md text-xs sm:text-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Take Another Test
            </button>
          </div>
        </div>

        {/* Spacing for sticky button */}
        <div className="h-16 sm:h-14"></div>
      </div>
    </div>
  );
}
