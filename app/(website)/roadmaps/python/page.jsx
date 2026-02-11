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
    title: "Week 1 — Python Fundamentals",
    goal:
      "Build strong foundations in Python syntax, data types, and basic problem-solving.",
    days: [
      {
        day: 1,
        title: "Introduction to Python",
        takeaway:
          "Python is a high-level, interpreted language focused on readability.",
        theory: [
          "What is Python",
          "How Python is used",
          "Interpreted vs compiled",
          "Python execution flow",
        ],
        practice: [
          "Install Python",
          "Run Python in terminal",
          "Print text and numbers",
          "Check Python version",
        ],
      },
      {
        day: 2,
        title: "Variables & Data Types",
        takeaway:
          "Everything in Python is an object with a type.",
        theory: [
          "Variables and assignment",
          "int, float, string, bool",
          "Dynamic typing",
          "Type checking",
        ],
        practice: [
          "Create variables of each type",
          "Check types using type()",
          "Perform basic operations",
        ],
      },
      {
        day: 3,
        title: "Strings & String Operations",
        takeaway:
          "Strings are immutable and powerful in Python.",
        theory: [
          "String creation",
          "Indexing & slicing",
          "String methods",
          "Formatting strings",
        ],
        practice: [
          "Reverse a string",
          "Count characters",
          "Format user messages",
        ],
      },
      {
        day: 4,
        title: "Lists & Tuples",
        takeaway:
          "Lists are mutable; tuples are immutable.",
        theory: [
          "List creation & indexing",
          "Common list methods",
          "Tuples and immutability",
          "Use cases",
        ],
        practice: [
          "Manipulate list values",
          "Sort and reverse lists",
          "Convert list to tuple",
        ],
      },
      {
        day: 5,
        title: "Dictionaries & Sets",
        takeaway:
          "Dictionaries store key-value pairs; sets store unique values.",
        theory: [
          "Dictionary structure",
          "Accessing and updating values",
          "Set properties",
          "Common use cases",
        ],
        practice: [
          "Create user profile dict",
          "Count word frequency",
          "Remove duplicates using set",
        ],
      },
      {
        day: 6,
        title: "Conditional Statements",
        takeaway:
          "Conditionals control program flow.",
        theory: [
          "if / elif / else",
          "Comparison operators",
          "Logical operators",
          "Nested conditions",
        ],
        practice: [
          "Build grade calculator",
          "Check even/odd numbers",
          "Validate input ranges",
        ],
      },
      {
        day: 7,
        title: "Week 1 Review & Practice",
        takeaway:
          "Strong basics make advanced topics easier.",
        theory: [
          "Data types recap",
          "Immutability review",
          "Control flow summary",
          "Common beginner mistakes",
        ],
        practice: [
          "Solve 5 basic Python problems",
          "Explain concepts verbally",
        ],
      },
    ],
  },

  {
    title: "Week 2 — Control Flow & Functions",
    goal:
      "Learn loops, functions, and reusable code patterns.",
    days: [
      {
        day: 8,
        title: "Loops in Python",
        takeaway:
          "Loops automate repetitive tasks.",
        theory: [
          "for loop",
          "while loop",
          "break & continue",
          "Loop else clause",
        ],
        practice: [
          "Print patterns using loops",
          "Sum numbers using loop",
        ],
      },
      {
        day: 9,
        title: "Functions Basics",
        takeaway:
          "Functions make code reusable and readable.",
        theory: [
          "Defining functions",
          "Parameters & arguments",
          "Return values",
          "Function scope",
        ],
        practice: [
          "Create calculator functions",
          "Write reusable utilities",
        ],
      },
      {
        day: 10,
        title: "Function Arguments",
        takeaway:
          "Flexible arguments improve function design.",
        theory: [
          "Default arguments",
          "Keyword arguments",
          "*args and **kwargs",
          "Argument order",
        ],
        practice: [
          "Build flexible functions",
          "Use args & kwargs",
        ],
      },
      {
        day: 11,
        title: "Recursion",
        takeaway:
          "Recursion solves problems by breaking them down.",
        theory: [
          "Recursive thinking",
          "Base case",
          "Call stack",
          "When not to use recursion",
        ],
        practice: [
          "Factorial using recursion",
          "Fibonacci sequence",
        ],
      },
      {
        day: 12,
        title: "Comprehensions",
        takeaway:
          "Comprehensions provide concise syntax.",
        theory: [
          "List comprehensions",
          "Set comprehensions",
          "Dict comprehensions",
          "Readability concerns",
        ],
        practice: [
          "Rewrite loops using comprehensions",
          "Filter lists",
        ],
      },
      {
        day: 13,
        title: "Lambda Functions",
        takeaway:
          "Lambdas are short anonymous functions.",
        theory: [
          "Lambda syntax",
          "Use cases",
          "Limitations",
          "Readability tradeoffs",
        ],
        practice: [
          "Sort lists using lambda",
          "Use lambda with map",
        ],
      },
      {
        day: 14,
        title: "Week 2 Review",
        takeaway:
          "Functions and loops are core building blocks.",
        theory: [
          "Function design review",
          "Loop optimization",
          "Code reuse",
          "Common mistakes",
        ],
        practice: [
          "Solve medium-level problems",
          "Refactor earlier code",
        ],
      },
    ],
  },

  {
    title: "Week 3 — Object-Oriented Python & Errors",
    goal:
      "Understand OOP concepts and error handling in Python.",
    days: [
      {
        day: 15,
        title: "Introduction to OOP",
        takeaway:
          "OOP models real-world entities.",
        theory: [
          "Classes and objects",
          "__init__ method",
          "Instance variables",
          "Methods",
        ],
        practice: [
          "Create simple class",
          "Instantiate objects",
        ],
      },
      {
        day: 16,
        title: "Encapsulation & Abstraction",
        takeaway:
          "Encapsulation protects data.",
        theory: [
          "Public vs private variables",
          "Getters & setters",
          "Abstraction concepts",
          "Design intent",
        ],
        practice: [
          "Restrict attribute access",
          "Refactor class design",
        ],
      },
      {
        day: 17,
        title: "Inheritance & Polymorphism",
        takeaway:
          "Inheritance enables code reuse.",
        theory: [
          "Parent & child classes",
          "Method overriding",
          "Polymorphism",
          "Method resolution order",
        ],
        practice: [
          "Extend base class",
          "Override methods",
        ],
      },
      {
        day: 18,
        title: "Magic Methods",
        takeaway:
          "Dunder methods customize behavior.",
        theory: [
          "__str__ and __repr__",
          "__len__",
          "__eq__",
          "Operator overloading",
        ],
        practice: [
          "Implement custom dunder methods",
        ],
      },
      {
        day: 19,
        title: "Error Handling",
        takeaway:
          "Errors must be handled gracefully.",
        theory: [
          "try / except",
          "finally block",
          "Custom exceptions",
          "Error propagation",
        ],
        practice: [
          "Handle runtime errors",
          "Create custom exception",
        ],
      },
      {
        day: 20,
        title: "Modules & Packages",
        takeaway:
          "Modules organize large codebases.",
        theory: [
          "Import system",
          "__name__ == '__main__'",
          "Creating packages",
          "Module reuse",
        ],
        practice: [
          "Create custom module",
          "Split project into packages",
        ],
      },
      {
        day: 21,
        title: "Week 3 Review",
        takeaway:
          "OOP improves structure and scalability.",
        theory: [
          "OOP concepts recap",
          "Error handling review",
          "Code organization",
          "Best practices",
        ],
        practice: [
          "Refactor code into classes",
        ],
      },
    ],
  },

  {
    title: "Week 4 — Advanced Python & Internals",
    goal:
      "Learn advanced Python concepts, internals, and performance ideas.",
    days: [
      {
        day: 22,
        title: "File Handling",
        takeaway:
          "Files allow persistent data storage.",
        theory: [
          "Reading & writing files",
          "File modes",
          "Context managers",
          "Common pitfalls",
        ],
        practice: [
          "Read text file",
          "Write structured data",
        ],
      },
      {
        day: 23,
        title: "Iterators & Generators",
        takeaway:
          "Generators enable memory-efficient iteration.",
        theory: [
          "Iterator protocol",
          "yield keyword",
          "Generator functions",
          "Use cases",
        ],
        practice: [
          "Create generator",
          "Iterate large dataset",
        ],
      },
      {
        day: 24,
        title: "Decorators",
        takeaway:
          "Decorators modify behavior without changing code.",
        theory: [
          "Functions as objects",
          "Decorator syntax",
          "Use cases",
          "Chaining decorators",
        ],
        practice: [
          "Create timing decorator",
          "Log function calls",
        ],
      },
      {
        day: 25,
        title: "Context Managers",
        takeaway:
          "Context managers manage resources safely.",
        theory: [
          "with statement",
          "__enter__ & __exit__",
          "Custom context managers",
          "Resource cleanup",
        ],
        practice: [
          "Create custom context manager",
        ],
      },
      {
        day: 26,
        title: "Multithreading & Multiprocessing",
        takeaway:
          "Concurrency improves performance for specific workloads.",
        theory: [
          "GIL concept",
          "Threads vs processes",
          "CPU vs I/O bound tasks",
          "When to use each",
        ],
        practice: [
          "Run threaded program",
          "Compare with multiprocessing",
        ],
      },
      {
        day: 27,
        title: "Async Programming in Python",
        takeaway:
          "Async improves I/O performance.",
        theory: [
          "async & await",
          "Event loop",
          "Coroutines",
          "Async vs threading",
        ],
        practice: [
          "Write async functions",
          "Run concurrent tasks",
        ],
      },
      {
        day: 28,
        title: "Python Internals",
        takeaway:
          "Understanding internals improves debugging.",
        theory: [
          "Python memory management",
          "Garbage collection",
          "Reference counting",
          "Execution model",
        ],
        practice: [
          "Inspect memory usage",
        ],
      },
      {
        day: 29,
        title: "Performance Optimization",
        takeaway:
          "Small optimizations can have big impact.",
        theory: [
          "Time complexity",
          "Profiling code",
          "Common bottlenecks",
          "Optimization strategies",
        ],
        practice: [
          "Profile slow code",
          "Optimize logic",
        ],
      },
      {
        day: 30,
        title: "Final Python Project",
        takeaway:
          "Building projects reinforces learning.",
        theory: [
          "Project planning",
          "Code structure",
          "Best practices",
          "Evaluation criteria",
        ],
        practice: [
          "Build CLI-based Python project",
          "Apply all learned concepts",
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
