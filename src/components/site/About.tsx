import { Reveal, Section, SectionHeading } from "@/components/site/primitives";
import { Terminal } from "@/components/site/Terminal";
import { siteConfig } from "@/config/site";

export function About() {
  return (
    <Section id="sobre-mi">
      <SectionHeading eyebrow="Sobre mí" title={siteConfig.about.title} />

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="space-y-5">
          <Reveal>
            <p className="text-base leading-relaxed text-foreground">{siteConfig.about.intro}</p>
          </Reveal>
          {siteConfig.about.paragraphs.map((paragraph, index) => (
            <Reveal key={index} delay={60 * (index + 1)}>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="lg:pt-2">
          <Terminal />
          <dl className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "Edad", value: `${siteConfig.age} años` },
              { label: "País", value: siteConfig.country },
              { label: "Hago", value: "Plugins · Bots · Networks" },
              { label: "Contacto", value: `Discord · ${siteConfig.contact.discord}` },
            ].map((item) => (
              <div key={item.label} className="panel px-4 py-3">
                <dt className="label-mono">{item.label}</dt>
                <dd className="mt-1 text-sm text-foreground">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  );
}
