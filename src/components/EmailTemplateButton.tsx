"use client";

import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

type EmailTemplateButtonProps = {
  email: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  className?: string;
  label?: string;
};

const COPY_FEEDBACK_MS = 2000;

function EmailTemplateButton({ email, cc, bcc, subject, body, className = "", label = "Email" }: EmailTemplateButtonProps) {
  const [copied, setCopied] = useState(false);

  const encodeMailParam = (value: string) => encodeURIComponent(value).replace(/%0A/gi, "%0D%0A");
  const mailtoParts = [`subject=${encodeMailParam(subject)}`, `body=${encodeMailParam(body)}`];
  if (cc) mailtoParts.push(`cc=${encodeMailParam(cc)}`);
  if (bcc) mailtoParts.push(`bcc=${encodeMailParam(bcc)}`);
  const mailtoHref = `mailto:${email}?${mailtoParts.join("&")}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      // Clipboard access can fail (permissions, insecure context); the
      // mailto link and visible address remain usable either way.
    }
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row">
      {/* A plain mailto: link — opens whatever the visitor's system/browser
          is actually configured to handle mail with, rather than forcing
          Gmail's web compose. The previous version also nested an <a> inside
          a <button>, which is invalid HTML (interactive content can't nest)
          and did nothing useful since it was aria-hidden and unfocusable. */}
      <a
        href={mailtoHref}
        data-cursor-block
        className={className}
      >
        {label}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        data-cursor-block
        aria-label={copied ? "Email address copied" : `Copy email address ${email}`}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover-hover:hover:border-white/30 hover-hover:hover:bg-white/10"
      >
        {copied ? <FiCheck className="text-cyan-300" /> : <FiCopy />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}

export default EmailTemplateButton;
