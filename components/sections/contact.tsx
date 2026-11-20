'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Loader2, ChevronRight, X, User, Mail, FileText, MapPin, Clock, Copy, Check, type LucideIcon } from 'lucide-react';
import { Reveal, SectionHeading } from '@/components/reveal';
import { SOCIAL_LINKS } from '@/lib/data';
import { GithubLogo, LinkedinLogo, GmailLogo, LeetcodeLogo } from '@/components/social-icons';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'sending' | 'success' | 'error';

// Banner colours. Swap these two to re-colour the whole banner (e.g. '#10b981' and '#34d399' for green).
const GLOW = '#6c63ff';
const GLOW_LIGHT = '#8b84ff';

const EMAIL = SOCIAL_LINKS.email.replace('mailto:', '');
const TOPICS = ['A project', 'A job', 'Freelance work', 'Just saying hi'] as const;
const MAX_MESSAGE = 1000;

// Little pieces that burst out of the tick when a message is sent (fixed values, so they never jump on re-render).
const CONFETTI = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2 + (i % 2) * 0.2;
  const dist = 70 + (i % 4) * 16;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    size: 5 + (i % 3) * 2,
    color: ['#8b84ff', '#d946ef', '#34d399', '#fbbf24'][i % 4],
    delay: (i % 5) * 0.03,
  };
});

export function Contact() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>(TOPICS[0]);
  const [msgLen, setMsgLen] = useState(0);
  const [copied, setCopied] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      /* clipboard not available: the address is still shown */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  useEffect(() => setMounted(true), []);

  const close = () => {
    clearTimeout(closeTimer.current);
    setOpen(false);
    // reset after the exit animation
    setTimeout(() => {
      setStatus('idle');
      setErrors({});
      setMsgLen(0);
    }, 300);
  };

  // Esc closes the pop-up and the page behind it doesn't scroll while it is open
  useEffect(() => {
    if (!open) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const validate = (form: HTMLFormElement) => {
    const next: Record<string, string> = {};
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const subject = (form.elements.namedItem('subject') as HTMLInputElement).value.trim();
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim();
    if (!name) next.name = 'Required';
    if (!email) next.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Invalid email';
    if (!subject) next.subject = 'Required';
    if (!message || message.length < 10) next.message = 'At least 10 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validate(form)) return;
    setStatus('sending');
    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
      if (serviceId && templateId && publicKey) {
        const emailjs = (await import('@emailjs/browser')).default;
        await emailjs.sendForm(serviceId, templateId, form, { publicKey });
      } else {
        await new Promise((r) => setTimeout(r, 1000));
      }
      form.reset();
      setMsgLen(0);
      setStatus('success');
      // show the success animation, then close the pop-up by itself
      closeTimer.current = setTimeout(close, 4500);
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="relative pb-0 pt-12 sm:pt-16">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Contact"
          title={<>Contact</>}
          description="Have a product in mind, a role to fill, or a hard problem? I read every message."
        />
      </div>

      <div className="mt-6 w-full">
        {/* Call-to-action banner: runs the full width of the page */}
        <Reveal>
          <div
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--bx', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--by', `${e.clientY - r.top}px`);
              e.currentTarget.style.setProperty('--bl', '1');
            }}
            onMouseLeave={(e) => e.currentTarget.style.setProperty('--bl', '0')}
            style={{ ['--bx' as any]: '50%', ['--by' as any]: '40%', ['--bl' as any]: '0' }}
            className="relative overflow-hidden border-y border-border bg-[#08080b] px-6 py-10 text-center text-[#f1f0ec] sm:py-14"
          >
            {/* soft spotlight under the cursor */}
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{ opacity: 'var(--bl)' as any, backgroundImage: `radial-gradient(circle 260px at var(--bx) var(--by), ${GLOW}2e, transparent 70%)` }}
            />
            {/* background: grid, corner glows, a sweeping line */}
            <div className="grid-bg absolute inset-0 opacity-[0.18]" />
            <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: GLOW }} />
            <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full opacity-25 blur-3xl" style={{ backgroundColor: GLOW }} />
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden>
              <path d="M0 330 C 160 120, 360 40, 520 60" fill="none" stroke={GLOW} strokeOpacity="0.28" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <path d="M520 360 C 700 330, 880 280, 1000 220" fill="none" stroke={GLOW} strokeOpacity="0.28" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>

            {/* content */}
            <div className="relative mx-auto flex max-w-2xl flex-col items-center">
              <h2 className="font-display text-2xl font-bold leading-[1.15] tracking-tight sm:text-4xl">
                <Words text="Have an idea? Let's build" />
                <br />
                <Words text="something" delay={0.25} />{' '}
                <motion.span
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(90deg, ${GLOW_LIGHT}, #d946ef)` }}
                >
                  amazing.
                </motion.span>
              </h2>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-4 max-w-md text-sm leading-relaxed"
                style={{ color: '#a9a9b5' }}
              >
                I&apos;m always open to discuss new projects, creative ideas, or opportunities to work together.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.65 }}
                className="mt-6 flex flex-col items-center gap-2.5"
              >
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background transition-all duration-200 hover:-translate-y-0.5"
                >
                  {/* light sweep on hover */}
                  <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 group-hover:translate-x-[400%]" />
                  <Send className="relative h-3.5 w-3.5" />
                  <span className="relative">Contact Me</span>
                  <ChevronRight className="relative h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </button>

                <p className="font-mono text-[11px]" style={{ color: '#8a8a97' }}>
                  Usually replies within a day
                </p>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Contact pop-up */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={close}
                  style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
                  className="absolute inset-0 backdrop-blur-sm"
                />

                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Contact me"
                  initial={{ opacity: 0, scale: 0.92, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                  className="relative grid max-h-[92vh] w-full max-w-2xl overflow-hidden overflow-y-auto rounded-xl border border-border bg-background shadow-2xl md:grid-cols-[0.8fr_1.2fr]"
                >
                  {/* Left: who / how to reach me */}
                  <div className="relative hidden flex-col justify-between overflow-hidden bg-[#08080b] p-6 text-[#f1f0ec] md:flex">
                    <div className="grid-bg absolute inset-0 opacity-[0.15]" />
                    <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: GLOW }} />
                    <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full opacity-25 blur-3xl" style={{ backgroundColor: GLOW }} />

                    <div className="relative">
                      <h3 className="font-display text-xl font-bold leading-tight tracking-tight">
                        Let&apos;s talk about
                        <br />
                        your <span style={{ color: GLOW_LIGHT }}>idea.</span>
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed" style={{ color: '#a9a9b5' }}>
                        Tell me what you&apos;re building. New projects, roles and freelance work are all welcome.
                      </p>
                    </div>

                    <div className="relative mt-6 space-y-2.5 text-sm">
                      <button
                        type="button"
                        onClick={copyEmail}
                        className="group flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.08]"
                      >
                        <GmailLogo className="h-4 w-4 shrink-0" style={{ color: '#EA4335' }} />
                        <span className="min-w-0 flex-1 truncate font-mono text-xs">{EMAIL}</span>
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />}
                      </button>
                      <p className="flex items-center gap-3 px-1 text-xs" style={{ color: '#a9a9b5' }}>
                        <MapPin className="h-4 w-4 shrink-0" /> India · Remote worldwide
                      </p>
                      <p className="flex items-center gap-3 px-1 text-xs" style={{ color: '#a9a9b5' }}>
                        <Clock className="h-4 w-4 shrink-0" /> Usually replies within a day
                      </p>
                      <div className="flex gap-2 pt-2">
                        {[
                          { href: SOCIAL_LINKS.github, icon: GithubLogo, label: 'GitHub', color: '#f1f0ec' },
                          { href: SOCIAL_LINKS.linkedin, icon: LinkedinLogo, label: 'LinkedIn', color: '#0A66C2' },
                          { href: SOCIAL_LINKS.leetcode, icon: LeetcodeLogo, label: 'LeetCode', color: '#FFA116' },
                        ].map(({ href, icon: Icon, label, color }) => (
                          <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={label}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.08]"
                            style={{ color }}
                          >
                            <Icon className="h-4 w-4" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: the form (or the success animation) */}
                  <div className="relative p-5 sm:p-6">
                    <button
                      type="button"
                      onClick={close}
                      aria-label="Close"
                      className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-border text-secondary transition-colors hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <AnimatePresence mode="wait" initial={false}>
                      {status === 'success' ? (
                        <SuccessView key="ok" onClose={close} />
                      ) : (
                        <motion.form
                          key="form"
                          onSubmit={onSubmit}
                          noValidate
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, y: -8 }}
                        >
                          <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">Send me a message</h3>
                          <p className="mt-0.5 text-xs text-secondary">Fill this in and it lands straight in my inbox.</p>

                          {/* what is it about */}
                          <div className="mt-4">
                            <p className="mb-1.5 font-mono text-[11px] text-tertiary">I&apos;m interested in</p>
                            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Topic">
                              {TOPICS.map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  role="radio"
                                  aria-checked={topic === t}
                                  onClick={() => setTopic(t)}
                                  className={cn(
                                    'rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all duration-200',
                                    topic === t ? 'border-transparent bg-foreground text-background' : 'border-border text-secondary hover:text-foreground',
                                  )}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                            <input type="hidden" name="topic" value={topic} />
                          </div>

                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <Field label="Name" name="name" icon={User} error={errors.name} placeholder="Ada Lovelace" />
                            <Field label="Email" name="email" type="email" icon={Mail} error={errors.email} placeholder="ada@compute.io" />
                          </div>
                          <Field label="Subject" name="subject" icon={FileText} error={errors.subject} placeholder="Let's ship an AI product" className="mt-3" />

                          <div className="mt-3">
                            <div className="mb-1 flex items-center justify-between">
                              <label className="font-mono text-[11px] text-tertiary">Message</label>
                              <span className="font-mono text-[11px] tabular-nums text-tertiary">{msgLen}/{MAX_MESSAGE}</span>
                            </div>
                            <textarea
                              name="message"
                              rows={3}
                              maxLength={MAX_MESSAGE}
                              onChange={(e) => setMsgLen(e.target.value.length)}
                              placeholder="Tell me about the project, role, or idea…"
                              className={cn(
                                'w-full resize-none rounded-lg hairline bg-background px-3 py-2 text-xs outline-none transition-colors placeholder:text-tertiary focus:border-[#8b84ff]',
                                errors.message && 'border-red-400/50',
                              )}
                            />
                            {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
                          </div>

                          {status === 'error' && (
                            <p className="mt-3 text-xs text-red-400">Something went wrong sending your message. Please try again.</p>
                          )}

                          <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                          >
                            {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            {status === 'sending' ? 'Sending…' : status === 'error' ? 'Try again' : 'Send message'}
                          </button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}

// Reveals a line of text one word at a time when it scrolls into view.
function Words({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      {text.split(' ').map((w, i, arr) => (
        <motion.span
          key={`${w}-${i}`}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: delay + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
        >
          {w}
          {i < arr.length - 1 ? '\u00a0' : ''}
        </motion.span>
      ))}
    </>
  );
}

// Shown after the message is sent: a ring, a tick that draws itself, and a small burst of confetti.
function SuccessView({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center px-2 py-6 text-center"
      aria-live="polite"
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* expanding rings */}
        {[0, 0.25].map((d) => (
          <motion.span
            key={d}
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: 2.1, opacity: 0 }}
            transition={{ duration: 1.3, delay: d, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: GLOW_LIGHT }}
          />
        ))}

        {/* confetti */}
        {CONFETTI.map((c, i) => (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ x: c.x, y: c.y, opacity: [1, 1, 0], scale: [0, 1, 0.8], rotate: 180 }}
            transition={{ duration: 1.1, delay: 0.35 + c.delay, ease: 'easeOut' }}
            className="absolute rounded-sm"
            style={{ width: c.size, height: c.size, backgroundColor: c.color }}
          />
        ))}

        {/* disc + drawn tick */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 220 }}
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundImage: `linear-gradient(135deg, ${GLOW_LIGHT}, ${GLOW})`, boxShadow: `0 10px 30px ${GLOW}66` }}
        >
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>
      </div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 font-display text-xl font-semibold tracking-tight text-foreground"
      >
        Message sent!
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-1.5 max-w-xs text-sm text-secondary"
      >
        Thanks for reaching out. I&apos;ll get back to you within a day.
      </motion.p>
      <motion.button
        type="button"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-6 rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
      >
        Close
      </motion.button>
    </motion.div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  error,
  placeholder,
  className,
  icon: Icon,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  placeholder?: string;
  className?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block font-mono text-[11px] text-tertiary">{label}</label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-tertiary" />}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg hairline bg-background py-2 pr-3 text-xs outline-none transition-colors placeholder:text-tertiary focus:border-[#8b84ff]',
            Icon ? 'pl-8' : 'pl-3',
            error && 'border-red-400/50',
          )}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
