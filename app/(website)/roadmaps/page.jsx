"use client";

import Link from "next/link";
import {
  Code,
  Server,
  Cpu,
  Database,
  Globe,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

const PLANS = [
  {
    title: "Node.js + Express",
    slug: "node-express",
    icon: Server,
    level: "Beginner → Intermediate",
    duration: "30 Days",
    description:
      "Build production-ready REST APIs using Node.js and Express with authentication, databases, and scaling concepts.",
    highlights: [
      "Node.js internals",
      "Express REST APIs",
      "JWT authentication",
      "Database integration",
    ],
  },
  {
    title: "WebSockets & Real-Time Systems",
    slug: "websockets",
    icon: Cpu,
    level: "Intermediate",
    duration: "30 Days",
    description:
      "Master real-time communication, WebSockets, scaling strategies, and system design for live applications.",
    highlights: [
      "WebSocket protocol",
      "Real-time architecture",
      "Scaling with Redis",
      "System design thinking",
    ],
  },
  {
    title: "Python (Beginner → Advanced)",
    slug: "python",
    icon: Database,
    level: "Beginner → Advanced",
    duration: "30 Days",
    description:
      "Learn core Python from basics to advanced concepts including OOP, async programming, and internals.",
    highlights: [
      "Python fundamentals",
      "OOP & internals",
      "Async programming",
      "Performance concepts",
    ],
  },
  {
    title: "DSA Using Python",
    slug: "dsa-using-python",
    icon: Code,
    level: "Beginner → Advanced",
    duration: "30 Days",
    description:
      "Master data structures and algorithms using Python with problem-solving and interview preparation.",
    highlights: [
      "Arrays & strings",
      "Trees & graphs",
      "Dynamic programming",
      "Interview patterns",
    ],
  },
  {
    title: "GenAI for Beginners",
    slug: "gen-ai",
    icon: GraduationCap,
    level: "Beginner",
    duration: "30 Days",
    description:
      "Understand Generative AI fundamentals, prompting, embeddings, RAG, and responsible AI usage.",
    highlights: [
      "LLM fundamentals",
      "Prompt engineering",
      "Embeddings & RAG",
      "Ethics & limitations",
    ],
  },
  {
    title: "GenAI for Developers",
    slug: "dev-gen-ai",
    icon: Cpu,
    level: "Intermediate",
    duration: "30 Days",
    description:
      "Developer-focused GenAI roadmap covering APIs, RAG, agents, evaluation, and production systems.",
    highlights: [
      "LLM APIs",
      "RAG systems",
      "Agent workflows",
      "Production readiness",
    ],
  },
  {
    title: "GenAI + Backend (Node.js)",
    slug: "genai-with-nodejs",
    icon: Server,
    level: "Intermediate → Advanced",
    duration: "30 Days",
    description:
      "Build GenAI-powered backend systems using Node.js with RAG, agents, scaling, and reliability patterns.",
    highlights: [
      "Node.js + LLM APIs",
      "RAG backend design",
      "Agent-based workflows",
      "Scaling & observability",
    ],
  },
];


export default function ThirtyDaysHome() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-8 h-8 text-cyan-500" />
            <h1 className="text-4xl font-bold">
              30-Day Learning Programs
            </h1>
          </div>
          <p className="text-slate-400 max-w-3xl">
            Structured, theory-first 30-day learning paths designed to build
            real-world backend and system design skills.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <Link
              key={plan.slug}
              href={`/roadmaps/${plan.slug}`}
              className="group"
            >
              <div className="h-full bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-600 hover:shadow-xl transition">
                {/* Icon */}
                <plan.icon className="w-8 h-8 text-cyan-500 mb-4" />

                {/* Title */}
                <h2 className="text-xl font-semibold mb-2">
                  {plan.title}
                </h2>

                {/* Meta */}
                <div className="flex gap-4 text-sm text-slate-400 mb-4">
                  <span>{plan.duration}</span>
                  <span>{plan.level}</span>
                </div>

                {/* Description */}
                <p className="text-slate-300 mb-6">
                  {plan.description}
                </p>

                {/* Highlights */}
                <ul className="space-y-1 text-sm text-slate-400 mb-6">
                  {plan.highlights.map((h, i) => (
                    <li key={i}>• {h}</li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center gap-2 text-cyan-400 group-hover:text-cyan-300">
                  View 30-Day Plan
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
