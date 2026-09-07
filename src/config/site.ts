import { hero } from "@/data/content";
import type { IconType } from "react-icons";
import { FiGithub, FiLinkedin } from "react-icons/fi";

type NavLink = {
  label: string;
  href: string;
};

type SocialLink = {
  label: string;
  href: string;
  icon: IconType;
};

const contactHeadline = "Want to build something together?";
const contactDescription =
  "Open to internships, freelance work, and collaborations — reach out and let's talk about what you're building.";

const emailSubject = `Let's talk - ${hero.name} x [Your Company]`;
const emailBodyLines = [
  `Hi ${hero.name},`,
  "",
  "I'm [Your Name], [Role] at [Company/Team]. We're building [brief description] and would love to explore working together.",
  "",
  "Build context:",
  "- Product vision: [Copilot, automation, insights, etc.]",
  "- Users / workflows: [Ops, GTM, support, etc.]",
  "- Tech stack + data sources: [Repos, APIs, warehouses]",
  "- Desired outcomes: [Latency targets, guardrails, KPIs]",
  "",
  "If it sounds aligned, happy to send over a detailed brief and jump on a call to map next steps.",
  "",
  "Best,",
  "[Your Name]",
  "[Role] - [Company]",
  "[Phone / Calendly / Portfolio link]",
];

export const siteConfig = {
  navLinks: [
    { label: "Work", href: "/#work" },
    { label: "Expertise", href: "/#expertise" },
    { label: "Experience", href: "/about#experience" },
    { label: "Projects", href: "/#projects" },
    { label: "Contact", href: "/#contact" },
  ] as NavLink[],
  socialLinks: [
    { label: "GitHub", href: "https://github.com/DhanushSantosh", icon: FiGithub },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/dhanush-santosh", icon: FiLinkedin },
  ] as SocialLink[],
  contact: {
    headline: contactHeadline,
    description: contactDescription,
    email: hero.email,
    cc: "",
    bcc: "",
    emailTemplate: {
      subject: emailSubject,
      body: emailBodyLines.join("\n"),
    },
  },
};
