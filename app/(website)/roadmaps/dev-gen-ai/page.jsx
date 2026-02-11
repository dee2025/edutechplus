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
    title: "Week 1 — GenAI & LLM Foundations for Developers",
    goal:
      "Understand how LLMs work internally and how developers interact with them.",
    days: [
      {
        day: 1,
        title: "GenAI Overview for Developers",
        takeaway:
          "GenAI systems are probabilistic software components.",
        theory: [
          "What GenAI is from a developer lens",
          "LLMs as APIs",
          "Deterministic vs probabilistic systems",
          "Common GenAI architectures",
        ],
        practice: [
          "List places GenAI fits in your apps",
          "Identify probabilistic risks",
        ],
      },
      {
        day: 2,
        title: "How LLMs Generate Text",
        takeaway:
          "LLMs predict the next token using context.",
        theory: [
          "Tokenization basics",
          "Context windows",
          "Next-token prediction",
          "Why outputs vary",
        ],
        practice: [
          "Manually predict next tokens",
          "Analyze temperature impact conceptually",
        ],
      },
      {
        day: 3,
        title: "Model Capabilities & Limitations",
        takeaway:
          "LLMs are powerful but unreliable without guardrails.",
        theory: [
          "Hallucinations",
          "Lack of real reasoning",
          "Knowledge cutoff",
          "Prompt sensitivity",
        ],
        practice: [
          "Identify hallucinated responses",
        ],
      },
      {
        day: 4,
        title: "LLM API Basics",
        takeaway:
          "LLMs are consumed like any other external API.",
        theory: [
          "Request-response lifecycle",
          "Tokens & cost model",
          "Latency considerations",
          "Error handling",
        ],
        practice: [
          "Design LLM API request structure",
        ],
      },
      {
        day: 5,
        title: "Prompt Engineering for Developers",
        takeaway:
          "Prompts are part of application logic.",
        theory: [
          "System vs user prompts",
          "Prompt templates",
          "Constraints & instructions",
          "Prompt versioning",
        ],
        practice: [
          "Design reusable prompt template",
        ],
      },
      {
        day: 6,
        title: "Prompt Debugging & Reliability",
        takeaway:
          "Bad prompts cause unpredictable production behavior.",
        theory: [
          "Ambiguity issues",
          "Prompt drift",
          "Output validation",
          "Fallback strategies",
        ],
        practice: [
          "Fix failing prompts",
        ],
      },
      {
        day: 7,
        title: "Week 1 Review",
        takeaway:
          "LLMs require engineering discipline.",
        theory: [
          "LLM fundamentals recap",
          "Prompt patterns",
          "Limitations review",
          "Developer mindset",
        ],
        practice: [
          "Explain LLM behavior to teammate",
        ],
      },
    ],
  },

  {
    title: "Week 2 — Embeddings, Search & RAG",
    goal:
      "Learn how to ground LLMs with external data using embeddings.",
    days: [
      {
        day: 8,
        title: "Embeddings for Developers",
        takeaway:
          "Embeddings encode semantic meaning as vectors.",
        theory: [
          "What embeddings are",
          "Semantic similarity",
          "Vector dimensionality",
          "Common use cases",
        ],
        practice: [
          "Group similar texts manually",
        ],
      },
      {
        day: 9,
        title: "Vector Search Fundamentals",
        takeaway:
          "Vector search retrieves meaning, not keywords.",
        theory: [
          "Cosine similarity",
          "Approximate nearest neighbors",
          "Vector index basics",
          "Search accuracy tradeoffs",
        ],
        practice: [
          "Compare keyword vs semantic search",
        ],
      },
      {
        day: 10,
        title: "RAG Architecture",
        takeaway:
          "RAG reduces hallucinations by grounding answers.",
        theory: [
          "Why RAG is needed",
          "Ingestion pipeline",
          "Retrieval step",
          "Generation step",
        ],
        practice: [
          "Design RAG pipeline diagram",
        ],
      },
      {
        day: 11,
        title: "Chunking & Context Management",
        takeaway:
          "Chunking determines retrieval quality.",
        theory: [
          "Chunk size tradeoffs",
          "Overlap strategies",
          "Context window limits",
          "Ranking relevance",
        ],
        practice: [
          "Manually chunk a document",
        ],
      },
      {
        day: 12,
        title: "RAG Failure Modes",
        takeaway:
          "Most RAG issues are data or retrieval related.",
        theory: [
          "Bad chunks",
          "Poor retrieval",
          "Context overflow",
          "Stale data",
        ],
        practice: [
          "Identify RAG failure causes",
        ],
      },
      {
        day: 13,
        title: "Caching & Cost Optimization",
        takeaway:
          "GenAI costs must be engineered.",
        theory: [
          "Response caching",
          "Embedding reuse",
          "Token optimization",
          "Latency vs cost tradeoff",
        ],
        practice: [
          "Design caching strategy",
        ],
      },
      {
        day: 14,
        title: "Week 2 Review",
        takeaway:
          "Embeddings + retrieval enable reliable systems.",
        theory: [
          "Embeddings recap",
          "RAG flow review",
          "Performance considerations",
          "Best practices",
        ],
        practice: [
          "Explain RAG to non-GenAI dev",
        ],
      },
    ],
  },

  {
    title: "Week 3 — Tools, Agents & System Design",
    goal:
      "Build agentic systems using tools and structured workflows.",
    days: [
      {
        day: 15,
        title: "Function Calling & Tools",
        takeaway:
          "Tools give LLMs deterministic capabilities.",
        theory: [
          "Why tools are required",
          "Function calling concept",
          "Input/output schemas",
          "Safety advantages",
        ],
        practice: [
          "Map app features to tools",
        ],
      },
      {
        day: 16,
        title: "Agent Architecture",
        takeaway:
          "Agents are workflows, not magic.",
        theory: [
          "Agent components",
          "LLM as planner",
          "Memory & state",
          "Execution loop",
        ],
        practice: [
          "Design agent workflow",
        ],
      },
      {
        day: 17,
        title: "State & Memory in Agents",
        takeaway:
          "State management defines agent reliability.",
        theory: [
          "Short-term memory",
          "Long-term memory",
          "Session handling",
          "State persistence",
        ],
        practice: [
          "Design agent memory model",
        ],
      },
      {
        day: 18,
        title: "Multi-Step Reasoning Systems",
        takeaway:
          "Complex tasks require decomposition.",
        theory: [
          "Task decomposition",
          "Planner-executor model",
          "Intermediate outputs",
          "Error recovery",
        ],
        practice: [
          "Break task into steps",
        ],
      },
      {
        day: 19,
        title: "Security in GenAI Apps",
        takeaway:
          "GenAI systems introduce new attack vectors.",
        theory: [
          "Prompt injection",
          "Tool misuse",
          "Data leakage",
          "Access control",
        ],
        practice: [
          "Identify insecure prompts",
        ],
      },
      {
        day: 20,
        title: "GenAI System Design Patterns",
        takeaway:
          "Patterns reduce repeated mistakes.",
        theory: [
          "Chat systems",
          "Search assistants",
          "Workflow automation",
          "Decision support systems",
        ],
        practice: [
          "Choose pattern for use case",
        ],
      },
      {
        day: 21,
        title: "Week 3 Review",
        takeaway:
          "Agents need strong engineering boundaries.",
        theory: [
          "Agent recap",
          "Tooling review",
          "Security review",
          "Design tradeoffs",
        ],
        practice: [
          "Design agent-based system",
        ],
      },
    ],
  },

  {
    title: "Week 4 — Evaluation, Scaling & Production",
    goal:
      "Prepare GenAI systems for real-world production usage.",
    days: [
      {
        day: 22,
        title: "Evaluating LLM Outputs",
        takeaway:
          "If you can’t evaluate, you can’t trust.",
        theory: [
          "Manual evaluation",
          "Automated evaluation",
          "Golden datasets",
          "Regression testing",
        ],
        practice: [
          "Create evaluation checklist",
        ],
      },
      {
        day: 23,
        title: "Monitoring & Observability",
        takeaway:
          "Production GenAI requires visibility.",
        theory: [
          "Latency metrics",
          "Token usage",
          "Failure tracking",
          "Feedback loops",
        ],
        practice: [
          "Define monitoring metrics",
        ],
      },
      {
        day: 24,
        title: "Scaling GenAI Systems",
        takeaway:
          "Scaling is more than adding servers.",
        theory: [
          "Concurrency handling",
          "Rate limiting",
          "Queue-based processing",
          "Cost control",
        ],
        practice: [
          "Design scalable architecture",
        ],
      },
      {
        day: 25,
        title: "Fallbacks & Reliability",
        takeaway:
          "Failure must be expected.",
        theory: [
          "Retry strategies",
          "Graceful degradation",
          "Rule-based fallbacks",
          "User experience impact",
        ],
        practice: [
          "Design fallback logic",
        ],
      },
      {
        day: 26,
        title: "Fine-tuning vs RAG",
        takeaway:
          "Fine-tuning is not always the answer.",
        theory: [
          "When to fine-tune",
          "Cost & maintenance",
          "RAG alternatives",
          "Hybrid approaches",
        ],
        practice: [
          "Choose approach for scenarios",
        ],
      },
      {
        day: 27,
        title: "Ethics & Responsible AI",
        takeaway:
          "Developers own the impact of AI systems.",
        theory: [
          "Bias mitigation",
          "Privacy concerns",
          "Transparency",
          "Human oversight",
        ],
        practice: [
          "Review ethical risks",
        ],
      },
      {
        day: 28,
        title: "GenAI Product Thinking",
        takeaway:
          "Good GenAI products solve real problems.",
        theory: [
          "User intent",
          "Cost-benefit analysis",
          "UX for AI",
          "Trust building",
        ],
        practice: [
          "Define GenAI product idea",
        ],
      },
      {
        day: 29,
        title: "GenAI Interview Prep",
        takeaway:
          "Concept clarity beats buzzwords.",
        theory: [
          "Common GenAI interview questions",
          "Explain RAG & agents",
          "Tradeoffs discussion",
          "System design framing",
        ],
        practice: [
          "Explain GenAI system design",
        ],
      },
      {
        day: 30,
        title: "Final Developer Project",
        takeaway:
          "End-to-end building solidifies expertise.",
        theory: [
          "System planning",
          "Component boundaries",
          "Evaluation strategy",
          "Production checklist",
        ],
        practice: [
          "Design GenAI-powered backend",
          "Document architecture",
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
