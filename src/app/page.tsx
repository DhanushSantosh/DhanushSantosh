import Link from "next/link";
import { FiArrowUpRight, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import type { IconType } from "react-icons";
import { hero, expertise, experience, projects, stats } from "@/data/content";
import { Reveal } from "@/components/Reveal";
import { ClientSculpture } from "@/components/DynamicSculpture";
import { SiteHeader } from "@/components/SiteHeader";
import BackToTopButton from "@/components/BackToTopButton";

const navLinks = [
  { label: "Expertise", href: "#expertise" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const socialLinks: { label: string; href: string; icon: IconType }[] = [
  { label: "GitHub", href: "https://github.com/xero", icon: FiGithub },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/xero",
    icon: FiLinkedin,
  },
  { label: hero.email, href: `mailto:${hero.email}`, icon: FiMail },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-20 pt-8 sm:px-8 lg:px-12">
        <SiteHeader navLinks={navLinks} name={hero.name} role={hero.role} />

        <main className="space-y-24">
          <section id="hero" className="flex flex-col gap-10">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
              <Reveal className="w-full space-y-8 lg:flex-[0.65] lg:max-w-none">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.4em] text-white/50">
                  {hero.location}
                </p>
                <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl">
                  {hero.name} builds rich product stories with code, light, and motion.
                </h1>
                <p className="max-w-2xl text-lg text-white/70">{hero.summary}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="#contact"
                  data-cursor-block
                  className="group inline-flex items-center justify-center rounded-full border border-white px-6 py-3 text-sm font-semibold text-black transition bg-white hover:bg-white hover:shadow-[0_0_35px_rgba(255,255,255,0.55)]"
                >
                  Start a project
                  <FiArrowUpRight className="ml-2 text-black transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <a
                  href={hero.resume}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor-block
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:shadow-[0_0_28px_rgba(95,225,255,0.45)]"
                >
                  Download CV
                </a>
              </div>
              </Reveal>
              <Reveal
                delay={0.2}
                className="flex w-full justify-center lg:flex-[0.35] lg:justify-end"
              >
                <div className="flex w-full max-w-[320px] justify-center lg:max-w-[360px]">
                  <ClientSculpture />
                </div>
              </Reveal>
            </div>
            <Reveal>
              <div className="flex w-full flex-wrap gap-6 rounded-3xl border border-white/10 bg-black p-6 shadow-[0_0_45px_rgba(0,0,0,0.8)]">
                {stats.map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <p className="text-3xl font-semibold">{stat.value}</p>
                    <p className="text-sm text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>

          <section id="expertise" className="space-y-10">
            <Reveal as="section" className="space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">
                Expertise
              </p>
              <h2 className="text-3xl font-semibold text-white md:text-4xl">
                Systems thinking with cinematic craft.
              </h2>
              <p className="max-w-3xl text-white/70">{hero.tagline}</p>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {expertise.map((item) => (
                <Reveal key={item.title} className="h-full">
                  <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-black p-7 shadow-[0_0_35px_rgba(0,0,0,0.85)] transition hover:border-white/40">
                    <div className="text-sm uppercase tracking-[0.4em] text-white/50">
                      {item.title}
                    </div>
                    <p className="mt-4 flex-1 text-sm text-white/70">
                      {item.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2 text-xs uppercase text-white/50">
                      {item.items.map((stackItem) => (
                        <span
                          key={stackItem}
                          className="rounded-full border border-white/5 bg-white/5 px-3 py-1"
                        >
                          {stackItem}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="experience" className="space-y-10">
            <Reveal as="section">
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">
                Experience
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
                Leadership across product teams and creative studios.
              </h2>
            </Reveal>
            <div className="space-y-8">
              {experience.map((item) => (
                <Reveal key={item.company}>
                  <article className="rounded-3xl border border-white/10 bg-black p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)]">
                    <div className="flex flex-col gap-1 border-b border-white/5 pb-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.4em] text-white/50">
                          {item.period}
                        </p>
                        <h3 className="text-2xl font-semibold text-white">
                          {item.role} · {item.company}
                        </h3>
                      </div>
                      <p className="text-sm text-white/60">{item.summary}</p>
                    </div>
                    <ul className="mt-5 space-y-3 text-sm text-white/75">
                      {item.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex items-start gap-3 rounded-2xl border border-white/5 bg-black px-4 py-3"
                        >
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white" />
                          <p>{highlight}</p>
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="projects" className="space-y-10">
            <Reveal as="section">
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">
                Selected Projects
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
                High-polish builds crafted to convert and inspire.
              </h2>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <Reveal key={project.title} className="h-full">
                  <article className="group flex h-full flex-col rounded-3xl border border-white/10 bg-black p-6 shadow-[0_0_35px_rgba(0,0,0,0.85)]">
                    <div className="text-xs uppercase tracking-[0.4em] text-white/50">
                      Case {String(index + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold">{project.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-white/70">
                      {project.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase text-white/50">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-white/10 px-3 py-1"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 inline-flex items-center text-sm font-semibold text-white transition hover:text-white/70"
                    >
                      Visit project
                      <FiArrowUpRight className="ml-2" />
                    </a>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="contact">
            <Reveal className="rounded-[32px] border border-white/10 bg-black p-10 shadow-[0_0_60px_rgba(0,0,0,0.9)]">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-white/50">
                    Contact
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold text-white">
                    Ready to launch something iconic?
                  </h2>
                  <p className="mt-3 max-w-2xl text-white/70">
                    I collaborate with founders, art directors, and forward
                    teams to build immersive stories end-to-end—from creative
                    direction through Vercel deployment.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <a
                    href={`mailto:${hero.email}`}
                    data-cursor-block
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white hover:shadow-[0_0_35px_rgba(255,255,255,0.55)]"
                  >
                    Email {hero.email}
                  </a>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        data-cursor-block
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 hover:text-white hover:shadow-[0_0_28px_rgba(95,225,255,0.45)]"
                      >
                        <social.icon />
                        {social.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>
        </main>

        <footer className="pb-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {hero.name} — Crafted with Next.js & Vercel
        </footer>
      </div>
      <BackToTopButton />
    </div>
  );
}
