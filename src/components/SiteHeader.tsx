"use client";

import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";

type NavLink = {
  label: string;
  href: string;
};

type SiteHeaderProps = {
  navLinks: ReadonlyArray<NavLink>;
  name: string;
  role: string;
};

export function SiteHeader({ navLinks, name, role }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => setOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);
  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("/#")) {
      event.preventDefault();
      closeMenu();
      const targetId = href.replace("/#", "#");
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // If target not found (e.g. on another page), navigate to home with hash
        window.location.assign(href);
      }
    } else {
      closeMenu();
    }
  };

  return (
    <header
      className={`relative rounded-2xl border border-white/10 bg-black/85 p-5 shadow-[0_0_30px_rgba(0,0,0,0.6)] transition-all duration-300 ${scrolled ? "backdrop-blur supports-[backdrop-filter]:bg-black/65 sticky top-4 z-30" : ""
        }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-white/45">
            Portfolio
          </p>
          <p className="mt-1 text-lg font-semibold text-white">
            {name} — {role}
          </p>
        </div>
        <nav className="hidden flex-wrap gap-4 text-sm text-white/70 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={(event) => handleNavClick(event, link.href)}
              data-cursor-block
              className="rounded-full border border-white/10 px-4 py-2 text-white/70 transition hover:border-white/40 hover:text-white hover:shadow-[0_0_28px_rgba(95,225,255,0.45)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={toggleMenu}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/40 md:hidden"
        >
          {open ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>
      <div
        className={`absolute left-5 right-5 top-full z-30 rounded-3xl border border-white/15 bg-black/95 p-4 shadow-[0_20px_35px_rgba(0,0,0,0.6)] backdrop-blur transition-all duration-300 md:hidden ${open
          ? "pointer-events-auto opacity-100 translate-y-3"
          : "pointer-events-none -translate-y-2 opacity-0"
          }`}
      >
        <div className="flex flex-col gap-3 text-sm font-medium text-white/80">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={(event) => handleNavClick(event, link.href)}
              data-cursor-block
              className="rounded-2xl border border-white/10 px-4 py-3 text-center hover:border-white/30 hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
