'use client';

import { useEffect, useRef } from 'react';
import { SectionHeading } from '@/components/reveal';
import {
  JavaIcon, PythonIcon, SqlIcon, HtmlIcon, CssIcon, JavaScriptIcon, ReactIcon, TailwindIcon, ReduxIcon, NodeIcon, ExpressIcon, RestApiIcon, RedisIcon, WebSocketsIcon, MysqlIcon, MongoIcon, PostgresIcon, AwsIcon, DockerIcon, CiCdIcon, GitIcon, GithubIcon, GithubActionsIcon, LlmIcon, RagIcon, LangChainIcon, LangGraphIcon, EmbeddingsIcon, PromptIcon, AiAgentsIcon
} from '@/components/brand-icons';

const RUNNING_ICONS = [
  // Row 1 (first 15 skills)
  { name: 'Java', icon: JavaIcon, iconPath: '/icons/Java-Dark.svg', color: '#EA2D42' },
  { name: 'Python', icon: PythonIcon, iconPath: '/icons/Python.svg', color: '#3776AB' },
  { name: 'SQL', icon: SqlIcon, iconPath: '/icons/SQL.svg', color: '#38BDF8' },
  { name: 'HTML', icon: HtmlIcon, iconPath: '/icons/HTML.svg', color: '#E34F26' },
  { name: 'CSS', icon: CssIcon, iconPath: '/icons/CSS.svg', color: '#1572B6' },
  { name: 'JavaScript (ES6+)', icon: JavaScriptIcon, iconPath: '/icons/JavaScript.svg', color: '#F7DF1E' },
  { name: 'React.js', icon: ReactIcon, iconPath: '/icons/React-Dark.svg', color: '#61DAFB' },
  { name: 'Tailwind CSS', icon: TailwindIcon, iconPath: '/icons/Tailwind CSS.png', color: '#38BDF8' },
  { name: 'Redux Toolkit', icon: ReduxIcon, iconPath: '/icons/Redux.svg', color: '#764ABC' },
  { name: 'Node.js', icon: NodeIcon, iconPath: '/icons/NodeJS-Dark.svg', color: '#339933' },
  { name: 'Express.js', icon: ExpressIcon, iconPath: '/icons/ExpressJS-Dark.svg', color: '#FFFFFF' },
  { name: 'REST APIs', icon: RestApiIcon, iconPath: '/icons/REST-API.svg', color: '#22C55E' },
  { name: 'Redis', icon: RedisIcon, iconPath: '/icons/Redis-Dark.svg', color: '#DC2626' },
  { name: 'WebSockets', icon: WebSocketsIcon, iconPath: '/icons/websocket.png', color: '#00E5FF' },
  { name: 'MySQL', icon: MysqlIcon, iconPath: '/icons/MySQL.svg', color: '#4479A1' },
  
  // Row 2 (next 16 skills)
  { name: 'MongoDB', icon: MongoIcon, iconPath: '/icons/MongoDB.svg', color: '#47A248' },
  { name: 'PostgreSQL', icon: PostgresIcon, iconPath: '/icons/PostgreSQL-Dark.svg', color: '#336791' },
  { name: 'AWS', icon: AwsIcon, iconPath: '/icons/AWS-Dark.svg', color: '#FF9900' },
  { name: 'Docker', icon: DockerIcon, iconPath: '/icons/Docker.svg', color: '#2496ED' },
  { name: 'CI/CD', icon: CiCdIcon, iconPath: '/icons/cicd.png', color: '#818CF8' },
  { name: 'Git', icon: GitIcon, iconPath: '/icons/Git.svg', color: '#F05032' },
  { name: 'GitHub', icon: GithubIcon, iconPath: '/icons/Github-Dark.svg', color: '#FFFFFF' },
  { name: 'GitHub Actions', icon: GithubActionsIcon, iconPath: '/icons/github action.png', color: '#2088FF' },
  { name: 'LLMs', icon: LlmIcon, iconPath: '/icons/LLM.png', color: '#A78BFA' },
  { name: 'RAG', icon: RagIcon, color: '#34D399' },
  { name: 'LangChain', icon: LangChainIcon, iconPath: '/icons/Langchain.png', color: '#34D399' },
  { name: 'LangGraph', icon: LangGraphIcon, iconPath: '/icons/LangGraph.png', color: '#EC4899' },
  { name: 'Embeddings', icon: EmbeddingsIcon, iconPath: '/icons/Embeddings.svg', color: '#14B8A6' },
  { name: 'Prompt Engineering', icon: PromptIcon, iconPath: '/icons/Prompt Engineering.png', color: '#10B981' },
  { name: 'AI Agents', icon: AiAgentsIcon, iconPath: '/icons/Ai Agent.png', color: '#F43F5E' },
  { name: 'MCP', iconPath: '/icons/MCP.png', color: '#FF9900' }
];

const N = RUNNING_ICONS.length;

// Tuning
const OUTER_COUNT = 21; // balls on the outer ring; the rest run on the inner ring
const OUTER_SPEED = 0.3; // rad/s
const INNER_SPEED = -0.45; // rad/s, opposite direction

export function Skills() {
  const boxRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ballRefs = useRef<(HTMLDivElement | null)[]>([]);
  const input = useRef({ hover: false, x: -9999, y: -9999 });

  useEffect(() => {
    const box = boxRef.current!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = 0;
    let visible = false;
    let t = 0;
    let nearest = -1;
    let size = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - (last || now)) / 1000, 0.05);
      last = now;
      const W = box.clientWidth;
      const H = box.clientHeight;
      if (!W || !H) return;
      const inp = input.current;
      t += dt;

      const m = Math.min(W, H);
      const R1 = m * 0.38;
      const R2 = m * 0.18;
      // ball size: as big as fits on the outer ring, capped
      const newSize = Math.round(Math.min(54, (2 * Math.PI * R1) / OUTER_COUNT - 6));
      const sizeChanged = newSize !== size;
      size = newSize;
      const r = size / 2;
      const cx = W / 2;
      const cy = H / 2;
      const spin = reduce ? 0 : 1;
      const innerCount = N - OUTER_COUNT;

      const xs = new Float32Array(N);
      const ys = new Float32Array(N);

      for (let i = 0; i < N; i++) {
        // place on its ring, running round the circle
        const outer = i < OUTER_COUNT;
        const idx = outer ? i : i - OUTER_COUNT;
        const count = outer ? OUTER_COUNT : innerCount;
        const a = (idx / count) * Math.PI * 2 + t * spin * (outer ? OUTER_SPEED : INNER_SPEED);
        const R = outer ? R1 : R2;
        xs[i] = cx + Math.cos(a) * R;
        ys[i] = cy + Math.sin(a) * R;
      }

      // ball under the cursor
      let best = -1;
      if (inp.hover) {
        let bd = r * 1.15;
        for (let i = 0; i < N; i++) {
          const d = Math.hypot(xs[i] - inp.x, ys[i] - inp.y);
          if (d < bd) { bd = d; best = i; }
        }
      }
      if (best !== nearest) {
        nearest = best;
        labelRefs.current.forEach((l, i) => l && (l.style.opacity = i === best ? '1' : '0'));
      }

      for (let i = 0; i < N; i++) {
        const el = ballRefs.current[i];
        if (!el) continue;
        if (sizeChanged) {
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
        }
        el.style.opacity = '1';
        el.style.transform = `translate3d(${(xs[i] - r).toFixed(1)}px,${(ys[i] - r).toFixed(1)}px,0) scale(${i === nearest ? 1.2 : 1})`;
        el.style.zIndex = i === nearest ? '5' : '1';
      }
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !visible) {
        visible = true;
        last = 0;
        raf = requestAnimationFrame(frame);
      } else if (!e.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(box);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const rc = e.currentTarget.getBoundingClientRect();
    input.current = { hover: true, x: e.clientX - rc.left, y: e.clientY - rc.top };
  };

  return (
    <section id="skills" className="relative py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Skills"
          title={<>Skills</>}
          description="Technical skills, frameworks, and databases."
        />

        <div className="mt-4">
        <div
          ref={boxRef}
          className="relative h-[420px] w-full touch-pan-y select-none overflow-hidden sm:h-[480px]"
          onPointerEnter={move}
          onPointerMove={move}
          onPointerDown={move}
          onPointerLeave={() => (input.current = { hover: false, x: -9999, y: -9999 })}
        >
          {/* soft glow at the centre of the circle */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />

          {RUNNING_ICONS.map((tech, i) => {
            const Icon = tech.icon as any;
            return (
              <div
                key={tech.name}
                ref={(el) => {
                  ballRefs.current[i] = el;
                }}
                style={{ opacity: 0, willChange: 'transform' }}
                className="absolute left-0 top-0"
              >
                <span
                  className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border bg-[radial-gradient(circle_at_32%_28%,#2a2a33,#101013_70%)] p-[18%] shadow-lg shadow-black/30 [&_svg]:h-full [&_svg]:w-full [&_div]:h-full [&_div]:w-full [&_div_span]:text-[9px] [&_div_span]:tracking-normal"
                  style={{ borderColor: `${tech.color}66`, boxShadow: `0 0 14px ${tech.color}30` }}
                >
                  {tech.iconPath ? (
                    <img src={tech.iconPath} alt="" draggable={false} className="h-full w-full rounded-full object-contain" />
                  ) : Icon ? (
                    <Icon />
                  ) : null}
                </span>

                {/* name, shown just below the ball while it is under the cursor */}
                <span
                  ref={(el) => {
                    labelRefs.current[i] = el;
                  }}
                  style={{ opacity: 0 }}
                  className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground transition-opacity duration-150"
                >
                  {tech.name}
                </span>
              </div>
            );
          })}
        </div>


          {/* every skill name, running in one line below the circle */}
          <div className="mt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max animate-[skillNames_45s_linear_infinite] motion-reduce:animate-none">
              {[0, 1, 2].map((copy) => (
                <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy > 0}>
                  {RUNNING_ICONS.map((t) => (
                    <li key={t.name} className="flex items-center whitespace-nowrap">
                      <span className="font-display text-xs font-semibold tracking-tight text-foreground sm:text-sm">
                        {t.name}
                      </span>
                      <span className="mx-3 text-[9px] text-accent" aria-hidden>
                        ✦
                      </span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes skillNames {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
      `}</style>
    </section>
  );
}
