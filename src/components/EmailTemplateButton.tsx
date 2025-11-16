"use client";

import { useMemo } from "react";

const MOBILE_REGEX = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return MOBILE_REGEX.test(navigator.userAgent);
};

type EmailTemplateButtonProps = {
  email: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  className?: string;
  label?: string;
};

export function EmailTemplateButton({
  email,
  cc,
  bcc,
  subject,
  body,
  className = "",
  label = "Email",
}: EmailTemplateButtonProps) {
  const { gmailUrl, mailtoHref } = useMemo(() => {
    const encodeMailParam = (value: string) =>
      encodeURIComponent(value).replace(/%0A/gi, "%0D%0A");

    const mailtoParts = [`subject=${encodeMailParam(subject)}`, `body=${encodeMailParam(body)}`];
    if (cc) mailtoParts.push(`cc=${encodeMailParam(cc)}`);
    if (bcc) mailtoParts.push(`bcc=${encodeMailParam(bcc)}`);
    const mailto = `mailto:${email}?${mailtoParts.join("&")}`;

    const gmailParams = new URLSearchParams({
      fs: "1",
      tf: "cm",
      to: email,
      su: subject,
      body,
    });
    if (cc) gmailParams.set("cc", cc);
    if (bcc) gmailParams.set("bcc", bcc);

    return {
      mailtoHref: mailto,
      gmailUrl: `https://mail.google.com/mail/?${gmailParams.toString()}`,
    };
  }, [email, cc, bcc, subject, body]);

  const handleClick = () => {
    const preferredUrl = isMobileDevice() ? mailtoHref : gmailUrl;
    const opened = window.open(preferredUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.href = preferredUrl;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      data-cursor-block
      className={className}
      title="Opens Gmail with a pre-filled outreach template"
    >
      <span>{label}</span>
      <a
        href={mailtoHref}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      >
        Use mail app
      </a>
    </button>
  );
}

export default EmailTemplateButton;
