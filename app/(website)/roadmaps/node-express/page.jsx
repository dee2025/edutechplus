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
    title: "Week 1 — Node.js Fundamentals",
    goal:
      "Build strong fundamentals of Node.js, understand how it works internally, and learn core APIs.",
    days: [
      {
        day: 1,
        title: "What is Node.js & Why It Exists",
        takeaway:
          "Node.js enables JavaScript to run on the server with non-blocking I/O.",
        theory: [
          "History of Node.js",
          "V8 JavaScript engine",
          "Why Node.js was created",
          "Common use cases",
        ],
        practice: [
          "Install Node.js",
          "Run first Node script",
          "Print system info",
        ],
      },
      {
        day: 2,
        title: "Node.js Runtime & Architecture",
        takeaway:
          "Node.js is single-threaded but highly concurrent.",
        theory: [
          "Single-threaded model",
          "Event-driven architecture",
          "Concurrency vs parallelism",
          "Node process lifecycle",
        ],
        practice: [
          "Create long-running script",
          "Log execution order",
        ],
      },
      {
        day: 3,
        title: "Event Loop Deep Dive",
        takeaway:
          "The event loop decides execution order in Node.js.",
        theory: [
          "Call stack",
          "Callback queue",
          "Microtasks vs macrotasks",
          "Event loop phases",
        ],
        practice: [
          "Use setTimeout, setImmediate, Promise",
          "Observe execution order",
        ],
      },
      {
        day: 4,
        title: "Modules System",
        takeaway:
          "Modules help structure and reuse Node.js code.",
        theory: [
          "CommonJS modules",
          "require vs module.exports",
          "Caching behavior",
          "Module resolution",
        ],
        practice: [
          "Create custom modules",
          "Share functions across files",
        ],
      },
      {
        day: 5,
        title: "Built-in Core Modules",
        takeaway:
          "Node provides powerful built-in modules out of the box.",
        theory: [
          "fs module",
          "path module",
          "os module",
          "process object",
        ],
        practice: [
          "Read & write files",
          "Log OS details",
        ],
      },
      {
        day: 6,
        title: "Async Programming in Node.js",
        takeaway:
          "Async patterns prevent blocking the event loop.",
        theory: [
          "Callbacks",
          "Promises",
          "async/await",
          "Error handling patterns",
        ],
        practice: [
          "Convert callback to promise",
          "Handle async errors",
        ],
      },
      {
        day: 7,
        title: "Week 1 Review & Internals",
        takeaway:
          "Understanding internals makes debugging easier.",
        theory: [
          "Event loop recap",
          "Async execution flow",
          "Module system review",
          "Common misconceptions",
        ],
        practice: [
          "Explain Node internals verbally",
          "Draw event loop diagram",
        ],
      },
    ],
  },

  {
    title: "Week 2 — Express.js & REST APIs",
    goal:
      "Learn Express.js fundamentals and build structured REST APIs.",
    days: [
      {
        day: 8,
        title: "Introduction to Express.js",
        takeaway:
          "Express simplifies HTTP server development.",
        theory: [
          "What Express is",
          "Why Express exists",
          "Middleware concept",
          "Request-response cycle",
        ],
        practice: [
          "Create Express server",
          "Handle basic routes",
        ],
      },
      {
        day: 9,
        title: "Routing in Express",
        takeaway:
          "Routes define how your API responds to requests.",
        theory: [
          "HTTP methods",
          "Route parameters",
          "Query parameters",
          "Route organization",
        ],
        practice: [
          "Create CRUD routes",
          "Test routes using Postman",
        ],
      },
      {
        day: 10,
        title: "Middleware Deep Dive",
        takeaway:
          "Middleware controls request flow in Express.",
        theory: [
          "Global middleware",
          "Route-level middleware",
          "Error middleware",
          "Execution order",
        ],
        practice: [
          "Create logging middleware",
          "Add auth middleware",
        ],
      },
      {
        day: 11,
        title: "Request & Response Objects",
        takeaway:
          "req and res objects expose full HTTP control.",
        theory: [
          "req.body, req.params, req.query",
          "res.status & res.json",
          "Headers handling",
          "Sending responses",
        ],
        practice: [
          "Parse request data",
          "Send structured responses",
        ],
      },
      {
        day: 12,
        title: "REST API Design Principles",
        takeaway:
          "Good API design improves maintainability.",
        theory: [
          "REST constraints",
          "Status codes",
          "Resource naming",
          "Versioning APIs",
        ],
        practice: [
          "Design REST endpoints on paper",
          "Refactor routes",
        ],
      },
      {
        day: 13,
        title: "Error Handling & Validation",
        takeaway:
          "Errors must be predictable and consistent.",
        theory: [
          "Centralized error handling",
          "Validation strategies",
          "Client vs server errors",
          "HTTP error codes",
        ],
        practice: [
          "Add validation middleware",
          "Handle API errors",
        ],
      },
      {
        day: 14,
        title: "Week 2 Refactor",
        takeaway:
          "Structure prevents technical debt.",
        theory: [
          "Controller-service pattern",
          "Folder organization",
          "Separation of concerns",
          "Code readability",
        ],
        practice: [
          "Refactor Express project",
          "Improve folder structure",
        ],
      },
    ],
  },

  {
    title: "Week 3 — Databases, Auth & Security",
    goal:
      "Integrate databases, authentication, and secure your APIs.",
    days: [
      {
        day: 15,
        title: "Database Integration",
        takeaway:
          "Persistence enables real-world applications.",
        theory: [
          "SQL vs NoSQL",
          "ORM vs query builders",
          "Connection pooling",
          "Schema design",
        ],
        practice: [
          "Connect DB to Express",
          "Create sample table",
        ],
      },
      {
        day: 16,
        title: "CRUD Operations",
        takeaway:
          "CRUD is the foundation of backend systems.",
        theory: [
          "Create, Read, Update, Delete",
          "Database transactions",
          "Error scenarios",
          "Data consistency",
        ],
        practice: [
          "Build CRUD APIs",
          "Test edge cases",
        ],
      },
      {
        day: 17,
        title: "Authentication Basics",
        takeaway:
          "Authentication verifies identity.",
        theory: [
          "Sessions vs JWT",
          "Password hashing",
          "Token lifecycle",
          "Security risks",
        ],
        practice: [
          "Implement JWT auth",
          "Protect routes",
        ],
      },
      {
        day: 18,
        title: "Authorization & Roles",
        takeaway:
          "Authorization controls access.",
        theory: [
          "Role-based access",
          "Permission models",
          "Middleware authorization",
          "Least privilege principle",
        ],
        practice: [
          "Add role checks",
          "Restrict API access",
        ],
      },
      {
        day: 19,
        title: "Security Best Practices",
        takeaway:
          "Security must be proactive, not reactive.",
        theory: [
          "SQL injection",
          "XSS & CSRF",
          "Rate limiting",
          "Helmet & CORS",
        ],
        practice: [
          "Add security middleware",
          "Test attack scenarios",
        ],
      },
      {
        day: 20,
        title: "File Uploads & Background Tasks",
        takeaway:
          "Not all tasks should block requests.",
        theory: [
          "File upload handling",
          "Streams",
          "Background jobs",
          "Queue basics",
        ],
        practice: [
          "Upload files",
          "Process asynchronously",
        ],
      },
      {
        day: 21,
        title: "Week 3 Review",
        takeaway:
          "Security + persistence = production readiness.",
        theory: [
          "Auth & DB recap",
          "Security review",
          "Failure scenarios",
          "Best practices",
        ],
        practice: [
          "Audit your API",
          "Fix vulnerabilities",
        ],
      },
    ],
  },

  {
    title: "Week 4 — Scaling, Performance & Production",
    goal:
      "Prepare Node.js applications for production and scalability.",
    days: [
      {
        day: 22,
        title: "Performance & Optimization",
        takeaway:
          "Performance issues compound at scale.",
        theory: [
          "Blocking operations",
          "Memory leaks",
          "CPU-intensive tasks",
          "Profiling basics",
        ],
        practice: [
          "Optimize slow endpoints",
          "Profile application",
        ],
      },
      {
        day: 23,
        title: "Clustering & Scaling",
        takeaway:
          "Scaling Node requires multiple processes.",
        theory: [
          "Cluster module",
          "Horizontal scaling",
          "Load distribution",
          "Stateless services",
        ],
        practice: [
          "Run Node in cluster mode",
          "Observe CPU usage",
        ],
      },
      {
        day: 24,
        title: "Caching Strategies",
        takeaway:
          "Caching reduces load and improves speed.",
        theory: [
          "In-memory caching",
          "Redis basics",
          "Cache invalidation",
          "TTL strategies",
        ],
        practice: [
          "Cache API responses",
          "Measure performance gain",
        ],
      },
      {
        day: 25,
        title: "Logging & Monitoring",
        takeaway:
          "Observability is critical in production.",
        theory: [
          "Structured logging",
          "Metrics vs logs",
          "Error tracking",
          "Monitoring tools",
        ],
        practice: [
          "Add request logging",
          "Track errors",
        ],
      },
      {
        day: 26,
        title: "Environment & Config Management",
        takeaway:
          "Configuration must be environment-safe.",
        theory: [
          "Environment variables",
          "Secrets management",
          "Config validation",
          "Deployment risks",
        ],
        practice: [
          "Setup env configs",
          "Separate prod & dev",
        ],
      },
      {
        day: 27,
        title: "Testing APIs",
        takeaway:
          "Untested APIs break silently.",
        theory: [
          "Unit vs integration tests",
          "Testing tools",
          "Mocking",
          "Test coverage",
        ],
        practice: [
          "Write API tests",
          "Test failure cases",
        ],
      },
      {
        day: 28,
        title: "Deployment Basics",
        takeaway:
          "Deployment is part of development.",
        theory: [
          "Production builds",
          "Process managers",
          "CI/CD basics",
          "Rollback strategies",
        ],
        practice: [
          "Deploy Node app",
          "Run with PM2",
        ],
      },
      {
        day: 29,
        title: "System Design with Node.js",
        takeaway:
          "Design decisions define scalability.",
        theory: [
          "Monolith vs microservices",
          "API gateway",
          "Scalability tradeoffs",
          "Failure handling",
        ],
        practice: [
          "Design backend architecture",
        ],
      },
      {
        day: 30,
        title: "Final Project",
        takeaway:
          "Building end-to-end solidifies learning.",
        theory: [
          "Project planning",
          "Scope definition",
          "Best practices",
          "Evaluation criteria",
        ],
        practice: [
          "Build REST API project",
          "Apply all concepts",
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
