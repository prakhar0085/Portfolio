'use client';

import { SERVICES } from '@/lib/data';
import { SectionHeading, Reveal } from '@/components/reveal';

const pad = (n: number) => String(n).padStart(2, '0');

export function Services() {
  return (
    <section id="services" className="relative py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Services"
          title={<>Services</>}
          description="Focused offerings for teams that need senior execution across the stack and the AI lifecycle."
        />

        <ul className="group/list mt-5 border-b border-border">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.title}>
                <Reveal delay={Math.min(i, 5) * 0.04}>
                  <div className="group grid transition-opacity duration-300 group-hover/list:opacity-40 hover:!opacity-100 grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-t border-border py-2.5 md:grid-cols-[auto_minmax(0,1.1fr)_minmax(0,1fr)] md:gap-x-5 md:py-3">
                    <span className="pt-0.5 font-mono text-[11px] tabular-nums text-tertiary md:pt-0.5">{pad(i + 1)}</span>

                    <h3 className="font-display text-[13px] font-medium leading-tight tracking-tight text-foreground sm:text-sm">
                      {s.title}
                    </h3>

                    <div className="col-span-2 flex gap-2 md:col-span-1">
                      <Icon className="mt-0.5 h-3 w-3 shrink-0 text-tertiary transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" strokeWidth={1.5} />
                      <div className="min-w-0">
                        <p className="text-[10px] leading-snug text-secondary sm:text-[11px]">{s.description}</p>
                        <p className="mt-0.5 text-[10px] leading-snug text-tertiary sm:text-[11px]">
                          {s.features.join(' · ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
