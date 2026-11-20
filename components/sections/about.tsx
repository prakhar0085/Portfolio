'use client';

import { Reveal, SectionHeading } from '@/components/reveal';

const ROW = 'grid gap-x-6 gap-y-2 border-t border-border py-3.5 md:grid-cols-[minmax(0,1fr)_minmax(0,3.4fr)] md:py-4';
const LABEL = 'font-mono text-[10px] uppercase tracking-widest text-tertiary';
const BODY = 'text-[11px] leading-relaxed text-secondary sm:text-xs';

export function About() {
  return (
    <section id="about" className="relative py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="About" title={<>About</>} description="Engineer who ships, not just plans." />

        <div className="mt-5 border-b border-border">
          {/* Intro */}
          <Reveal>
            <div className={ROW}>
              <p className={LABEL}>Profile</p>
              <div className="min-w-0">
                <p className="max-w-3xl font-display text-base font-medium leading-snug tracking-tight text-foreground sm:text-lg">
                  I&apos;m Prakhar Tiwari, a Full Stack Developer who builds resilient, scalable, and high-performance web
                  applications.
                </p>
                <div className={`mt-3 grid gap-x-6 gap-y-2 md:grid-cols-2 ${BODY}`}>
                  <p>
                    My expertise spans the entire software development lifecycle, from designing intuitive user interfaces to
                    architecting robust backend systems, optimizing databases, and deploying production-ready applications on
                    the cloud.
                  </p>
                  <p>
                    I architect systems from the ground up: from robust database schemas and{' '}
                    microservice deployments to{' '}
                    Gen-AI workflows and secure{' '}
                    CI/CD pipelines.
                  </p>
                  <p className="md:col-span-2">
                    I believe great software is more than clean code. It&apos;s about thoughtful architecture, strong
                    performance, intuitive design, and building products that solve meaningful problems at scale. Every project
                    I create is an opportunity to learn, improve, and deliver software that users genuinely enjoy using.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Philosophy */}
          <Reveal>
            <div className={ROW}>
              <p className={LABEL}>Philosophy</p>
              <blockquote className="max-w-3xl border-l-2 border-accent pl-3 font-serif text-xs italic leading-relaxed text-foreground/80 sm:text-[13px]">
                I believe that writing clean, maintainable code is just as critical as delivering the feature itself. Every
                technical decision I make prioritizes system performance, data security, and long-term scalability.
              </blockquote>
            </div>
          </Reveal>

          {/* Education */}
          <Reveal>
            <div className={ROW}>
              <p className={LABEL}>Education</p>
              <div className="grid gap-x-8 gap-y-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-medium leading-tight tracking-tight text-foreground sm:text-base">
                    VIT Bhopal University
                  </h3>
                  <p className="mt-1 text-[11px] text-foreground/90">B.Tech in Computer Science &amp; Engineering</p>
                  <p className={`mt-2 ${BODY}`}>
                    Graduated with a strong foundation in computer science, software engineering, data structures &amp;
                    algorithms, databases, operating systems, computer networks, and cloud computing.
                  </p>
                </div>
                <div className="md:text-right">
                  <p className="text-[11px] font-medium text-foreground">2022 — 2026</p>
                  <p className="mt-0.5 text-[10px] text-secondary">Bhopal, India</p>
                  <p className="mt-2 font-mono text-[11px] text-secondary">
                    CGPA 8.05 / 10
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
