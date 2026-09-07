export const brandConfig = {
  // Apex is canonical: it's what gets said/typed, and www is 301-redirected
  // to it (see next.config.ts) so search engines see one consistent origin
  // instead of splitting authority across two hostnames.
  canonicalUrl: "https://dhanushsantosh.in",
  displayDomain: "dhanushsantosh.in",
} as const;
