'use client';

import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { GithubLogo, LinkedinLogo, GmailLogo, LeetcodeLogo } from '@/components/social-icons';
import { SOCIAL_LINKS } from '@/lib/data';
import { MagneticButton } from '@/components/magnetic-button';
import { 
  JavaScriptIcon, TypeScriptIcon, ReactIcon, NodeIcon, PythonIcon, NextjsIcon, TailwindIcon, MongoIcon, PostgresIcon, AwsIcon, DockerIcon, GitIcon
} from '@/components/brand-icons';

const HERO_TECH = [
  { name: 'JavaScript', icon: JavaScriptIcon, iconPath: '/icons/JavaScript.svg', color: '#F7DF1E' },
  { name: 'TypeScript', icon: TypeScriptIcon, color: '#3178C6' },
  { name: 'React', icon: ReactIcon, iconPath: '/icons/React-Dark.svg', color: '#61DAFB' },
  { name: 'Node.js', icon: NodeIcon, iconPath: '/icons/NodeJS-Dark.svg', color: '#339933' },
  { name: 'Python', icon: PythonIcon, color: '#3776AB' },
  { name: 'Next.js', icon: NextjsIcon, color: '#FFFFFF' },
  { name: 'Tailwind CSS', icon: TailwindIcon, iconPath: '/icons/Tailwind CSS.png', color: '#38BDF8' },
  { name: 'MongoDB', icon: MongoIcon, iconPath: '/icons/MongoDB.svg', color: '#47A248' },
  { name: 'PostgreSQL', icon: PostgresIcon, iconPath: '/icons/PostgreSQL-Dark.svg', color: '#336791' },
  { name: 'AWS', icon: AwsIcon, iconPath: '/icons/AWS-Dark.svg', color: '#FF9900' },
  { name: 'Docker', icon: DockerIcon, iconPath: '/icons/Docker.svg', color: '#2496ED' },
  { name: 'Git', icon: GitIcon, color: '#F05032' },
];

// One word of the headline: rises out of a blur, a little after the word before it.
function HeroWord({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay: 0.15 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
      className="inline-block"
    >
      {children}
    </motion.span>
  );
}

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden pt-28 pb-16 sm:pt-36 flex flex-col justify-between">
      
      {/* Ambient background decoration mesh/grid */}
      <div className="absolute inset-0 -z-10 grid-bg opacity-[0.25]" />
      <div className="absolute top-[10%] right-[5%] -z-10 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] opacity-[0.08] blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-5xl px-6 w-full flex-1 flex flex-col justify-center">
        <div className="grid md:grid-cols-12 gap-12 md:gap-8 items-center w-full">
          
          {/* Left Column (Content) */}
          <div className="md:col-span-12 flex flex-col items-center text-center space-y-6">
            
            {/* Availability Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-fit flex items-center gap-2 rounded-full border border-border bg-foreground/[0.02] backdrop-blur-md px-3.5 py-1.5 text-xs text-secondary"
            >
              {/* <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span> */}
             
            </motion.div>

            {/* Headline H1 */}
            <h1 className="font-display text-[2.5rem] font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-[3.2rem] text-foreground">
              <HeroWord i={0}>Building</HeroWord>{' '}
              <HeroWord i={1}>scalable</HeroWord>{' '}
              <HeroWord i={2}>software</HeroWord>{' '}
              <HeroWord i={3}>and</HeroWord>
              <br className="hidden sm:block" />{' '}
              <HeroWord i={4}>
                {/* the gradient slowly slides through the word */}
                <motion.span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, var(--accent), #8B5CF6, #ec4899, #8B5CF6, var(--accent))',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                >
                  AI-powered
                </motion.span>
              </HeroWord>{' '}
              <HeroWord i={5}>products.</HeroWord>
            </h1>

            {/* Description/Bio */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl text-sm sm:text-base leading-relaxed text-secondary"
            >
              Full stack developer and AI engineer specializing in modern web technologies, cloud infrastructure, and intelligent systems.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 pt-2"
            >
              <MagneticButton
                href="#projects"
                as="a"
                className="rounded-lg bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                View My Work
              </MagneticButton>
              <MagneticButton
                href="https://drive.google.com/file/d/1mLL7UUazYPE2KeUnxZMqvlzk75Sh1FqY/view?usp=sharing"
                as="a"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border bg-foreground/[0.01] hover:bg-foreground/[0.04] px-4 py-2 text-xs font-semibold text-secondary hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                Download Resume <Download className="h-3.5 w-3.5" />
              </MagneticButton>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center justify-center gap-3 pt-2"
            >
              {/* GitHub */}
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-foreground/[0.02] transition-all duration-200 hover:-translate-y-0.5 hover:bg-foreground/[0.06] text-foreground hover:border-foreground/40"
              >
                <GithubLogo className="h-[18px] w-[18px]" />
              </a>
              {/* LinkedIn */}
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-foreground/[0.02] transition-all duration-200 hover:-translate-y-0.5 hover:bg-foreground/[0.06] text-[#0A66C2] hover:border-[#0A66C2]"
              >
                <LinkedinLogo className="h-[18px] w-[18px]" />
              </a>
              {/* Email */}
              <a
                href={SOCIAL_LINKS.email}
                target="_blank"
                rel="noreferrer"
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-foreground/[0.02] transition-all duration-200 hover:-translate-y-0.5 hover:bg-foreground/[0.06] text-[#EA4335] hover:border-[#EA4335]"
              >
                <GmailLogo className="h-[18px] w-[18px]" />
              </a>
              {/* LeetCode */}
              <a
                href={SOCIAL_LINKS.leetcode}
                target="_blank"
                rel="noreferrer"
                aria-label="LeetCode"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-foreground/[0.02] transition-all duration-200 hover:-translate-y-0.5 hover:bg-foreground/[0.06] text-[#FFA116] hover:border-[#FFA116]"
              >
                <LeetcodeLogo className="h-[18px] w-[18px]" />
              </a>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Technologies Section Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-20 w-full text-center space-y-6 shrink-0 z-10"
      >
        <div className="flex flex-col items-center mx-auto max-w-5xl px-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent font-bold select-none">
            Technologies I Work With
          </span>
          <div className="h-px w-8 bg-gradient-to-r from-transparent via-accent to-transparent mt-2.5" />
        </div>

        {/* Brand-styled infinite marquee - Edge-to-Edge Full Viewport Width */}
        <div className="w-full py-6 overflow-hidden relative border-y border-border/30 bg-foreground/[0.01] backdrop-blur-md [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="flex w-max gap-10 animate-[heroMarquee_35s_linear_infinite] hover:[animation-play-state:paused] cursor-pointer">
            {[...HERO_TECH, ...HERO_TECH, ...HERO_TECH, ...HERO_TECH].map((tech, i) => {
              const Icon = tech.icon;
              const iconPath = tech.iconPath;
              return (
                <div
                  key={`${tech.name}-${i}`}
                  className="flex flex-col items-center gap-3 shrink-0 select-none group/tech"
                >
                  {/* Icon Wrapper with glow */}
                  <div
                    style={{
                      ['--icon-glow' as any]: `${tech.color}15`
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-foreground/[0.01] backdrop-blur-md transition-all duration-300 group-hover/tech:scale-110 group-hover/tech:border-accent/30 group-hover/tech:shadow-[0_0_15px_var(--icon-glow)] [&_svg]:h-8 [&_svg]:w-8 [&_div]:h-8 [&_div]:w-8 [&_div_span]:text-[10px] [&_div_span]:tracking-normal"
                  >
                    {iconPath ? (
                      <img src={iconPath} alt={tech.name} className="h-8 w-8 object-contain" />
                    ) : (
                      <Icon />
                    )}
                  </div>
                  {/* Label */}
                  <span className="font-display text-[10px] font-bold tracking-wide text-secondary group-hover/tech:text-foreground transition-colors leading-none">
                    {tech.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes heroMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
      `}</style>
    </section>
  );
}
