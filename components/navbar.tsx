'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS, SOCIAL_LINKS } from '@/lib/data';
import { MagneticButton } from '@/components/magnetic-button';
import { ThemeToggle } from '@/components/cursor';
import { CommandPalette } from '@/components/command-palette';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('#home');
  const [navDark, setNavDark] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
      // Light-on-dark while the bar sits over a dark pinned section (e.g. the project room).
      const el = document.querySelector('[data-nav-dark="true"]');
      const r = el?.getBoundingClientRect();
      setNavDark(!!r && r.top <= 40 && r.bottom >= 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-2"
        style={
          navDark
            ? ({ '--bg': '#0a0a0a', '--fg': '#ededed', '--fg-secondary': '#a1a1a1', '--fg-tertiary': '#8a8a8a', '--border': 'rgba(255,255,255,0.12)' } as React.CSSProperties)
            : undefined
        }
      >
        <nav
          className={cn(
            'flex w-full max-w-[60rem] items-center justify-between gap-2 rounded-full px-2.5 py-1 transition-all duration-300',
            scrolled ? 'hairline bg-background/70 backdrop-blur-xl' : 'border border-transparent',
          )}
        >
          <ul className="hidden md:flex items-center gap-0.5 text-[13px]">
            {NAV_LINKS.slice(0, 8).map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn(
                    'relative rounded-md px-2 py-1 font-medium transition-colors',
                    active === link.href
                      ? 'text-foreground'
                      : 'text-tertiary hover:text-foreground',
                  )}
                >
                  {active === link.href && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-md bg-foreground/[0.06]"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            <div className="hidden md:block">
              <CommandPalette />
            </div>
            <ThemeToggle />
            <a
              href="https://drive.google.com/file/d/1mLL7UUazYPE2KeUnxZMqvlzk75Sh1FqY/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center rounded-md hairline px-2.5 py-1 text-[11px] font-medium text-secondary hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
            >
              Resume
            </a>
            <MagneticButton
              href="#contact"
              as="a"
              className="rounded-md bg-foreground text-background px-3 py-1 text-[11px] font-semibold hover:opacity-90 transition-opacity"
            >
              Hire Me
            </MagneticButton>
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="md:hidden flex h-7 w-7 items-center justify-center rounded-md hairline text-secondary"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] md:hidden"
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 34 }}
              className="absolute right-0 top-0 h-full w-72 max-w-[85vw] surface p-5 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-sm font-semibold">Menu</span>
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-md hairline"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-secondary hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="mt-auto flex gap-3 pt-4 text-xs text-tertiary hairline-t">
                <a href={SOCIAL_LINKS.github} target="_blank" rel="noreferrer">GitHub</a>
                <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                <a href={SOCIAL_LINKS.email}>Email</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
