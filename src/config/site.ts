import type { IconType } from "react-icons";
import { FiGithub, FiLinkedin } from "react-icons/fi";
import { hero } from "@/data/content";

type NavLink = {
  label: string;
  href: string;
};

type SocialLink = {
  label: string;
  href: string;
  icon: IconType;
};

const contactHeadline = "Ready to launch something iconic?";
const contactDescription =
  "I collaborate with founders, art directors, and forward teams to build immersive stories end-to-end—from creative direction through Vercel deployment.";

const emailSubject = `Collaboration Opportunity · ${hero.name} x [Your Company]`;
const emailBodyLines = [
  `Hi ${hero.name},`,
  "",
  "I'm [Your Name], [Role] at [Company/Team]. We're planning a new launch and want to explore partnering with you for creative engineering support.",
  "",
  "Key context:",
  "• Company / Product: [Name + short descriptor]",
  "• Engagement focus: [Marketing site, platform UI, interactive hero, etc.]",
  "• Timeline: [e.g., Kickoff in March, beta in June]",
  "• Success looks like: [Performance goals, brand moments, conversions, etc.]",
  "",
  "We admire your work blending cinematic storytelling with robust systems, and we'd love to understand availability, pricing, and any initial thoughts you have.",
  "",
  "If the fit feels right, I'm happy to send over a detailed brief and schedule a call with stakeholders.",
  "",
  "Best,",
  "[Your Name]",
  "[Role] · [Company]",
  "[Phone / Calendly / Portfolio link]",
];

export const siteConfig = {
  navLinks: [
    { label: "Expertise", href: "#expertise" },
    { label: "Experience", href: "#experience" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
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

export type SiteConfig = typeof siteConfig;
