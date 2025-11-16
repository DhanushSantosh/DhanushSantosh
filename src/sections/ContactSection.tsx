import { siteConfig } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import EmailTemplateButton from "@/components/EmailTemplateButton";

export function ContactSection() {
  const { contact, socialLinks } = siteConfig;

  return (
    <section id="contact">
      <Reveal className="rounded-[32px] border border-white/10 bg-black p-10 shadow-[0_0_60px_rgba(0,0,0,0.9)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">Contact</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">{contact.headline}</h2>
            <p className="mt-3 max-w-2xl text-white/70">{contact.description}</p>
          </div>
          <div className="flex flex-col gap-4">
            <EmailTemplateButton
              email={contact.email}
              cc={contact.cc}
              bcc={contact.bcc}
              subject={contact.emailTemplate.subject}
              body={contact.emailTemplate.body}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white hover:shadow-[0_0_35px_rgba(255,255,255,0.55)]"
              label={`Email - ${contact.email}`}
            />
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
              <EmailTemplateButton
                email={contact.email}
                cc={contact.cc}
                bcc={contact.bcc}
                subject={contact.emailTemplate.subject}
                body={contact.emailTemplate.body}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 hover:text-white hover:shadow-[0_0_28px_rgba(95,225,255,0.45)]"
                label="Email"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default ContactSection;
