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
    title: "Week 1 — Programming Basics & Complexity",
    goal:
      "Build problem-solving fundamentals and understand how to analyze code efficiency.",
    days: [
      {
        day: 1,
        title: "What is DSA & Problem Solving",
        takeaway:
          "DSA helps you write efficient and scalable solutions.",
        theory: [
          "What is Data Structures & Algorithms",
          "Why DSA matters",
          "Types of problems",
          "Approach to problem solving",
        ],
        practice: [
          "Solve simple input/output problems",
          "Trace solutions step by step",
        ],
      },
      {
        day: 2,
        title: "Time & Space Complexity",
        takeaway:
          "Efficiency matters more than correctness alone.",
        theory: [
          "Big-O notation",
          "Best, average, worst cases",
          "Time vs space tradeoff",
          "Common complexity classes",
        ],
        practice: [
          "Find time complexity of snippets",
          "Compare two solutions",
        ],
      },
      {
        day: 3,
        title: "Basic Mathematics",
        takeaway:
          "Math simplifies many algorithmic problems.",
        theory: [
          "Digits & numbers",
          "Prime numbers",
          "GCD & LCM",
          "Modulo arithmetic",
        ],
        practice: [
          "Check prime numbers",
          "Compute GCD using Euclid’s algorithm",
        ],
      },
      {
        day: 4,
        title: "Recursion Basics",
        takeaway:
          "Recursion breaks problems into smaller subproblems.",
        theory: [
          "Recursive thinking",
          "Base & recursive cases",
          "Call stack",
          "Recursion vs iteration",
        ],
        practice: [
          "Factorial & Fibonacci",
          "Print numbers recursively",
        ],
      },
      {
        day: 5,
        title: "Arrays Basics",
        takeaway:
          "Arrays store data in contiguous memory.",
        theory: [
          "Array fundamentals",
          "Indexing & traversal",
          "In-place operations",
          "Common pitfalls",
        ],
        practice: [
          "Reverse an array",
          "Find max & min",
        ],
      },
      {
        day: 6,
        title: "Array Problems",
        takeaway:
          "Most interview problems start with arrays.",
        theory: [
          "Prefix sum",
          "Sliding window",
          "Two pointers",
          "Brute force vs optimized",
        ],
        practice: [
          "Subarray sum problem",
          "Two-sum problem",
        ],
      },
      {
        day: 7,
        title: "Week 1 Review",
        takeaway:
          "Strong basics improve speed and accuracy.",
        theory: [
          "Complexity recap",
          "Recursion review",
          "Array techniques",
          "Common mistakes",
        ],
        practice: [
          "Solve 5 mixed problems",
        ],
      },
    ],
  },

  {
    title: "Week 2 — Searching, Sorting & Hashing",
    goal:
      "Learn core searching, sorting, and hashing techniques.",
    days: [
      {
        day: 8,
        title: "Linear & Binary Search",
        takeaway:
          "Binary search reduces time drastically.",
        theory: [
          "Linear search",
          "Binary search logic",
          "Iterative vs recursive",
          "Search space reduction",
        ],
        practice: [
          "Implement binary search",
          "Search in sorted array",
        ],
      },
      {
        day: 9,
        title: "Sorting Basics",
        takeaway:
          "Sorting enables faster searching and grouping.",
        theory: [
          "Bubble sort",
          "Selection sort",
          "Insertion sort",
          "Stability & complexity",
        ],
        practice: [
          "Implement basic sorting algorithms",
        ],
      },
      {
        day: 10,
        title: "Efficient Sorting Algorithms",
        takeaway:
          "Divide-and-conquer improves performance.",
        theory: [
          "Merge sort",
          "Quick sort",
          "Partition logic",
          "Time-space tradeoffs",
        ],
        practice: [
          "Implement merge sort",
          "Trace quick sort",
        ],
      },
      {
        day: 11,
        title: "Hashing Basics",
        takeaway:
          "Hashing provides O(1) average access.",
        theory: [
          "Hash tables",
          "Collision handling",
          "Python dict internals",
          "Use cases",
        ],
        practice: [
          "Frequency counting",
          "Find duplicates",
        ],
      },
      {
        day: 12,
        title: "Hashing Problems",
        takeaway:
          "Hashing simplifies many array & string problems.",
        theory: [
          "Prefix hash",
          "Hash-based lookup",
          "Set operations",
          "Tradeoffs",
        ],
        practice: [
          "Two-sum using hash",
          "Longest subarray with sum K",
        ],
      },
      {
        day: 13,
        title: "Strings Basics",
        takeaway:
          "Strings are arrays with constraints.",
        theory: [
          "String traversal",
          "Character frequency",
          "Immutability",
          "Common patterns",
        ],
        practice: [
          "Reverse string",
          "Check palindrome",
        ],
      },
      {
        day: 14,
        title: "Week 2 Review",
        takeaway:
          "Searching & sorting are foundational skills.",
        theory: [
          "Binary search recap",
          "Sorting comparisons",
          "Hashing patterns",
          "Problem patterns",
        ],
        practice: [
          "Solve mixed problems",
        ],
      },
    ],
  },

  {
    title: "Week 3 — Stacks, Queues & Linked Lists",
    goal:
      "Understand linear data structures and their applications.",
    days: [
      {
        day: 15,
        title: "Stack Data Structure",
        takeaway:
          "Stacks follow LIFO order.",
        theory: [
          "Stack operations",
          "Implementation using list",
          "Use cases",
          "Time complexity",
        ],
        practice: [
          "Implement stack",
          "Valid parentheses problem",
        ],
      },
      {
        day: 16,
        title: "Queue & Deque",
        takeaway:
          "Queues follow FIFO order.",
        theory: [
          "Queue operations",
          "Deque concept",
          "Circular queue",
          "Applications",
        ],
        practice: [
          "Implement queue",
          "Sliding window maximum",
        ],
      },
      {
        day: 17,
        title: "Linked List Basics",
        takeaway:
          "Linked lists allow dynamic memory usage.",
        theory: [
          "Singly linked list",
          "Node structure",
          "Traversal",
          "Insertion & deletion",
        ],
        practice: [
          "Create linked list",
          "Insert & delete nodes",
        ],
      },
      {
        day: 18,
        title: "Linked List Problems",
        takeaway:
          "Pointer manipulation is key.",
        theory: [
          "Reversal techniques",
          "Fast & slow pointers",
          "Cycle detection",
          "Edge cases",
        ],
        practice: [
          "Reverse linked list",
          "Detect cycle",
        ],
      },
      {
        day: 19,
        title: "Stack & Queue Problems",
        takeaway:
          "Stacks and queues solve order-based problems.",
        theory: [
          "Monotonic stack",
          "Next greater element",
          "Queue simulations",
          "Real-world mapping",
        ],
        practice: [
          "Next greater element",
          "Implement min stack",
        ],
      },
      {
        day: 20,
        title: "Recursion vs Stack",
        takeaway:
          "Recursion internally uses stack.",
        theory: [
          "Recursion stack",
          "Tail recursion",
          "Memory considerations",
          "Optimization ideas",
        ],
        practice: [
          "Convert recursion to iteration",
        ],
      },
      {
        day: 21,
        title: "Week 3 Review",
        takeaway:
          "Linear structures are building blocks.",
        theory: [
          "Stack & queue recap",
          "Linked list review",
          "Common patterns",
          "Mistakes",
        ],
        practice: [
          "Solve mixed DS problems",
        ],
      },
    ],
  },

  {
    title: "Week 4 — Trees, Graphs & Dynamic Programming",
    goal:
      "Learn advanced data structures and algorithmic thinking.",
    days: [
      {
        day: 22,
        title: "Binary Trees Basics",
        takeaway:
          "Trees represent hierarchical data.",
        theory: [
          "Tree terminology",
          "Binary tree structure",
          "Tree traversal",
          "Recursion usage",
        ],
        practice: [
          "Implement tree",
          "Inorder traversal",
        ],
      },
      {
        day: 23,
        title: "Binary Search Trees",
        takeaway:
          "BST provides ordered data access.",
        theory: [
          "BST properties",
          "Insert & search",
          "Traversal",
          "Time complexity",
        ],
        practice: [
          "Insert into BST",
          "Search elements",
        ],
      },
      {
        day: 24,
        title: "Graphs Basics",
        takeaway:
          "Graphs model real-world relationships.",
        theory: [
          "Graph representation",
          "Adjacency list",
          "BFS & DFS",
          "Use cases",
        ],
        practice: [
          "Implement BFS",
          "Implement DFS",
        ],
      },
      {
        day: 25,
        title: "Graph Problems",
        takeaway:
          "Traversal solves many graph problems.",
        theory: [
          "Connected components",
          "Cycle detection",
          "Shortest path idea",
          "Visited tracking",
        ],
        practice: [
          "Detect cycle",
          "Count connected components",
        ],
      },
      {
        day: 26,
        title: "Dynamic Programming Basics",
        takeaway:
          "DP avoids repeated computation.",
        theory: [
          "Overlapping subproblems",
          "Optimal substructure",
          "Memoization",
          "Tabulation",
        ],
        practice: [
          "Fibonacci using DP",
          "Climbing stairs problem",
        ],
      },
      {
        day: 27,
        title: "DP Problems",
        takeaway:
          "DP turns exponential into polynomial time.",
        theory: [
          "1D DP problems",
          "2D DP problems",
          "State definition",
          "Transitions",
        ],
        practice: [
          "Knapsack problem",
          "Longest common subsequence",
        ],
      },
      {
        day: 28,
        title: "Greedy Algorithms",
        takeaway:
          "Greedy works when local choices lead to global optimum.",
        theory: [
          "Greedy strategy",
          "Proof of correctness",
          "Limitations",
          "Common problems",
        ],
        practice: [
          "Activity selection",
          "Coin change (greedy)",
        ],
      },
      {
        day: 29,
        title: "Backtracking",
        takeaway:
          "Backtracking explores all possibilities.",
        theory: [
          "Decision tree",
          "Constraint satisfaction",
          "Pruning",
          "Use cases",
        ],
        practice: [
          "Generate permutations",
          "Solve N-Queens",
        ],
      },
      {
        day: 30,
        title: "Final Review & Interview Prep",
        takeaway:
          "Pattern recognition wins interviews.",
        theory: [
          "Problem patterns recap",
          "Time complexity review",
          "Tradeoff discussion",
          "Interview strategy",
        ],
        practice: [
          "Solve 5 interview-level problems",
          "Explain solutions verbally",
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
