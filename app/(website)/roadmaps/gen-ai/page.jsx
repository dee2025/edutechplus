"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Code,
  CheckCircle,
  Circle,
  Target,
  Layers,
  Cpu,
  Shield,
  Library,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

/* -------------------- DATA -------------------- */
const WEEKS = [
  {
    title: "Week 1 — Foundations of Generative AI",
    goal:
      "Understand what Generative AI is, how it works conceptually, and where it is used.",
    days: [
      {
        day: 1,
        title: "What is Generative AI",
        takeaway:
          "Generative AI creates new content instead of just analyzing data.",
        theory: [
          "AI vs ML vs Deep Learning",
          "What makes AI generative",
          "Examples of generative models",
          "Real-world applications",
        ],
        practice: [
          "List daily-life GenAI use cases",
          "Differentiate GenAI vs traditional AI",
        ],
      },
      {
        day: 2,
        title: "History & Evolution of AI",
        takeaway:
          "GenAI is the result of decades of AI evolution.",
        theory: [
          "Rule-based systems",
          "Machine learning era",
          "Deep learning breakthrough",
          "Rise of large models",
        ],
        practice: [
          "Create AI evolution timeline",
          "Identify key breakthroughs",
        ],
      },
      {
        day: 3,
        title: "Types of Generative Models",
        takeaway:
          "Different models generate different types of content.",
        theory: [
          "Text generation models",
          "Image generation models",
          "Audio & video generation",
          "Multimodal models",
        ],
        practice: [
          "Classify GenAI tools by output type",
          "Map models to use cases",
        ],
      },
      {
        day: 4,
        title: "How Large Language Models Work (High Level)",
        takeaway:
          "LLMs predict the next token based on context.",
        theory: [
          "What is a token",
          "Training on large text corpora",
          "Probability-based prediction",
          "Why scale matters",
        ],
        practice: [
          "Manually predict next words in a sentence",
          "Analyze model responses",
        ],
      },
      {
        day: 5,
        title: "Data & Training Basics",
        takeaway:
          "Models learn patterns from massive datasets.",
        theory: [
          "Training vs inference",
          "Role of data quality",
          "Bias in training data",
          "Overfitting concept",
        ],
        practice: [
          "Identify bias examples",
          "Discuss data quality issues",
        ],
      },
      {
        day: 6,
        title: "Limitations of GenAI",
        takeaway:
          "GenAI is powerful but not intelligent.",
        theory: [
          "Hallucinations",
          "Lack of real understanding",
          "Knowledge cutoff",
          "Dependency on prompts",
        ],
        practice: [
          "Identify hallucinated responses",
          "List risks of blind trust",
        ],
      },
      {
        day: 7,
        title: "Week 1 Review",
        takeaway:
          "Strong fundamentals prevent misuse of GenAI.",
        theory: [
          "GenAI recap",
          "Model limitations",
          "Use cases review",
          "Common misconceptions",
        ],
        practice: [
          "Explain GenAI to a non-technical person",
        ],
      },
    ],
  },

  {
    title: "Week 2 — Prompting & Interaction with LLMs",
    goal:
      "Learn how to communicate effectively with language models.",
    days: [
      {
        day: 8,
        title: "What is Prompt Engineering",
        takeaway:
          "The prompt defines the model’s behavior.",
        theory: [
          "Prompt as instruction",
          "Context setting",
          "Role of constraints",
          "Prompt structure",
        ],
        practice: [
          "Rewrite prompts for clarity",
          "Compare vague vs clear prompts",
        ],
      },
      {
        day: 9,
        title: "Prompt Types",
        takeaway:
          "Different tasks need different prompt styles.",
        theory: [
          "Instruction prompts",
          "Question-answer prompts",
          "Role-based prompts",
          "Step-by-step prompts",
        ],
        practice: [
          "Create prompts for different tasks",
        ],
      },
      {
        day: 10,
        title: "Zero-shot, One-shot & Few-shot Prompting",
        takeaway:
          "Examples improve output quality.",
        theory: [
          "Zero-shot prompting",
          "One-shot prompting",
          "Few-shot prompting",
          "When to use each",
        ],
        practice: [
          "Convert zero-shot to few-shot prompt",
        ],
      },
      {
        day: 11,
        title: "Controlling Output Style & Tone",
        takeaway:
          "Models follow stylistic instructions well.",
        theory: [
          "Tone control",
          "Format control",
          "Length constraints",
          "Audience targeting",
        ],
        practice: [
          "Generate same content in different tones",
        ],
      },
      {
        day: 12,
        title: "Reasoning & Chain-of-Thought (Conceptual)",
        takeaway:
          "Explicit reasoning improves accuracy.",
        theory: [
          "Why reasoning helps",
          "Step-by-step thinking",
          "Hidden vs explicit reasoning",
          "Tradeoffs",
        ],
        practice: [
          "Solve problems with step-by-step prompts",
        ],
      },
      {
        day: 13,
        title: "Prompt Failures & Debugging",
        takeaway:
          "Bad outputs usually mean bad prompts.",
        theory: [
          "Ambiguity issues",
          "Overloaded prompts",
          "Missing constraints",
          "Debugging strategies",
        ],
        practice: [
          "Fix failing prompts",
        ],
      },
      {
        day: 14,
        title: "Week 2 Review",
        takeaway:
          "Prompting is a core GenAI skill.",
        theory: [
          "Prompt patterns recap",
          "Reasoning strategies",
          "Common mistakes",
          "Best practices",
        ],
        practice: [
          "Design prompt templates",
        ],
      },
    ],
  },

  {
    title: "Week 3 — Embeddings, Retrieval & Knowledge",
    goal:
      "Understand how GenAI works with external knowledge.",
    days: [
      {
        day: 15,
        title: "What are Embeddings",
        takeaway:
          "Embeddings convert meaning into vectors.",
        theory: [
          "Semantic meaning",
          "Vector representation",
          "Similarity search",
          "Use cases",
        ],
        practice: [
          "Group similar sentences manually",
        ],
      },
      {
        day: 16,
        title: "Vector Search Concept",
        takeaway:
          "Vector search finds meaning, not keywords.",
        theory: [
          "Cosine similarity",
          "Semantic search",
          "Vector databases (concept)",
          "Comparison with keyword search",
        ],
        practice: [
          "Compare keyword vs semantic search",
        ],
      },
      {
        day: 17,
        title: "Retrieval-Augmented Generation (RAG)",
        takeaway:
          "RAG grounds models with external data.",
        theory: [
          "Why RAG is needed",
          "Retrieval step",
          "Generation step",
          "Benefits & limitations",
        ],
        practice: [
          "Design simple RAG flow on paper",
        ],
      },
      {
        day: 18,
        title: "Context Windows & Memory",
        takeaway:
          "Models have limited context memory.",
        theory: [
          "Context window concept",
          "Short-term vs long-term memory",
          "Truncation issues",
          "Chunking strategies",
        ],
        practice: [
          "Chunk large text manually",
        ],
      },
      {
        day: 19,
        title: "Fine-tuning vs Prompting",
        takeaway:
          "Fine-tuning changes behavior; prompting guides it.",
        theory: [
          "What fine-tuning is",
          "When fine-tuning helps",
          "Cost & risk factors",
          "Alternatives",
        ],
        practice: [
          "Decide prompt vs fine-tune for scenarios",
        ],
      },
      {
        day: 20,
        title: "Knowledge Limitations",
        takeaway:
          "Models don’t know facts beyond training.",
        theory: [
          "Static knowledge",
          "Outdated information",
          "Tool augmentation",
          "Verification importance",
        ],
        practice: [
          "Identify outdated responses",
        ],
      },
      {
        day: 21,
        title: "Week 3 Review",
        takeaway:
          "Knowledge grounding improves reliability.",
        theory: [
          "Embeddings recap",
          "RAG concepts",
          "Context handling",
          "Best practices",
        ],
        practice: [
          "Design knowledge-based assistant",
        ],
      },
    ],
  },

  {
    title: "Week 4 — Agents, Ethics & Real-World Usage",
    goal:
      "Learn how GenAI is used responsibly in real applications.",
    days: [
      {
        day: 22,
        title: "What are AI Agents",
        takeaway:
          "Agents combine reasoning, tools, and memory.",
        theory: [
          "Agent definition",
          "LLM as brain",
          "Tools & actions",
          "Autonomous workflows",
        ],
        practice: [
          "Design agent workflow on paper",
        ],
      },
      {
        day: 23,
        title: "Tool Usage & Function Calling (Conceptual)",
        takeaway:
          "Tools extend model capabilities.",
        theory: [
          "Why tools are needed",
          "Function calling idea",
          "Deterministic outputs",
          "Safety advantages",
        ],
        practice: [
          "Map tasks to tools",
        ],
      },
      {
        day: 24,
        title: "Ethics & Responsible AI",
        takeaway:
          "Powerful AI must be used responsibly.",
        theory: [
          "Bias & fairness",
          "Data privacy",
          "Misuse risks",
          "Human oversight",
        ],
        practice: [
          "Analyze ethical scenarios",
        ],
      },
      {
        day: 25,
        title: "Security & Safety in GenAI",
        takeaway:
          "GenAI systems can be exploited.",
        theory: [
          "Prompt injection",
          "Data leakage",
          "Model misuse",
          "Guardrails",
        ],
        practice: [
          "Identify unsafe prompts",
        ],
      },
      {
        day: 26,
        title: "Evaluating GenAI Outputs",
        takeaway:
          "Evaluation ensures reliability.",
        theory: [
          "Accuracy vs usefulness",
          "Human evaluation",
          "Automated checks",
          "Feedback loops",
        ],
        practice: [
          "Rate model responses",
        ],
      },
      {
        day: 27,
        title: "GenAI Use Cases",
        takeaway:
          "GenAI is a productivity multiplier.",
        theory: [
          "Content generation",
          "Code assistance",
          "Customer support",
          "Data analysis",
        ],
        practice: [
          "Map GenAI to your domain",
        ],
      },
      {
        day: 28,
        title: "Limitations & Future of GenAI",
        takeaway:
          "GenAI is evolving rapidly.",
        theory: [
          "Current limitations",
          "Research directions",
          "Multimodal future",
          "Human-AI collaboration",
        ],
        practice: [
          "Predict future use cases",
        ],
      },
      {
        day: 29,
        title: "GenAI Interview Basics",
        takeaway:
          "Concept clarity matters more than buzzwords.",
        theory: [
          "Common GenAI questions",
          "Explain LLMs simply",
          "Tradeoffs discussion",
          "Use case reasoning",
        ],
        practice: [
          "Explain GenAI concepts verbally",
        ],
      },
      {
        day: 30,
        title: "Final Mini Project",
        takeaway:
          "Applying concepts solidifies learning.",
        theory: [
          "Problem definition",
          "Prompt design",
          "Knowledge grounding",
          "Evaluation",
        ],
        practice: [
          "Design GenAI assistant on paper",
          "Document system flow",
        ],
      },
    ],
  },
];



/* -------------------- PAGE -------------------- */

export default function WebSockets30DayPlan() {
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("ws-progress");
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  const toggleDay = (day) => {
    const updated = { ...completed, [day]: !completed[day] };
    setCompleted(updated);
    localStorage.setItem("ws-progress", JSON.stringify(updated));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            30-Day WebSockets Learning Plan
          </h1>
          <p className="text-blue-200 max-w-3xl mb-10">
            A structured, theory-first roadmap to mastering WebSockets,
            real-time systems, and scalable backend architectures.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            <Stat
              icon={Target}
              label="Daily Commitment"
              value="60–90 minutes"
            />
            <Stat
              icon={Layers}
              label="Learning Style"
              value="Theory + Practice"
            />
            <Stat
              icon={Cpu}
              label="Focus"
              value="Production Thinking"
            />
          </div>
        </div>
      </section>

      {/* ================= PRINCIPLES ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <SectionTitle
          icon={Shield}
          title="Learning Principles"
          subtitle="These rules ensure depth, clarity, and real-world readiness."
        />

        <div className="grid md:grid-cols-2 gap-6">
          <Principle
            title="Never Skip Theory"
            desc="Every real-time bug comes from misunderstanding how systems behave under load."
          />
          <Principle
            title="Design Before Code"
            desc="Whiteboard thinking prevents architectural mistakes."
          />
          <Principle
            title="Small Practice, Big Insight"
            desc="Each exercise is designed to reveal one core concept."
          />
          <Principle
            title="Think in Systems"
            desc="Focus on flows, state, and failure—not files."
          />
        </div>
      </section>

      {/* ================= WEEKS ================= */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        {WEEKS.map((week) => (
          <div key={week.title} className="mb-20">
            <div className="mb-10">
              <h2 className="text-2xl font-semibold mb-2">
                {week.title}
              </h2>
              <p className="text-slate-400 max-w-3xl">
                {week.goal}
              </p>
            </div>

            <div className="grid lg:grid-cols-1 gap-8">
              {week.days.map((d) => (
                <DayCard
                  key={d.day}
                  data={d}
                  completed={completed[d.day]}
                  toggle={() => toggleDay(d.day)}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ================= RESOURCES ================= */}
      <section className="bg-slate-900 border-t border-slate-800 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionTitle
            icon={Library}
            title="Recommended Resources"
            subtitle="Use these selectively—this plan is primary."
          />

          <div className="grid md:grid-cols-3 gap-6">
            <Resource title="MDN WebSockets" />
            <Resource title="RFC 6455 Specification" />
            <Resource title="Redis Pub/Sub Docs" />
            <Resource title="System Design Primer" />
            <Resource title="Nginx WebSocket Guide" />
            <Resource title="Node.js Event Loop Docs" />
          </div>
        </div>
      </section>
    </main>
  );
}

/* -------------------- COMPONENTS -------------------- */

function DayCard({ data, completed, toggle }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-600 hover:shadow-xl transition">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg">
          Day {data.day} — {data.title}
        </h3>
        <button
          onClick={toggle}
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-slate-100"
        >
          {completed ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-slate-500" />
          )}
          {completed ? "Completed" : "Mark complete"}
        </button>
      </div>

      {/* Key Takeaway */}
      <div className="bg-blue-950 border-l-4 border-blue-600 p-4 mb-6 text-sm text-blue-200">
        <strong className="text-blue-400">Key Takeaway:</strong>{" "}
        {data.takeaway}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Block title="Theory" icon={BookOpen} items={data.theory} />
        <Block title="Practice" icon={Code} items={data.practice} />
      </div>
    </div>
  );
}

function Block({ title, icon: Icon, items }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-blue-500" />
        <h4 className="font-medium">{title}</h4>
      </div>
      <ul className="list-disc list-inside text-slate-300 space-y-1">
        {items.map((i, idx) => (
          <li key={idx}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-semibold">
          {title}
        </h2>
      </div>
      <p className="text-slate-400 max-w-3xl">
        {subtitle}
      </p>
    </div>
  );
}

function Principle({ title, desc }) {
  return (
    <div className="border border-slate-800 rounded-xl p-6 bg-slate-900">
      <h4 className="font-medium mb-2">
        {title}
      </h4>
      <p className="text-slate-400 text-sm">
        {desc}
      </p>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur">
      <Icon className="w-6 h-6 mb-2 text-blue-300" />
      <div className="text-sm text-blue-200">
        {label}
      </div>
      <div className="font-semibold">
        {value}
      </div>
    </div>
  );
}

function Resource({ title }) {
  return (
    <div className="flex items-center justify-between border border-slate-800 rounded-lg p-4 bg-slate-900 hover:border-blue-600 transition">
      <span className="text-slate-300">
        {title}
      </span>
      <ArrowRight className="w-4 h-4 text-slate-500" />
    </div>
  );
}
