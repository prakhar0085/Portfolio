'use client';

import { ArrowUpRight, Check } from 'lucide-react';
import { CERTIFICATIONS } from '@/lib/data';
import { SectionHeading, Reveal } from '@/components/reveal';

// Long hashes (e.g. LinkedIn IDs) are shortened: first 8 … last 12.
const shortId = (id: string) => (id.length > 24 ? `${id.slice(0, 8)}...${id.slice(-12)}` : id);

export function Certifications() {
  return (
    <section id="certifications" className="relative py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Credentials"
          title={<>Certifications</>}
          description="A selection of my technical certifications, training programs, and professional credentials."
        />

        <ul className="group/list mt-5 border-b border-border">
          {CERTIFICATIONS.map((cert, i) => (
            <li key={`${cert.id}-${i}`}>
              <Reveal delay={Math.min(i, 5) * 0.04}>
                <div className="group grid transition-opacity duration-300 group-hover/list:opacity-40 hover:!opacity-100 grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 border-t border-border py-2.5 md:grid-cols-[minmax(0,1fr)_minmax(0,2.8fr)_minmax(0,1.6fr)_auto] md:gap-x-5 md:py-3">
                  {/* Date + issuer */}
                  <div className="order-2 col-span-2 flex items-baseline gap-3 md:order-none md:col-span-1 md:block">
                    <p className="text-[11px] font-medium text-foreground">{cert.date}</p>
                    <p className="text-[10px] text-secondary md:mt-0">{cert.issuer}</p>
                  </div>

                  {/* Title + description */}
                  <div className="order-1 min-w-0 md:order-none">
                    <h3 className="font-display text-[13px] font-medium leading-tight tracking-tight text-foreground sm:text-sm">
                      {cert.title}
                    </h3>
                    <p className="mt-0.5 max-w-xl text-[10px] leading-snug text-secondary sm:text-[11px] line-clamp-2">
                      {cert.description}
                    </p>
                  </div>

                  {/* Credential ID */}
                  <div className="order-3 col-span-2 md:order-none md:col-span-1">
                    <p className="text-[10px] text-secondary">Credential ID</p>
                    <p className="mt-0.5 flex items-center gap-1.5">
                      <Check className="h-2.5 w-2.5 shrink-0 text-accent" strokeWidth={2.5} />
                      <span className="select-all truncate font-mono text-[10px] text-foreground">{shortId(cert.id)}</span>
                    </p>
                  </div>

                  {/* Link */}
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View ${cert.title} credential`}
                    className="order-1 flex h-6 w-6 items-start justify-end text-secondary transition-colors group-hover:text-foreground md:order-none"
                  >
                    <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} />
                  </a>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
