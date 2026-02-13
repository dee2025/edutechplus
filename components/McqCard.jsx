import { CheckCircle, HelpCircle, XCircle } from "lucide-react";
import { useState } from "react";

export default function McqCard({ question, options, answer, explanation }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const getOptionKey = (opt) => {
    const match = String(opt)
      .trim()
      .match(/^([A-Da-d])[.)]/);
    return match ? match[1].toUpperCase() : null;
  };

  const getAnswerKey = (value) => {
    if (!value) return null;
    const match = String(value)
      .trim()
      .match(/^([A-Da-d])\b/);
    return match ? match[1].toUpperCase() : null;
  };

  const answerKey = getAnswerKey(answer);

  // answerKey is now reliably extracted from the final answer summary
  const handleSelect = (opt) => {
    if (showAnswer) return;
    setSelectedOption(opt);
    setShowAnswer(true);
  };

  return (
    <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <h3 className="font-medium text-gray-200 leading-relaxed">
            {question}
          </h3>
        </div>
      </div>

      {/* Options */}
      <div className="px-6 py-4 space-y-3">
        {options.map((opt, i) => {
          const isSelected = opt === selectedOption;
          const optionKey = getOptionKey(opt);
          // Now we can rely on answerKey since it's extracted from the final answer summary
          const isCorrectAnswer = answerKey && optionKey === answerKey;

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={showAnswer}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                showAnswer
                  ? isCorrectAnswer
                    ? "bg-green-500/10 border-green-500/30 cursor-default"
                    : isSelected
                      ? "bg-red-500/10 border-red-500/30 cursor-default"
                      : "bg-[#242424] border-gray-800 opacity-60"
                  : isSelected
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-[#242424] border-gray-800 hover:border-gray-700 hover:bg-[#2a2a2a]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    showAnswer
                      ? isCorrectAnswer
                        ? "text-green-400 font-medium"
                        : isSelected
                          ? "text-red-400"
                          : "text-gray-400"
                      : isSelected
                        ? "text-blue-400"
                        : "text-gray-300"
                  }`}
                >
                  {opt}
                </span>
                {showAnswer && isCorrectAnswer && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
                {showAnswer && !isCorrectAnswer && isSelected && (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
