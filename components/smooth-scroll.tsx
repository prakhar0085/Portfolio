'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    // the intro screen pauses scrolling; when it leaves, scrolling resumes from the very top
    const w = window as unknown as { __introLock?: boolean };
    if (w.__introLock) lenis.stop();
    const lock = () => lenis.stop();
    const unlock = () => {
      lenis.scrollTo(0, { immediate: true });
      lenis.start();
    };
    window.addEventListener('scroll-lock', lock);
    window.addEventListener('scroll-unlock', unlock);
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('scroll-lock', lock);
      window.removeEventListener('scroll-unlock', unlock);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
  return <>{children}</>;
}
