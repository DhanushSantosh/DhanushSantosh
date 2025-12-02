export const hero = {
  name: "Dhanush Santosh",
  role: "Full-Stack AI Developer",
  location: "Remote • Worldwide",
  tagline:
    "I architect AI-native product systems where resilient infra, delightful UX, and reliable models operate as a single surface.",
  summary:
    "Across fintech, creative tooling, and B2B SaaS I lead squads shipping AI copilots, realtime dashboards, and automation platforms. I balance research velocity with production rigor—wrapping model orchestration, evals, and design systems into experiences that scale beyond demos.",
  email: "contact@xerocore.in",
  resume: "https://resume.xerocore.dev",
};

export const stats = [
  { label: "AI-native launches shipped", value: "18" },
  { label: "Automation hours saved yearly", value: "12K+" },
  { label: "Avg. inference latency", value: "<450ms" },
];

export const expertise = [
  {
    title: "AI Product Engineering",
    description:
      "Ship LLM copilots, chat workflows, and multi-modal UX across Next.js, server actions, and typed design systems.",
    items: ["Next.js 14+", "LangChain / custom routers", "Design systems"],
  },
  {
    title: "Intelligent Automation",
    description:
      "Thread automations through CRMs, ops tooling, and data streams with workflow engines, queuing, and guardrails.",
    items: ["Temporal / queues", "Edge APIs", "LLM eval harnesses"],
  },
  {
    title: "Data & MLOps",
    description:
      "Shape data contracts, retrieval pipelines, and evaluation dashboards so the models stay observable in prod.",
    items: ["Postgres + pgvector", "Vector search", "Observability"],
  },
];

export const experience = [
  {
    role: "Lead AI Product Engineer",
    company: "Nebula Studio",
    period: "2022 — Present",
    summary:
      "Leading full-stack squads delivering AI-first marketing platforms and internal copilots for global brand launches.",
    highlights: [
      "Architected Nebula OS, a multi-tenant Next.js + Edge runtime powering generative landing pages for six premium campaigns.",
      "Built an inference orchestration layer with OpenAI + Anthropic failovers and pgvector retrieval, improving factual accuracy by 38%.",
      "Established automated evals, tracing, and feature flags that cut regressions to near-zero post release.",
    ],
  },
  {
    role: "Senior Full-Stack Engineer",
    company: "Volt Finance",
    period: "2019 — 2022",
    summary:
      "Owned mission-critical trading surfaces and rolled out AI-driven risk analysis for quant teams.",
    highlights: [
      "Migrated the dashboard from CRA to Next.js/Node microservices, slicing load time by 63% while introducing streaming data widgets.",
      "Launched Volt Sense, an AI assistant watching risk policies and alerting PMs in Slack via retrieval + function calling.",
      "Partnered with research to codify a shared component library and testing harness adopted by four teams.",
    ],
  },
  {
    role: "Product Engineer",
    company: "Independent / Labs",
    period: "2016 — 2019",
    summary:
      "Shipped automation-heavy prototypes, data viz, and AI experiments for agencies, creators, and seed-stage founders.",
    highlights: [
      "Delivered 25+ bespoke builds spanning creative marketing sites, realtime dashboards, and voice interfaces.",
      "Experimented with reinforcement-learning powered personalization, multi-agent storytelling, and WebGL interactions.",
      "Served as embedded partner from research sprints through deployment, observability, and iteration.",
    ],
  },
];

export const projects = [
  {
    title: "Intellex",
    description:
      "An AI-powered research assistant with multi-agent orchestration, structured planning, and workspace-based research management. Features guided research workflows, real-time chat interfaces, and provenance tracking.",
    stack: ["Next.js", "TypeScript", "FastAPI", "Python", "Tailwind CSS", "Zustand"],
    url: "https://intellex.xerocore.in",
  },
  {
    title: "DeskCrafter",
    description:
      "A beautiful, user-friendly Linux app for creating, managing, and launching custom desktop entries.",
    stack: ["Python", "PyQt5", "Linux"],
    url: "https://github.com/DhanushSantosh/DeskCrafter",
    demo: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    title: "WinePrefix-Automation",
    description:
      "Wine Prefix Automation simplifies the process of creating and managing Wine prefixes through an intuitive graphical interface.",
    stack: ["Shell", "Bash", "Wine", "Lutris"],
    url: "https://github.com/DhanushSantosh/WinePrefix-Automation",
    demo: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
];

export const techStack = {
  fullStack: [
    "Next.js",
    "React",
    "TypeScript",
    "TailwindCSS",
    "Node.js",
    "Docker",
    "Supabase",
  ],
  ai: [
    "GPT-5",
    "Claude 3.5",
    "Llama 3",
    "Gemini Pro",
    "Cursor",
    "Hugging Face",
  ],
};
