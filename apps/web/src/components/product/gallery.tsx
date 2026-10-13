"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const current = images[index] ?? images[0];
  const [failed, setFailed] = useState(false);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        {images.length > 1 && (
          <div className="hidden w-14 shrink-0 flex-col gap-2 sm:flex">
            {images.map((image, imageIndex) => (
              <button
                key={image}
                type="button"
                onMouseEnter={() => setIndex(imageIndex)}
                onClick={() => setIndex(imageIndex)}
                className={cn(
                  "aspect-square overflow-hidden rounded-md border bg-white transition",
                  imageIndex === index ? "border-trato-blue ring-1 ring-trato-blue" : "border-trato-line hover:border-trato-blue/60",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={`Vista ${imageIndex + 1}`} className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div
          className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-lg bg-white"
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={handleMove}
        >
          {current && !failed ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={current}
                src={current}
                alt={title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onError={() => setFailed(true)}
                className="size-full object-cover transition-transform duration-200"
                style={{ transform: zoom ? "scale(2)" : "scale(1)", transformOrigin: origin }}
              />
            </AnimatePresence>
          ) : (
            <div className="flex size-full items-center justify-center text-trato-muted">
              <ImageOff className="size-10" />
            </div>
          )}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2 sm:hidden">
          {images.map((image, imageIndex) => (
            <button
              key={image}
              type="button"
              onClick={() => setIndex(imageIndex)}
              className={cn(
                "size-2.5 rounded-full transition",
                imageIndex === index ? "bg-trato-blue" : "bg-black/20",
              )}
              aria-label={`Ver imagen ${imageIndex + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
