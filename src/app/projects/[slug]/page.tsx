import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiArrowUpRight, FiGithub } from "react-icons/fi";

import { brandConfig } from "@/config/brand";
import { caseStudies, caseStudyLookup } from "@/data/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudyLookup.get(slug);
  if (!study) return {};

  return {
    title: study.name,
    description: study.tagline,
    alternates: {
      canonical: `${brandConfig.canonicalUrl}/projects/${study.slug}`,
    },
  };
}

const STATUS_STYLES: Record<string, string> = {
  active: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
  paused: "border-amber-400/20 bg-amber-400/10 text-amber-300",
};

export default async function ProjectCaseStudyPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const study = caseStudyLookup.get(slug);

  if (!study) {
    notFound();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="relative mx-auto flex max-w-4xl flex-col gap-12 px-4 pb-20 pt-8 sm:gap-16 sm:px-8 sm:pb-24 sm:pt-12 lg:px-12">
        <Link
          href="/#projects"
          data-cursor-block
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white"
        >
          <FiArrowLeft />
          Back to projects
        </Link>

        <main id="main-content" className="space-y-12 sm:space-y-16">
          <header className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${STATUS_STYLES[study.status]}`}
              >
                {study.statusLabel}
              </span>
              {study.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wider text-white/60"
                >
                  {tech}
                </span>
              ))}
            </div>

            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {study.name}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/75">{study.tagline}</p>

            <a
              href={study.repoUrl}
              target="_blank"
              rel="noreferrer"
              data-cursor-block
              className="group inline-flex w-fit items-center gap-2 rounded-full border border-white bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
            >
              <FiGithub />
              View repository
              <FiArrowUpRight className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </header>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Problem</h2>
            <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{study.problem}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Audience</h2>
            <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{study.audience}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">My role</h2>
            <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{study.role}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">
              Key decisions
            </h2>
            <ul className="space-y-4">
              {study.decisions.map((decision) => (
                <li
                  key={decision}
                  className="max-w-2xl border-l-2 border-cyan-400/30 pl-4 text-base leading-relaxed text-white/80 sm:text-lg"
                >
                  {decision}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Result</h2>
            <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{study.result}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">
              Constraints &amp; honest scope
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">{study.constraints}</p>
          </section>
        </main>
      </div>
    </div>
  );
}
