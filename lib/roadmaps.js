/**
 * Static roadmaps data and helpers.
 * Replace with DB/API calls when ready.
 */

export const ROADMAPS = [
  {
    slug: "frontend-development",
    title: "Frontend Development",
    description:
      "HTML, CSS, JavaScript, frameworks (React/Vue), state management, testing, and build tooling.",
    stepsCount: 12,
    tags: ["HTML", "CSS", "JavaScript", "React"],
    emoji: "🧭",
    steps: [
      {
        id: 1,
        title: "HTML & Semantic Markup",
        description:
          "Learn semantic HTML elements, accessibility basics, and structuring pages for content and SEO.",
        resources: [
          { title: "MDN HTML", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
        ],
      },
      {
        id: 2,
        title: "Modern CSS (Flexbox, Grid)",
        description:
          "Master layout techniques: Flexbox, CSS Grid, responsive design and utility frameworks like Tailwind CSS.",
        resources: [
          { title: "CSS-Tricks Flexbox Guide", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" },
        ],
      },
      {
        id: 3,
        title: "JavaScript Fundamentals",
        description:
          "Understand core concepts: ES6+, asynchronous JS, DOM manipulation, and browser APIs.",
        resources: [
          { title: "You Don't Know JS (book)", url: "https://github.com/getify/You-Dont-Know-JS" },
        ],
      },
    ],
  },
  {
    slug: "backend-development",
    title: "Backend Development",
    description:
      "Server fundamentals, Node.js, databases, REST/GraphQL APIs, authentication, and testing.",
    stepsCount: 10,
    tags: ["Node.js", "Databases", "APIs"],
    emoji: "🗄️",
    steps: [
      {
        id: 1,
        title: "HTTP & Server Basics",
        description: "Understand how the web works: requests, responses, status codes, and headers.",
      },
      {
        id: 2,
        title: "Node.js & Frameworks",
        description: "Build servers with Node.js and frameworks like Express or Fastify.",
      },
      {
        id: 3,
        title: "Databases",
        description: "Learn relational and NoSQL databases, ORMs, and migrations.",
      },
    ],
  },
  {
    slug: "cloud-devops",
    title: "Cloud & DevOps",
    description:
      "Linux, Docker, Kubernetes, CI/CD, AWS/GCP/Azure, monitoring and infrastructure as code.",
    stepsCount: 9,
    tags: ["Docker", "Kubernetes", "AWS"],
    emoji: "☁️",
    steps: [
      { id: 1, title: "Linux & Networking", description: "Basics of Linux, shells, and networking concepts." },
      { id: 2, title: "Containers & Docker", description: "Containerize applications and manage images." },
    ],
  },
  {
    slug: "data-science",
    title: "Data Science & ML",
    description:
      "Python, statistics, ML fundamentals, model evaluation, and deployment basics.",
    stepsCount: 8,
    tags: ["Python", "ML", "Statistics"],
    emoji: "📊",
    steps: [
      { id: 1, title: "Python & NumPy", description: "Foundations of Python for data work and numerical ops." },
    ],
  },
  {
    slug: "mobile-development",
    title: "Mobile Development",
    description:
      "Native and hybrid mobile app development with Flutter, React Native or native SDKs.",
    stepsCount: 7,
    tags: ["Flutter", "React Native", "Mobile"],
    emoji: "📱",
    steps: [],
  },
  {
    slug: "ui-ux",
    title: "UI / UX Design",
    description:
      "Design fundamentals, wireframing, prototyping, accessibility, and design systems.",
    stepsCount: 6,
    tags: ["Figma", "Accessibility"],
    emoji: "🎨",
    steps: [],
  },
];

export async function getAllRoadmaps() {
  // placeholder for async behavior (DB/API later)
  return ROADMAPS;
}

export async function getRoadmapBySlug(slug) {
  return ROADMAPS.find((r) => r.slug === slug) ?? null;
}
