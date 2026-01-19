export function extractFaqsFromContent(content) {
  const faqSection = content.split("## FAQs")[1];
  if (!faqSection) return [];

  const lines = faqSection.split("\n").map((l) => l.trim());
  const faqs = [];

  let currentQuestion = "";
  let currentAnswer = [];

  for (const line of lines) {
    if (line.startsWith("### ")) {
      if (currentQuestion && currentAnswer.length) {
        faqs.push({
          question: currentQuestion,
          answer: currentAnswer.join(" "),
        });
      }
      currentQuestion = line.replace("### ", "").trim();
      currentAnswer = [];
    } else if (line && !line.startsWith("#")) {
      currentAnswer.push(line);
    }
  }

  if (currentQuestion && currentAnswer.length) {
    faqs.push({
      question: currentQuestion,
      answer: currentAnswer.join(" "),
    });
  }

  return faqs;
}
