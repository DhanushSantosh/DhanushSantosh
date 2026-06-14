import { siteConfig } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import EmailTemplateButton from "@/components/EmailTemplateButton";

export function ContactSection() {
  const { contact, socialLinks } = siteConfig;

  return (
    <section id="contact" className="cv-auto bg-transparent">
      <Reveal className="relative overflow-hidden">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between relative z-10 py-16 px-4 sm:px-8 lg:px-12 w-full max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-center flex-1">
            <div className="text-center lg:text-left">
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">Contact</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold text-white">{contact.headline}</h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg mx-auto lg:mx-0">
                {contact.description}
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-4 lg:max-w-sm shrink-0">
            <EmailTemplateButton
              email={contact.email}
              cc={contact.cc}
              bcc={contact.bcc}
              subject={contact.emailTemplate.subject}
              body={contact.emailTemplate.body}
              className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white hover:shadow-[0_0_35px_rgba(255,255,255,0.55)]"
              label={`Email - ${contact.email}`}
            />
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor-block
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:border-white/40 hover:text-white hover:shadow-[0_0_28px_rgba(95,225,255,0.45)] sm:w-auto sm:text-xs"
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
  );
}

export default ContactSection;
