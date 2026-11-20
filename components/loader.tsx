'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ACCENT = '#6c63ff'; // the site's accent colour
const ACCENT_LIGHT = '#8b84ff';
const ACCENT_RGB = '108,99,255';

// The same purple -> violet -> pink gradient the home page headline uses ("AI-powered"), as one colour per letter.
const STOPS = [
  [108, 99, 255],
  [139, 92, 246],
  [236, 72, 153],
];
function gradientAt(t: number) {
  const x = t * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(x));
  const f = x - i;
  const c = STOPS[i].map((v, k) => Math.round(v + (STOPS[i + 1][k] - v) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// One line of the headline. Letters rise out of a blur, one after another, exactly like the home page
// headline does; afterwards the cursor pushes them around and lights them up (see the effect below).
function Line({ text, delay, gradient }: { text: string; delay: number; gradient?: boolean }) {
  const n = text.length;
  return (
    <span className="block" aria-hidden>
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: delay + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
          style={gradient ? { color: gradientAt(n > 1 ? i / (n - 1) : 0) } : undefined}
        >
          <span data-letter className="inline-block will-change-transform">
            {ch === ' ' ? ' ' : ch}
          </span>
        </motion.span>
      ))}
    </span>
  );
}

export function Loader() {
  const [done, setDone] = useState(false);
  const [reduce, setReduce] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: -9999, y: -9999, inside: false });
  const doneRef = useRef(false);
  doneRef.current = done;
  const lastWheel = useRef(0);

  // remember when the visitor last scrolled, so the page is only handed back once any trackpad momentum has died down
  useEffect(() => {
    const onWheel = () => (lastWheel.current = Date.now());
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const r = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduce(r);
  }, []);

  // Scrolling down (mouse wheel, swipe up, arrow / page keys) lifts the intro away. A click works too.
  useEffect(() => {
    if (done) return;
    const enter = () => setDone(true);
    const onWheel = (e: WheelEvent) => e.deltaY > 4 && enter();
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => (startY = e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => startY - e.touches[0].clientY > 30 && enter();
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', 'End', ' ', 'Enter'].includes(e.key)) enter();
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [done]);

  // the page behind doesn't scroll while the intro is showing
  useEffect(() => {
    if (done) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    // freeze the page at the top (the smooth-scroll library would otherwise keep scrolling it behind the intro)
    const w = window as unknown as { __introLock?: boolean };
    w.__introLock = true;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event('scroll-lock'));
    // give the page back only after the intro has slid away, so the scroll that opened it doesn't also move the page
    return () => {
      const release = () => {
        if (!doneRef.current) return; // only when the intro has really gone
        // still scrolling (trackpad momentum)? wait a little longer
        if (Date.now() - lastWheel.current < 300) {
          setTimeout(release, 120);
          return;
        }
        document.body.style.overflow = prevBody;
        document.documentElement.style.overflow = prevHtml;
        w.__introLock = false;
        window.scrollTo(0, 0);
        window.dispatchEvent(new Event('scroll-unlock'));
      };
      setTimeout(release, 1100);
    };
  }, [done]);

  // letters get pushed away from the cursor, grow a little and light up
  useEffect(() => {
    if (done || reduce) return;
    const root = rootRef.current;
    if (!root) return;
    const letters = Array.from(root.querySelectorAll<HTMLElement>('[data-letter]'));
    const st = letters.map(() => ({ x: 0, y: 0, s: 1, g: 0 }));
    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - (last || now)) / 1000, 0.05);
      last = now;
      const m = pointer.current;
      const f = Math.min(1, dt * 10);
      letters.forEach((el, i) => {
        const o = st[i];
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 - o.x;
        const cy = rect.top + rect.height / 2 - o.y;
        let tx = 0;
        let ty = 0;
        let ts = 1;
        let tg = 0;
        if (m.inside) {
          const dx = cx - m.x;
          const dy = cy - m.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < 130) {
            const k = 1 - dist / 130;
            tx = (dx / dist) * k * 22;
            ty = (dy / dist) * k * 22;
            ts = 1 + k * 0.12;
            tg = k;
          }
        }
        o.x += (tx - o.x) * f;
        o.y += (ty - o.y) * f;
        o.s += (ts - o.s) * f;
        o.g += (tg - o.g) * f;
        el.style.transform = `translate(${o.x.toFixed(1)}px,${o.y.toFixed(1)}px) scale(${o.s.toFixed(3)})`;
        if (o.g > 0.05) {
          el.style.color = ACCENT_LIGHT;
          el.style.textShadow = `0 0 ${Math.round(30 * o.g)}px rgba(${ACCENT_RGB},${o.g.toFixed(2)})`;
        } else {
          el.style.color = '';
          el.style.textShadow = '';
        }
      });
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [done, reduce]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          ref={rootRef}
          role="status"
          aria-label="Loading portfolio"
          onClick={() => setDone(true)}
          onPointerMove={(e) => (pointer.current = { x: e.clientX, y: e.clientY, inside: true })}
          onPointerLeave={() => (pointer.current = { x: -9999, y: -9999, inside: false })}
          className="fixed inset-0 z-[200] flex cursor-pointer items-center justify-center overflow-hidden bg-background px-6 text-center text-foreground"
          // hand-over: the whole screen slides up and away, revealing the portfolio
          exit={{ y: '-100%' }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* the same backdrop as the home page: faint grid and a soft accent glow */}
          <div className="absolute inset-0 grid-bg opacity-[0.25]" />
          <div className="pointer-events-none absolute right-[5%] top-[10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] opacity-[0.08] blur-3xl" />

          <motion.div
            className="relative flex flex-col items-center"
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* same type as the home page headline */}
            {reduce ? (
              <h1 className="font-display text-[2.5rem] font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-[3.2rem]">
                Hello, I&apos;m Prakhar.
              </h1>
            ) : (
              <h1
                className="font-display text-[2.5rem] font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-[3.2rem]"
                aria-label="Hello, I'm Prakhar."
              >
                <Line text="Hello, I'm" delay={0.2} />
                <Line text="Prakhar." delay={0.5} gradient />
              </h1>
            )}

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduce ? 0.1 : 1.1 }}
              className="mt-6 font-display text-base font-semibold tracking-tight sm:text-xl"
            >
              Full Stack Developer &amp; AI Engineer
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduce ? 0.2 : 1.3 }}
              className="mt-2 max-w-xl text-sm leading-relaxed text-secondary sm:text-base"
            >
              Crafting digital experiences that matter.
            </motion.p>
            {/* glowing accent line: draws out from the middle, then a bright spark keeps running along it */}
            <div className="relative mt-9 h-px w-[min(70vw,360px)]">
              <motion.div
                className="absolute inset-0 origin-center"
                style={{
                  backgroundImage: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
                  boxShadow: `0 0 14px 1px ${ACCENT}aa, 0 0 34px 4px ${ACCENT}55`,
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: reduce ? 0.3 : 1.1, delay: reduce ? 0.2 : 1.0, ease: [0.16, 1, 0.3, 1] }}
              />
              {!reduce && (
                <motion.div
                  className="absolute -top-px h-[3px] w-20 rounded-full"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, transparent, #fff, transparent)',
                    boxShadow: `0 0 18px 4px ${ACCENT}`,
                  }}
                  initial={{ left: '-20%', opacity: 0 }}
                  animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.6, delay: 2.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.4 }}
                />
              )}
            </div>
          </motion.div>


          {/* scroll cue */}
          <motion.div
            className="absolute bottom-7 left-0 right-0 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: reduce ? 0.3 : 1.8, duration: 0.6 }}
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-tertiary">Scroll</span>
            <span className="relative flex h-9 w-[22px] justify-center rounded-full border-2 border-foreground opacity-60">
              <motion.span
                className="mt-1.5 h-1.5 w-1 rounded-full bg-foreground"
                animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
