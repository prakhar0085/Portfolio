'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, ArrowUpRight, Check, Copy } from 'lucide-react';
import { NAV_LINKS, SOCIAL_LINKS } from '@/lib/data';
import { GithubLogo, LinkedinLogo, GmailLogo, LeetcodeLogo } from '@/components/social-icons';

const EMAIL = SOCIAL_LINKS.email.replace('mailto:', '');

const SOCIALS = [
  { href: SOCIAL_LINKS.github, icon: GithubLogo, label: 'GitHub', color: 'var(--fg)' },
  { href: SOCIAL_LINKS.linkedin, icon: LinkedinLogo, label: 'LinkedIn', color: '#0A66C2' },
  { href: SOCIAL_LINKS.email, icon: GmailLogo, label: 'Email', color: '#EA4335' },
  { href: SOCIAL_LINKS.leetcode, icon: LeetcodeLogo, label: 'LeetCode', color: '#FFA116' },
];

export function Footer() {
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState('');

  // live local time in India
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = EMAIL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <footer className="relative overflow-hidden pt-10">
      <div className="mx-auto max-w-6xl px-6">
        {/* Call to action */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-tertiary">Have a project in mind?</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
              Let&apos;s build something
              <br />
              <span className="text-tertiary">worth shipping.</span>
            </h2>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <button
              type="button"
              onClick={copyEmail}
              className="group flex items-center gap-3 rounded-lg border border-border px-4 py-2.5 text-left transition-colors hover:bg-muted"
              aria-label="Copy email address"
            >
              <span className="font-mono text-sm text-foreground">{EMAIL}</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-secondary transition-colors group-hover:text-foreground">
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span key="ok" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    </motion.span>
                  ) : (
                    <motion.span key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                      <Copy className="h-3.5 w-3.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </button>
            <p className="h-4 font-mono text-[11px] text-tertiary" aria-live="polite">
              {copied ? 'Email copied to clipboard' : 'Click to copy'}
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="mt-12 grid gap-10 border-t border-border pt-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a href="#home" className="inline-flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background text-[11px] font-bold">
                PT
              </span>
              <span className="font-display text-sm font-semibold">Prakhar Tiwari</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-secondary">
              Full Stack Developer &amp; AI Engineer building AI-powered products from idea to production.
            </p>

            <div className="mt-5 flex gap-2">
              {SOCIALS.map(({ href, icon: Icon, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  aria-label={label}
                  style={{ color, ['--c' as any]: color }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-all duration-200 hover:-translate-y-1 hover:border-[var(--c)]"
                >
                  <Icon className="h-[17px] w-[17px]" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-widest text-tertiary">Quick links</h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="group inline-flex items-center gap-1.5 text-sm text-secondary transition-colors hover:text-foreground">
                    <span className="h-px w-0 bg-foreground transition-all duration-200 group-hover:w-3" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-widest text-tertiary">Get in touch</h3>
            <a
              href={SOCIAL_LINKS.email}
              className="group mt-4 inline-flex items-center gap-1 text-sm text-secondary transition-colors hover:text-foreground"
            >
              Send an email
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <p className="mt-2 text-sm text-tertiary">India · Remote worldwide</p>
            <p className="mt-3 inline-flex items-center gap-2 font-mono text-xs text-secondary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="tabular-nums">{time || '--:--:--'}</span> IST
            </p>
            <div className="mt-4">
              <a
                href="#contact"
                className="inline-flex items-center rounded-lg bg-foreground px-3.5 py-1.5 text-xs font-semibold text-background transition-opacity hover:opacity-90"
              >
                Hire me
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border py-5 sm:flex-row">
          <p className="font-mono text-xs text-tertiary">© {new Date().getFullYear()} Prakhar Tiwari. All rights reserved.</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group inline-flex items-center gap-1.5 font-mono text-xs text-tertiary transition-colors hover:text-foreground"
          >
            Back to top
            <ArrowUp className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
