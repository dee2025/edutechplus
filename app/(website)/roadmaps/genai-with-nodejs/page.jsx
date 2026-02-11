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
    title: "Week 1 — GenAI Fundamentals for Node.js Developers",
    goal:
      "Understand GenAI concepts from a backend developer’s perspective and how LLMs fit into Node.js systems.",
    days: [
      {
        day: 1,
        title: "GenAI Overview for Backend Systems",
        takeaway:
          "GenAI is a probabilistic backend dependency, not magic logic.",
        theory: [
          "GenAI in backend architectures",
          "LLMs as external services",
          "Probabilistic vs deterministic logic",
          "Backend use cases of GenAI",
        ],
        practice: [
          "List GenAI backend use cases",
          "Identify deterministic vs GenAI parts",
        ],
      },
      {
        day: 2,
        title: "How LLMs Work (Backend View)",
        takeaway:
          "LLMs predict tokens based on context, not intent.",
        theory: [
          "Tokenization basics",
          "Context windows",
          "Next-token prediction",
          "Why responses vary",
        ],
        practice: [
          "Analyze same prompt outputs",
          "Reason about variability",
        ],
      },
      {
        day: 3,
        title: "LLM API Consumption in Node.js",
        takeaway:
          "LLMs behave like any external API with latency and failure.",
        theory: [
          "HTTP request lifecycle",
          "Async API handling",
          "Timeouts & retries",
          "Error handling strategies",
        ],
        practice: [
          "Design Node.js service wrapper",
        ],
      },
      {
        day: 4,
        title: "Prompt Engineering as Backend Logic",
        takeaway:
          "Prompts are part of application code.",
        theory: [
          "System vs user prompts",
          "Prompt templates",
          "Dynamic prompt construction",
          "Prompt versioning",
        ],
        practice: [
          "Design reusable prompt template",
        ],
      },
      {
        day: 5,
        title: "Output Validation & Guardrails",
        takeaway:
          "Never trust raw model output.",
        theory: [
          "Structured outputs",
          "Schema validation",
          "Fallback responses",
          "Error containment",
        ],
        practice: [
          "Define output validation rules",
        ],
      },
      {
        day: 6,
        title: "Cost, Tokens & Performance",
        takeaway:
          "Token usage directly impacts backend cost.",
        theory: [
          "Token-based pricing",
          "Prompt length optimization",
          "Caching responses",
          "Latency vs cost tradeoffs",
        ],
        practice: [
          "Design cost-optimized prompt",
        ],
      },
      {
        day: 7,
        title: "Week 1 Review",
        takeaway:
          "GenAI must be engineered like any backend dependency.",
        theory: [
          "LLM fundamentals recap",
          "API integration risks",
          "Prompt engineering recap",
          "Cost awareness",
        ],
        practice: [
          "Explain GenAI backend flow",
        ],
      },
    ],
  },

  {
    title: "Week 2 — Embeddings, Search & RAG in Node.js",
    goal:
      "Ground LLMs using external data through embeddings and retrieval pipelines.",
    days: [
      {
        day: 8,
        title: "Embeddings in Backend Systems",
        takeaway:
          "Embeddings convert text into searchable vectors.",
        theory: [
          "Semantic embeddings",
          "Vector dimensions",
          "Embedding generation",
          "Backend use cases",
        ],
        practice: [
          "Design embedding generation flow",
        ],
      },
      {
        day: 9,
        title: "Vector Storage & Search",
        takeaway:
          "Vector search retrieves meaning, not keywords.",
        theory: [
          "Vector similarity",
          "Indexing concepts",
          "Search accuracy tradeoffs",
          "Latency considerations",
        ],
        practice: [
          "Design vector search API",
        ],
      },
      {
        day: 10,
        title: "RAG Architecture (Node.js)",
        takeaway:
          "RAG reduces hallucinations by injecting context.",
        theory: [
          "Why backend RAG is needed",
          "Ingestion pipeline",
          "Retrieval step",
          "Prompt injection of context",
        ],
        practice: [
          "Draw RAG backend architecture",
        ],
      },
      {
        day: 11,
        title: "Chunking & Indexing Strategies",
        takeaway:
          "Chunking directly impacts answer quality.",
        theory: [
          "Chunk size tradeoffs",
          "Overlap strategies",
          "Metadata indexing",
          "Re-ranking basics",
        ],
        practice: [
          "Design chunking strategy",
        ],
      },
      {
        day: 12,
        title: "RAG Failure Modes",
        takeaway:
          "Most failures happen before generation.",
        theory: [
          "Poor retrieval",
          "Context overflow",
          "Outdated documents",
          "Ranking errors",
        ],
        practice: [
          "Identify RAG failure scenarios",
        ],
      },
      {
        day: 13,
        title: "Caching & Optimization in RAG",
        takeaway:
          "Caching is mandatory for production GenAI.",
        theory: [
          "Embedding reuse",
          "Query caching",
          "Response caching",
          "Invalidation strategies",
        ],
        practice: [
          "Design RAG caching layer",
        ],
      },
      {
        day: 14,
        title: "Week 2 Review",
        takeaway:
          "Embeddings + retrieval create reliable GenAI backends.",
        theory: [
          "Embeddings recap",
          "RAG architecture review",
          "Performance considerations",
          "Best practices",
        ],
        practice: [
          "Explain RAG backend flow",
        ],
      },
    ],
  },

  {
    title: "Week 3 — Agents, Tools & Backend Workflows",
    goal:
      "Build agentic workflows with tools and controlled execution.",
    days: [
      {
        day: 15,
        title: "Tool & Function Calling",
        takeaway:
          "Tools give LLMs controlled access to backend logic.",
        theory: [
          "Why tools are required",
          "Function calling concept",
          "Input/output schemas",
          "Security benefits",
        ],
        practice: [
          "Map backend APIs to tools",
        ],
      },
      {
        day: 16,
        title: "Agent Architecture in Node.js",
        takeaway:
          "Agents are stateful backend workflows.",
        theory: [
          "Planner-executor model",
          "Agent loop",
          "State tracking",
          "Failure handling",
        ],
        practice: [
          "Design agent workflow diagram",
        ],
      },
      {
        day: 17,
        title: "Memory & Session Management",
        takeaway:
          "Memory defines agent behavior over time.",
        theory: [
          "Short-term memory",
          "Long-term memory",
          "Session storage",
          "Context pruning",
        ],
        practice: [
          "Design memory storage model",
        ],
      },
      {
        day: 18,
        title: "Multi-Step Reasoning Systems",
        takeaway:
          "Complex tasks need orchestration.",
        theory: [
          "Task decomposition",
          "Intermediate state",
          "Error recovery",
          "Execution tracing",
        ],
        practice: [
          "Break backend task into steps",
        ],
      },
      {
        day: 19,
        title: "Security in GenAI Backends",
        takeaway:
          "GenAI introduces new backend attack vectors.",
        theory: [
          "Prompt injection",
          "Tool misuse",
          "Data leakage",
          "Access control",
        ],
        practice: [
          "Identify insecure backend prompts",
        ],
      },
      {
        day: 20,
        title: "GenAI Backend Design Patterns",
        takeaway:
          "Patterns reduce production failures.",
        theory: [
          "Chat backends",
          "Search assistants",
          "Workflow automation",
          "Decision engines",
        ],
        practice: [
          "Choose backend pattern for use case",
        ],
      },
      {
        day: 21,
        title: "Week 3 Review",
        takeaway:
          "Agents require strict boundaries.",
        theory: [
          "Agent recap",
          "Tooling review",
          "Security recap",
          "Tradeoffs",
        ],
        practice: [
          "Design agent-based backend",
        ],
      },
    ],
  },

  {
    title: "Week 4 — Scaling, Reliability & Production",
    goal:
      "Make GenAI backends scalable, observable, and reliable.",
    days: [
      {
        day: 22,
        title: "Evaluating GenAI Backend Outputs",
        takeaway:
          "Evaluation is a backend responsibility.",
        theory: [
          "Response correctness",
          "Schema validation",
          "Golden datasets",
          "Regression testing",
        ],
        practice: [
          "Design evaluation checklist",
        ],
      },
      {
        day: 23,
        title: "Monitoring & Observability",
        takeaway:
          "Production GenAI requires deep visibility.",
        theory: [
          "Latency tracking",
          "Token usage metrics",
          "Failure logging",
          "User feedback loops",
        ],
        practice: [
          "Define backend metrics",
        ],
      },
      {
        day: 24,
        title: "Scaling GenAI APIs",
        takeaway:
          "Scaling involves queues, not just servers.",
        theory: [
          "Concurrency handling",
          "Rate limiting",
          "Queue-based processing",
          "Backpressure",
        ],
        practice: [
          "Design scalable API architecture",
        ],
      },
      {
        day: 25,
        title: "Fallbacks & Reliability",
        takeaway:
          "Failure is expected, not exceptional.",
        theory: [
          "Retry strategies",
          "Graceful degradation",
          "Rule-based fallbacks",
          "UX impact",
        ],
        practice: [
          "Design fallback logic",
        ],
      },
      {
        day: 26,
        title: "Fine-Tuning vs RAG (Backend Decision)",
        takeaway:
          "Most backend systems don’t need fine-tuning.",
        theory: [
          "Fine-tuning costs",
          "Maintenance burden",
          "RAG alternatives",
          "Hybrid approaches",
        ],
        practice: [
          "Choose approach for backend scenarios",
        ],
      },
      {
        day: 27,
        title: "Ethics & Compliance",
        takeaway:
          "Backend developers own AI safety.",
        theory: [
          "Data privacy",
          "Audit trails",
          "Compliance concerns",
          "Human oversight",
        ],
        practice: [
          "Identify compliance risks",
        ],
      },
      {
        day: 28,
        title: "GenAI Product Engineering",
        takeaway:
          "Engineering decisions shape product trust.",
        theory: [
          "User intent modeling",
          "Cost-benefit analysis",
          "Reliability vs creativity",
          "Trust signals",
        ],
        practice: [
          "Define GenAI backend product idea",
        ],
      },
      {
        day: 29,
        title: "GenAI Backend Interview Prep",
        takeaway:
          "Clear system thinking beats buzzwords.",
        theory: [
          "Explain RAG backend",
          "Agent architecture discussion",
          "Scaling tradeoffs",
          "Security questions",
        ],
        practice: [
          "Explain GenAI backend system",
        ],
      },
      {
        day: 30,
        title: "Final Backend Project",
        takeaway:
          "End-to-end design proves mastery.",
        theory: [
          "System architecture",
          "Component boundaries",
          "Evaluation strategy",
          "Production checklist",
        ],
        practice: [
          "Design GenAI-powered Node.js backend",
          "Document full system",
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
