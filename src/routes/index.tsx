import { createFileRoute } from "@tanstack/react-router";

import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { Navbar } from "@/components/site/Navbar";
import { Projects } from "@/components/site/Projects";
import { Unete } from "@/components/site/Unete";
import { proyectos } from "@/config/proyectos";
import { siteConfig } from "@/config/site";

const publicados = proyectos.filter((p) => p.publicado);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: siteConfig.seo.title },
      { name: "description", content: siteConfig.seo.description },
      { property: "og:title", content: siteConfig.seo.title },
      { property: "og:description", content: siteConfig.seo.description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_ES" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: siteConfig.seo.title },
      { name: "twitter:description", content: siteConfig.seo.description },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-70 focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido">
        <Hero />
        <About />
        <Projects proyectos={publicados} />
        <Unete />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
