'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { EXPERIENCES } from '@/lib/data';
import { SectionHeading } from '@/components/reveal';

const EASE = [0.16, 1, 0.3, 1] as const;

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export function Experience() {
  return (
    <section id="experience" className="relative py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Experience"
          title={<>Experience</>}
          description="A timeline of my professional and freelance work."
        />

        <div className="mt-5 border-b border-border">
          {EXPERIENCES.map((exp, idx) => {
            return (
              <motion.div
                key={`${exp.role}-${exp.period}`}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                className="group relative grid gap-x-6 gap-y-2 py-3.5 md:grid-cols-[minmax(0,1fr)_minmax(0,3.4fr)] md:py-5"
              >
                {/* divider that draws itself in from the left */}
                <motion.span
                  variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.9, ease: EASE } } }}
                  className="absolute left-0 right-0 top-0 h-px origin-left bg-border"
                />

                {/* Left: index, period, duration, type (stays in view while the row scrolls) */}
                <motion.div
                  variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } } }}
                  className="self-start md:sticky md:top-24"
                >
                  <p className="font-mono text-[11px] tabular-nums text-secondary">{String(idx + 1).padStart(2, '0')}</p>
                  <p className="mt-1.5 text-[11px] font-medium text-foreground">{exp.period}</p>
                  <p className="mt-0.5 text-[10px] text-secondary">
                    {[exp.duration, exp.location].filter(Boolean).join(' · ')}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-foreground">
                    <span className="h-1.5 w-1.5 bg-foreground opacity-60" />
                    {exp.type}
                  </p>
                </motion.div>

                {/* Right: role, company, achievements, tech */}
                <div className="min-w-0">
                  <motion.h3
                    variants={itemVariants}
                    className="font-display text-base font-medium leading-tight tracking-tight text-foreground sm:text-lg"
                  >
                    {exp.role}
                  </motion.h3>

                  <motion.div variants={itemVariants} className="mt-1.5 flex items-center gap-2">
                    {exp.logo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={exp.logo}
                        alt={`${exp.company} logo`}
                        className="h-6 w-6 shrink-0 rounded-full bg-white object-cover"
                      />
                    )}
                    {exp.url ? (
                      <a
                        href={exp.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/80 hover:text-foreground"
                      >
                        <span className="border-b border-border">{exp.company}</span>
                        <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    ) : (
                      <p className="text-xs font-semibold text-foreground/80">
                        <span className="border-b border-border">{exp.company}</span>
                      </p>
                    )}
                  </motion.div>

                  <motion.ul variants={listVariants} className="mt-3 flex flex-col gap-1.5">
                    {exp.achievements.map((a, i) => (
                      <motion.li
                        key={i}
                        variants={itemVariants}
                        className="flex items-start gap-2.5 text-[11px] leading-relaxed text-secondary transition-colors duration-200 hover:text-foreground sm:text-xs"
                      >
                        <span className="mt-[0.7em] h-px w-3 shrink-0 bg-foreground opacity-30" />
                        <span>{a}</span>
                      </motion.li>
                    ))}
                  </motion.ul>

                  <motion.div variants={listVariants} className="mt-3 flex flex-wrap gap-1">
                    {exp.tech.map((t) => (
                      <motion.span
                        key={t}
                        variants={itemVariants}
                        className="cursor-default border border-border px-1.5 py-0.5 font-mono text-[9px] text-secondary transition-colors duration-200 hover:border-foreground/40 hover:text-foreground"
                      >
                        {t}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
