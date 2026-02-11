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
    title: "Week 1 — Core Concepts & Client Side",
    goal:
      "Build deep mental models for real-time communication and understand how WebSockets work in the browser.",
    days: [
      {
        day: 1,
        title: "Why WebSockets Exist",
        takeaway:
          "WebSockets solve the inefficiency of HTTP for real-time, bidirectional communication.",
        theory: [
          "Limitations of HTTP request/response",
          "Why polling wastes bandwidth",
          "Long polling tradeoffs",
          "Real-time application requirements",
        ],
        practice: [
          "Create REST endpoint returning timestamp",
          "Call it every 5 seconds from browser",
          "Log latency & response times",
          "Identify inefficiencies",
        ],
      },
      {
        day: 2,
        title: "How WebSockets Work Internally",
        takeaway:
          "WebSockets begin as HTTP and upgrade to a persistent TCP connection.",
        theory: [
          "TCP vs HTTP fundamentals",
          "WebSocket handshake lifecycle",
          "Upgrade & Connection headers",
          "Persistent connection model",
        ],
        practice: [
          "Inspect handshake in DevTools",
          "Identify request & response headers",
          "Trace protocol upgrade",
          "Document the flow",
        ],
      },
      {
        day: 3,
        title: "WebSocket Lifecycle",
        takeaway:
          "Understanding lifecycle events is critical for stability and cleanup.",
        theory: [
          "Connection states",
          "Open, message, close, error events",
          "Normal vs abnormal closures",
          "Why lifecycle handling matters",
        ],
        practice: [
          "Open a WebSocket connection",
          "Manually close it",
          "Log lifecycle events",
          "Observe event order",
        ],
      },
      {
        day: 4,
        title: "WebSockets vs REST",
        takeaway:
          "WebSockets and REST serve different purposes and often work best together.",
        theory: [
          "Strengths of REST APIs",
          "Strengths of WebSockets",
          "When NOT to use WebSockets",
          "Hybrid architecture patterns",
        ],
        practice: [
          "Design REST for history fetching",
          "Design WebSockets for live updates",
          "Draw request vs event flow",
        ],
      },
      {
        day: 5,
        title: "Browser WebSocket API",
        takeaway:
          "Browser WebSockets are event-driven and require careful state handling.",
        theory: [
          "WebSocket constructor & properties",
          "Event-driven programming model",
          "Single connection per tab concept",
          "Browser limitations",
        ],
        practice: [
          "Create browser WebSocket client",
          "Send a message",
          "Receive server response",
          "Log messages",
        ],
      },
      {
        day: 6,
        title: "Message Protocol Design",
        takeaway:
          "A structured message protocol prevents chaos as systems grow.",
        theory: [
          "Problems with raw string messages",
          "Message type + payload structure",
          "Versioning strategies",
          "Extensibility concerns",
        ],
        practice: [
          "Design JOIN message format",
          "Design MESSAGE payload",
          "Design TYPING event",
          "Document schema",
        ],
      },
      {
        day: 7,
        title: "Review & Mental Models",
        takeaway:
          "Strong mental models matter more than memorized APIs.",
        theory: [
          "Re-explain Week 1 concepts",
          "Review lifecycle & protocol flow",
          "Identify unclear areas",
          "Solidify terminology",
        ],
        practice: [
          "Draw full WebSocket lifecycle",
          "Draw message flow diagram",
        ],
      },
    ],
  },

  {
    title: "Week 2 — Server-Side WebSockets (Node.js)",
    goal:
      "Learn how to manage WebSocket connections, users, and messaging on the server.",
    days: [
      {
        day: 8,
        title: "WebSocket Server Basics",
        takeaway:
          "A WebSocket server manages long-lived, stateful connections.",
        theory: [
          "Persistent connections",
          "Memory usage per socket",
          "Event loop impact",
          "Connection scalability basics",
        ],
        practice: [
          "Create Node.js WebSocket server",
          "Accept client connections",
          "Log total active connections",
        ],
      },
      {
        day: 9,
        title: "Managing Connections",
        takeaway:
          "Every WebSocket server needs explicit connection tracking.",
        theory: [
          "Socket registry concept",
          "Why tracking is required",
          "Memory leaks risk",
          "Cleanup strategies",
        ],
        practice: [
          "Store sockets in Map",
          "Add socket on connect",
          "Remove socket on disconnect",
        ],
      },
      {
        day: 10,
        title: "User Identification",
        takeaway:
          "Authentication and identity binding are different responsibilities.",
        theory: [
          "Anonymous vs identified sockets",
          "Binding userId to socket",
          "Auth vs identity",
          "Trust boundaries",
        ],
        practice: [
          "Send userId as first message",
          "Attach userId to socket",
        ],
      },
      {
        day: 11,
        title: "One-to-One Messaging",
        takeaway:
          "Unicast messaging requires precise socket targeting.",
        theory: [
          "Unicast vs broadcast",
          "Socket lookup strategies",
          "Offline user scenarios",
          "Error handling",
        ],
        practice: [
          "Send message to specific user",
          "Handle offline recipient",
        ],
      },
      {
        day: 12,
        title: "Rooms & Group Messaging",
        takeaway:
          "Rooms abstract complexity for group communication.",
        theory: [
          "Room / channel concept",
          "Use cases for rooms",
          "Membership tracking",
          "Broadcast patterns",
        ],
        practice: [
          "Implement room joining",
          "Broadcast to room members",
        ],
      },
      {
        day: 13,
        title: "Connection Failures",
        takeaway:
          "Failures are normal; cleanup is mandatory.",
        theory: [
          "Unexpected disconnects",
          "Network instability",
          "Heartbeat concepts",
          "Detecting dead sockets",
        ],
        practice: [
          "Simulate abrupt client close",
          "Clean socket registry",
        ],
      },
      {
        day: 14,
        title: "Weekly Refactor",
        takeaway:
          "Clean architecture prevents exponential complexity.",
        theory: [
          "Separation of concerns",
          "Readable socket logic",
          "Logging importance",
          "Maintainability mindset",
        ],
        practice: [
          "Refactor folder structure",
          "Add meaningful logs",
        ],
      },
    ],
  },

  {
    title: "Week 3 — Security, State & Real-World Logic",
    goal:
      "Make your WebSocket system secure, reliable, and production-ready.",
    days: [
      {
        day: 15,
        title: "Authentication",
        takeaway:
          "Authentication must happen before trust is established.",
        theory: [
          "JWT usage in WebSockets",
          "Auth timing strategies",
          "Token validation risks",
          "Connection rejection patterns",
        ],
        practice: [
          "Validate JWT on connection",
          "Reject unauthenticated users",
        ],
      },
      {
        day: 16,
        title: "Security Risks",
        takeaway:
          "WebSockets bypass many HTTP security assumptions.",
        theory: [
          "Message spoofing",
          "Flood attacks",
          "Why CORS doesn’t protect WS",
          "Rate limiting importance",
        ],
        practice: [
          "Implement message rate limiting",
        ],
      },
      {
        day: 17,
        title: "Message Reliability",
        takeaway:
          "Delivery guarantees require explicit acknowledgment.",
        theory: [
          "Message delivery vs receipt",
          "ACK systems",
          "Idempotency",
          "Failure scenarios",
        ],
        practice: [
          "Add message IDs",
          "Send ACK from server",
        ],
      },
      {
        day: 18,
        title: "Presence System",
        takeaway:
          "Presence is state, not a single event.",
        theory: [
          "Online/offline logic",
          "Multi-device presence",
          "Last-seen strategies",
          "Edge cases",
        ],
        practice: [
          "Track user presence",
          "Broadcast join/leave events",
        ],
      },
      {
        day: 19,
        title: "WebSockets + Database",
        takeaway:
          "Persistence introduces synchronization challenges.",
        theory: [
          "Message persistence strategies",
          "Reconnection sync",
          "Ordering guarantees",
          "Consistency tradeoffs",
        ],
        practice: [
          "Save messages to DB",
          "Fetch history on reconnect",
        ],
      },
      {
        day: 20,
        title: "Event-Driven Architecture",
        takeaway:
          "Events decouple logic and improve scalability.",
        theory: [
          "Events vs direct calls",
          "Decoupling benefits",
          "Domain events",
          "Scalable patterns",
        ],
        practice: [
          "Refactor socket logic into events",
        ],
      },
      {
        day: 21,
        title: "Stress Testing",
        takeaway:
          "Systems fail in unexpected ways under load.",
        theory: [
          "Failure scenarios",
          "Load behavior",
          "Edge cases",
          "Observability basics",
        ],
        practice: [
          "Break the app intentionally",
          "Fix discovered issues",
        ],
      },
    ],
  },

  {
    title: "Week 4 — Scaling & Production Thinking",
    goal:
      "Learn how real-time systems scale and operate in production.",
    days: [
      {
        day: 22,
        title: "Scaling Problems",
        takeaway:
          "WebSockets don’t scale linearly without shared state.",
        theory: [
          "Multi-server limitations",
          "State isolation",
          "Horizontal scaling challenges",
          "Failure domains",
        ],
        practice: [
          "Run two WS servers",
          "Observe isolation problems",
        ],
      },
      {
        day: 23,
        title: "Pub/Sub with Redis",
        takeaway:
          "Pub/Sub enables horizontal message propagation.",
        theory: [
          "Pub/Sub pattern",
          "Redis basics",
          "Cross-server communication",
          "Tradeoffs",
        ],
        practice: [
          "Publish message via Redis",
          "Receive on multiple servers",
        ],
      },
      {
        day: 24,
        title: "Load Balancing",
        takeaway:
          "WebSockets require special load-balancing strategies.",
        theory: [
          "Sticky sessions",
          "Reverse proxies",
          "Nginx WebSocket support",
          "Failure recovery",
        ],
        practice: [
          "Configure WebSocket proxy",
          "Test reconnect behavior",
        ],
      },
      {
        day: 25,
        title: "Reconnection Strategy",
        takeaway:
          "Reconnection must avoid duplication and data loss.",
        theory: [
          "Session recovery",
          "Duplicate message prevention",
          "Client-side retry logic",
          "State restoration",
        ],
        practice: [
          "Implement auto-reconnect",
          "Restore session state",
        ],
      },
      {
        day: 26,
        title: "Monitoring",
        takeaway:
          "You can’t debug what you can’t see.",
        theory: [
          "Important WebSocket metrics",
          "Active connections",
          "Throughput measurement",
          "Alerting basics",
        ],
        practice: [
          "Track active sockets",
          "Log messages per second",
        ],
      },
      {
        day: 27,
        title: "Alternatives to WebSockets",
        takeaway:
          "WebSockets are powerful but not always the best tool.",
        theory: [
          "Server-Sent Events",
          "Background jobs",
          "Push notifications",
          "Comparison tradeoffs",
        ],
        practice: [
          "Implement basic SSE",
          "Compare with WebSockets",
        ],
      },
      {
        day: 28,
        title: "System Design",
        takeaway:
          "System design clarifies complexity before code.",
        theory: [
          "End-to-end architecture",
          "Data flow",
          "Failure handling",
          "Scaling considerations",
        ],
        practice: [
          "Design chat system",
          "Design notification system",
        ],
      },
      {
        day: 29,
        title: "Interview Readiness",
        takeaway:
          "Clear explanations beat clever implementations.",
        theory: [
          "Common WebSocket interview questions",
          "Scaling scenarios",
          "Tradeoff explanations",
          "Failure discussion",
        ],
        practice: [
          "Explain scaling to 1M users",
        ],
      },
      {
        day: 30,
        title: "Final Project Selection",
        takeaway:
          "Focused scope leads to finished systems.",
        theory: [
          "Project planning",
          "Scope control",
          "MVP mindset",
          "Evaluation criteria",
        ],
        practice: [
          "Choose chat backend OR",
          "Live dashboard OR",
          "Notification service",
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
