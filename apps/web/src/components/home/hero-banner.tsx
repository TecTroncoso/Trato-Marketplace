"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@trato/shared";
import { cn } from "@/lib/utils";

const THEMES: Record<Banner["theme"], string> = {
  yellow: "from-[#0f1a3f] via-[#16224f] to-[#1d3a8f]",
  blue: "from-[#101c4a] via-[#1746a2] to-[#2563eb]",
  green: "from-[#0c2434] via-[#0f4a5c] to-[#0f8f5a]",
};

const COLLAGE_LAYOUT = [
  "left-[4%] top-[4%] w-[44%] -rotate-6",
  "left-[40%] top-[-2%] w-[36%] rotate-3",
  "left-[14%] top-[46%] w-[32%] rotate-2",
  "left-[62%] top-[40%] w-[36%] -rotate-3",
];

export function HeroBanner({ banners, collage }: { banners: Banner[]; collage: string[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % banners.length), 7000);
    return () => clearInterval(timer);
  }, [banners.length, paused]);

  if (!banners.length) return null;
  const banner = banners[index];
  const go = (direction: 1 | -1) => setIndex((current) => (current + direction + banners.length) % banners.length);

  return (
    <section
      aria-label="Promociones destacadas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br shadow-[var(--shadow-card)]", THEMES[banner.theme])}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 size-72 rounded-full bg-trato-blue/20 blur-3xl" />

      <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="mb-2 inline-block text-xs font-bold uppercase tracking-[0.18em] text-white/70">
              {banner.eyebrow}
            </span>
            <h1 className="max-w-xl text-2xl font-extrabold leading-tight text-white sm:text-4xl">{banner.title}</h1>
            <p className="mt-3 max-w-lg text-sm text-white/75 sm:text-base">{banner.subtitle}</p>
            <Link
              href={banner.href}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-trato-navy transition hover:gap-3 hover:brightness-95"
            >
              {banner.cta}
              <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </AnimatePresence>

        <div className="relative hidden h-[250px] lg:block">
          {collage.slice(0, 4).map((source, tileIndex) => (
            <motion.img
              key={source}
              src={source}
              alt=""
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 * tileIndex, duration: 0.4 }}
              className={cn(
                "absolute aspect-square rounded-2xl border border-white/20 object-cover shadow-[0_20px_45px_-20px_rgba(0,0,0,0.7)]",
                COLLAGE_LAYOUT[tileIndex],
              )}
            />
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Banner anterior"
            className="absolute left-3 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 sm:flex"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Banner siguiente"
            className="absolute right-3 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 sm:flex"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((item, dotIndex) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Ver banner ${dotIndex + 1}`}
                onClick={() => setIndex(dotIndex)}
                className={cn("h-1.5 rounded-full transition-all", dotIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/40")}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
