import { DifficultyType } from "../types";

export interface PresetFilter {
  name: string;
  prompt: string;
  difficulty: DifficultyType;
  domain: string;
  techStack: string[];
  constraints: string[];
}

export const PRESETS: PresetFilter[] = [
  {
    name: "AI Financial Health Coach",
    prompt: "An app that helps users tracking micro-expenses and forecasts budget health using AI insights.",
    difficulty: "Intermediate",
    domain: "Fintech & Wealth",
    techStack: ["React", "Express", "SQLite", "Tailwind CSS"],
    constraints: ["Privacy-First Data Storage", "Automated Budget Tagging"]
  },
  {
    name: "Local Offline Journal with Tag Summarizer",
    prompt: "A beautiful diary that auto-saves to LocalStorage and computes sentiment indexes without a web server.",
    difficulty: "Beginner",
    domain: "Developer Tools & Productivity",
    techStack: ["React", "Tailwind CSS", "lucide-react"],
    constraints: ["Offline-first", "Zero dependencies"]
  },
  {
    name: "Automated Smart Home Sensor HUB",
    prompt: "A dashboard reporting mock temperature feeds, anomaly alerts, and dynamic schedule rules.",
    difficulty: "Advanced",
    domain: "Smart Home & IoT",
    techStack: ["React", "Node.js", "Python", "PostgreSQL"],
    constraints: ["Real-time visual graphs", "System Alerts"]
  },
  {
    name: "Pet Wellness Planner with Interactive Care Maps",
    prompt: "A portal to log pet vaccinations, daily diets, and plot a walking checklist schedule.",
    difficulty: "Intermediate",
    domain: "Health & Wellness",
    techStack: ["React", "MongoDB", "Express", "Tailwind CSS"],
    constraints: ["Interactive map cards", "Daily checklist streaks"]
  }
];

export const POPULAR_STACKS = [
  "React",
  "Node.js",
  "Express",
  "Python",
  "PostgreSQL",
  "MongoDB",
  "SQLite",
  "Tailwind CSS",
  "Supabase",
  "Fastify",
  "TypeScript",
  "Docker"
];

export const POPULAR_DOMAINS = [
  "AI & Machine Learning",
  "Fintech & Wealth",
  "Developer Tools & Productivity",
  "E-Commerce & Retail",
  "Health & Wellness",
  "Collab Games & Fun",
  "Cyber Security & Devops",
  "EdTech & Interactive Learning",
  "Smart Home & IoT",
  "Social & Community Platforms"
];

export const POPULAR_CONSTRAINTS = [
  "Offline-first",
  "Zero backend setup (Client-Only)",
  "Real-time reactive charts",
  "Clean Mobile-responsive layout",
  "Self-contained database",
  "Role-based mock authentication",
  "Extreme performance / Light size"
];
