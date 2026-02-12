import { CheckCircle, XCircle, HelpCircle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function McqCard({
  question,
  options,
  answer,
  explanation,
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = (opt) => {
    if (showAnswer) return;
    setSelectedOption(opt);
    if (opt === answer) {
      setShowAnswer(true);
    }
  };

  const isCorrect = selectedOption === answer;

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
          const isCorrectAnswer = opt === answer;
          
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
                <span className={`text-sm ${
                  showAnswer
                    ? isCorrectAnswer
                      ? "text-green-400 font-medium"
                      : isSelected
                      ? "text-red-400"
                      : "text-gray-400"
                    : isSelected
                    ? "text-blue-400"
                    : "text-gray-300"
                }`}>
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

      {/* Answer Section */}
      {showAnswer && (
        <div className="border-t border-gray-800 bg-gray-900/30 px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-green-400">
                  Correct Answer: {answer}
                </p>
                {explanation && (
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-400 transition-colors"
                  >
                    {showExplanation ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        Hide Explanation
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        Show Explanation
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {explanation && showExplanation && (
                <div className="mt-3 flex items-start gap-2 text-sm text-gray-400 bg-gray-900/50 p-3 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-yellow-500/70 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{explanation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Show Answer Button */}
      {!showAnswer && !selectedOption && (
        <div className="border-t border-gray-800 px-6 py-4 bg-gray-900/30">
          <button
            onClick={() => setShowAnswer(true)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            Show Answer
          </button>
        </div>
      )}

      {/* Result Message */}
      {selectedOption && !showAnswer && (
        <div className="border-t border-gray-800 px-6 py-4 bg-gray-900/30">
          <p className="text-sm text-yellow-500/80 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Check your answer to see if you're correct!
          </p>
        </div>
      )}
    </div>
  );
}