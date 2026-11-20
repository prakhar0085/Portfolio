'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Github, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PROJECTS, type Project } from '@/lib/data';
import { SectionHeading, Reveal } from '@/components/reveal';
import { createPortal } from 'react-dom';
import type { WorkRoom } from '@/components/scenes/work-room';
import { cn } from '@/lib/utils';

const pad = (n: number) => String(n).padStart(2, '0');

function splitTitle(p: Project) {
  const [main, sub] = p.title.split(' – ');
  return { main, sub: sub || p.tags[0] || 'Web Application' };
}

export function Projects() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(0);
  const [pointing, setPointing] = useState(false);
  const [mode, setMode] = useState<'scene' | 'static'>('scene'); // 'static' = reduced motion / no WebGL
  const wrapRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roomRef = useRef<WorkRoom | null>(null);
  const drawerScroll = useRef<HTMLDivElement>(null);

  const step = (dir: 1 | -1) => {
    if (!selected) return;
    const i = PROJECTS.findIndex((p) => p.slug === selected.slug);
    setSelected(PROJECTS[(i + dir + PROJECTS.length) % PROJECTS.length]);
  };

  useEffect(() => {
    drawerScroll.current?.scrollTo({ top: 0 });
  }, [selected]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMode('static');
      return;
    }
    const wrap = wrapRef.current!;
    let disposed = false;
    let io: IntersectionObserver | undefined;
    let ro: ResizeObserver | undefined;

    // 0..1 progress through the pinned stretch.
    const update = () => {
      const rect = wrap.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)));
      roomRef.current?.setProgress(p);
      setActive(Math.round(p * (PROJECTS.length - 1)));
    };

    // three.js loads on demand, so it isn't in the initial bundle.
    import('@/components/scenes/work-room').then(({ createWorkRoom }) => {
      if (disposed || !canvasRef.current) return;
      let room: WorkRoom;
      try {
        const lowPower = window.matchMedia('(max-width: 767px)').matches;
        room = createWorkRoom(canvasRef.current, PROJECTS.map((p) => p.cover), { lowPower });
      } catch {
        setMode('static');
        return;
      }
      roomRef.current = room;
      room.resize();
      ro = new ResizeObserver(() => room.resize());
      ro.observe(canvasRef.current);
      // Render only while the section is on screen.
      io = new IntersectionObserver(([e]) => (e.isIntersecting ? room.start() : room.stop()));
      io.observe(wrap);
      update();
    });

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      disposed = true;
      window.removeEventListener('scroll', update);
      io?.disconnect();
      ro?.disconnect();
      roomRef.current?.dispose();
      roomRef.current = null;
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    const handler = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      const p = PROJECTS.find((x) => x.slug === slug);
      if (p) setSelected(p);
    };
    window.addEventListener('open-project', handler);
    return () => window.removeEventListener('open-project', handler);
  }, []);

  useEffect(() => {
    if (selected) {
      const originalBodyStyle = document.body.style.overflow;
      const originalHtmlStyle = document.documentElement.style.overflow;
      
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSelected(null);
        if (e.key === 'ArrowRight') step(1);
        if (e.key === 'ArrowLeft') step(-1);
      };
      window.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = originalBodyStyle;
        document.documentElement.style.overflow = originalHtmlStyle;
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [selected]);

  const current = PROJECTS[active];
  const { main, sub } = splitTitle(current);
  const isScene = mode === 'scene';

  return (
    <section
      id="projects"
      ref={wrapRef}
      className={cn('relative', isScene ? 'bg-[#0a0a0a] text-[#ededed]' : 'py-12 sm:py-16 overflow-hidden')}
      style={isScene ? { height: `${100 + (PROJECTS.length - 1) * 60}svh` } : undefined}
    >
      {isScene ? (
        <div data-nav-dark="true" className="sticky top-0 h-[100svh] overflow-hidden">
          <canvas
            ref={canvasRef}
            className={cn('absolute inset-0 h-full w-full touch-pan-y', pointing && 'cursor-pointer')}
            onPointerMove={(e) => {
              const i = roomRef.current?.pick(e.clientX, e.clientY) ?? null;
              roomRef.current?.setHover(i);
              setPointing(i !== null);
            }}
            onPointerLeave={() => {
              roomRef.current?.setHover(null);
              setPointing(false);
            }}
            onClick={(e) => {
              const i = roomRef.current?.pick(e.clientX, e.clientY);
              if (i != null) setSelected(PROJECTS[i]);
            }}
            aria-hidden
          />

          {/* Top: section label + title */}
          <div className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-[88px] md:px-16 md:pt-[96px] text-center">
            <h2 className="font-display text-[clamp(20px,1.9vw,28px)] font-semibold leading-none tracking-tight">Projects</h2>
          </div>

          {/* Bottom: caption for the current project (cross-fades), actions, and counter */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 px-6 pb-8 md:flex-row md:items-end md:justify-between md:px-16 md:pb-10">
            <div className="min-w-0" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="font-display text-[clamp(18px,1.7vw,26px)] font-semibold leading-tight tracking-tight">
                    {main} <span className="opacity-45">/ {sub}</span>
                  </p>
                  <p className="mt-1 truncate text-[14px] opacity-55">{current.techStack.slice(0, 5).join(' · ')}</p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] font-medium">
                <button
                  onClick={() => setSelected(current)}
                  className="rounded-lg bg-[#ededed] px-4 py-1.5 text-[13px] font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
                >
                  Case study
                </button>
                <a href={current.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 opacity-75 hover:opacity-100">
                  Live Demo <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <a href={current.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub Repository" className="inline-flex items-center gap-1.5 opacity-75 hover:opacity-100">
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
              </div>
            </div>
            <p className="shrink-0 text-[14px] tabular-nums opacity-55">
              <span className="opacity-100">{pad(active + 1)}</span> of {pad(PROJECTS.length)}
            </p>
          </div>

          {/* Keyboard / screen-reader access to every project */}
          <ul className="sr-only">
            {PROJECTS.map((p) => (
              <li key={p.slug}>
                <button onClick={() => setSelected(p)}>Open case study: {p.title}</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
      {/* Background ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none">
        <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          title={<>Projects</>}
          description="A curated selection of real-world platforms, web applications, and autonomous agent systems I designed and shipped."
        />

        {/* 3-Column Grid matching reference image */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((p, index) => {
            const titleParts = p.title.split(' – ');
            const mainTitle = titleParts[0];
            const subTitle = titleParts[1] || p.tags[0] || 'Web Application';

            return (
              <Reveal key={p.slug} delay={index * 0.05} className="h-full">
                <div
                  onClick={() => setSelected(p)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-foreground/[0.02] backdrop-blur-md flex flex-col justify-between h-full transition-colors hover:border-foreground/25"
                >
                  {/* Top Image Box: Flush screenshot with browser dots bar */}
                  <div className="w-full aspect-[16/10] overflow-hidden relative border-b border-border bg-foreground/[0.04] shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border bg-foreground/[0.03] backdrop-blur z-10 relative">
                      <span className="h-2 w-2 rounded-full bg-red-500/80" />
                      <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
                      <span className="h-2 w-2 rounded-full bg-green-500/80" />
                      <span className="ml-2 font-mono text-[9px] text-tertiary truncate">
                        {p.slug}.dev
                      </span>
                    </div>

                    <div className="h-[calc(100%-25px)] w-full overflow-hidden flex items-center justify-center p-1">
                      <img
                        src={p.cover}
                        alt={p.title}
                        className="h-full w-full object-contain rounded-sm"
                      />
                    </div>
                  </div>

                  {/* Content Padding Area - Compact & Tight Spacing */}
                  <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Title & Subtitle */}
                      <h3 className="font-display text-lg font-bold text-foreground tracking-tight">
                        {mainTitle}
                      </h3>
                      <span className="text-xs font-semibold text-secondary mt-0.5 block">
                        {subTitle}
                      </span>

                      {/* Description Paragraph */}
                      <p className="mt-2 text-xs text-secondary leading-relaxed line-clamp-3">
                        {p.summary || p.tagline}
                      </p>
                    </div>

                    <div className="mt-3.5">
                      {/* Uppercase Tech Stack Pills */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {p.techStack.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="rounded-lg border border-border/80 bg-foreground/[0.04] px-2.5 py-0.5 font-mono text-[9px] text-secondary uppercase font-medium select-none"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Bottom Action Row: Live Demo + GitHub square button */}
                      <div className="flex items-center gap-2">
                        <a
                          href={p.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 text-center py-2 rounded-lg bg-foreground text-background font-semibold text-xs hover:opacity-90 transition-opacity select-none"
                        >
                          Live Demo
                        </a>
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-border bg-foreground/[0.04] text-foreground hover:bg-foreground/[0.08] transition-colors"
                          aria-label="GitHub Repository"
                        >
                          <Github className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
        </>
      )}

      {/* Case study drawer */}
      {mounted && createPortal(
        <AnimatePresence>
          {selected && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelected(null)}
                style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                className="fixed inset-0 z-[120] backdrop-blur-sm"
              />

              {/* Panel */}
              <motion.aside
                role="dialog"
                aria-modal="true"
                aria-label={`${selected.title} case study`}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 260 }}
                className="fixed bottom-0 right-0 top-0 z-[130] flex h-full w-full flex-col border-l border-border bg-background shadow-2xl sm:w-[640px] lg:w-[760px]"
              >
                {/* Top bar: position, previous / next, close */}
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-5 sm:px-8">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-tertiary">
                    Case study · {pad(PROJECTS.findIndex((p) => p.slug === selected.slug) + 1)} / {pad(PROJECTS.length)}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => step(-1)}
                      aria-label="Previous project"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-secondary transition-colors hover:text-foreground"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => step(1)}
                      aria-label="Next project"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-secondary transition-colors hover:text-foreground"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setSelected(null)}
                      aria-label="Close"
                      className="ml-1 flex h-7 w-7 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scrolling content */}
                <div ref={drawerScroll} className="flex-1 overflow-y-auto px-5 pb-12 pt-6 [scrollbar-width:thin] sm:px-8">
                  <motion.div
                    key={selected.slug}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Cover */}
                    <div className="overflow-hidden rounded-lg border border-border bg-neutral-950">
                      <img
                        src={selected.cover}
                        alt={selected.title}
                        className="aspect-[16/10] w-full object-contain"
                      />
                    </div>

                    {/* Title */}
                    <div className="mt-6">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-secondary">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: selected.status === 'Live' ? '#34d399' : '#fbbf24' }}
                        />
                        {selected.status}
                      </span>
                      <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[28px]">
                        {splitTitle(selected).main}
                        <span className="text-tertiary"> / {splitTitle(selected).sub}</span>
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-secondary">{selected.tagline}</p>

                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <a
                          href={selected.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90"
                        >
                          Live Demo <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                        <a
                          href={selected.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                          <Github className="h-3.5 w-3.5" /> View Source
                        </a>
                      </div>
                    </div>

                    {/* Metrics */}
                    {selected.metrics.length > 0 && (
                      <dl className="mt-8 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-lg border border-border">
                        {selected.metrics.map((m) => (
                          <div key={m.label} className="bg-muted px-4 py-3.5">
                            <dd className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{m.value}</dd>
                            <dt className="mt-0.5 text-[11px] text-secondary">{m.label}</dt>
                          </div>
                        ))}
                      </dl>
                    )}

                    {/* Tech stack */}
                    <DrawerBlock label="Tech stack">
                      <ul className="flex flex-wrap gap-1.5">
                        {selected.techStack.map((t) => (
                          <li key={t} className="rounded-md border border-border px-2.5 py-1 font-mono text-[11px] text-secondary">
                            {t}
                          </li>
                        ))}
                      </ul>
                    </DrawerBlock>

                    <DrawerBlock label="The problem">
                      <p className="text-sm leading-relaxed text-secondary">{selected.problem}</p>
                    </DrawerBlock>

                    <DrawerBlock label="Architecture">
                      <p className="text-sm leading-relaxed text-secondary">{selected.architecture}</p>
                    </DrawerBlock>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      <DrawerList title="Key features" items={selected.features} />
                      <DrawerList title="Technical challenges" items={selected.challenges} />
                      <DrawerList title="Engineered solutions" items={selected.solutions} />
                      <DrawerList title="Future roadmap" items={selected.future} />
                    </div>
                  </motion.div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}

// A labelled block inside the drawer: small caps label on top, content below, hairline above.
function DrawerBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 border-t border-border pt-5">
      <h3 className="mb-3 font-mono text-[11px] uppercase tracking-widest text-tertiary">{label}</h3>
      {children}
    </div>
  );
}

function DrawerList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-muted p-4">
      <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed text-secondary">
            <span className="mt-[0.65em] h-px w-3 shrink-0 bg-foreground opacity-30" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
