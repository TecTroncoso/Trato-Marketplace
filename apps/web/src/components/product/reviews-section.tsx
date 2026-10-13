"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenLine } from "lucide-react";
import { toast } from "sonner";
import type { Review, ReviewSummary } from "@trato/shared";
import { Button } from "@/components/ui/button";
import { Rating, RatingInput } from "@/components/ui/rating";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { formatDate, initialsOf } from "@/lib/utils";

interface ReviewsPayload {
  summary: ReviewSummary;
  reviews: Review[];
}

export function ReviewsSection({ productId, initial, productTitle }: { productId: string; initial: ReviewsPayload; productTitle: string }) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  async function submit() {
    if (comment.trim().length < 5) {
      toast.error("Contanos un poco más sobre tu experiencia");
      return;
    }
    setSending(true);
    try {
      await apiFetch("/reviews", {
        method: "POST",
        token,
        body: { productId, rating, title: title.trim() || undefined, comment: comment.trim() },
      });
      const refreshed = await apiFetch<ReviewsPayload>(`/products/${productId}/reviews`);
      setData(refreshed);
      setOpen(false);
      setTitle("");
      setComment("");
      setRating(5);
      toast.success("¡Gracias por tu opinión!");
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSending(false);
    }
  }

  const { summary, reviews } = data;

  return (
    <section id="opiniones" className="rounded-xl bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-trato-ink">Opiniones del producto</h2>
        {user ? (
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            <PenLine /> Calificar este producto
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href="/ingresar">Ingresá para opinar</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
        <div className="text-center sm:text-left">
          <p className="text-4xl font-bold text-trato-ink">{summary.average.toFixed(1)}</p>
          <Rating value={summary.average} className="mt-1 justify-center sm:justify-start" size={16} />
          <p className="mt-1 text-xs text-trato-muted">
            {summary.total} {summary.total === 1 ? "opinión" : "opiniones"}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          {(["5", "4", "3", "2", "1"] as const).map((star) => {
            const count = summary.histogram[star] ?? 0;
            const percent = summary.total ? Math.round((count / summary.total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-trato-muted">
                <span className="w-3 text-right">{star}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                  <div className="h-full rounded-full bg-trato-gold" style={{ width: `${percent}%` }} />
                </div>
                <span className="w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {reviews.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-4 border-t border-trato-line pt-5">
          {reviews.map((review) => (
            <li key={review.id} className="flex gap-3">
              <Avatar className="size-9">
                {review.author.avatar ? <AvatarImage src={review.author.avatar} alt={review.author.name} /> : null}
                <AvatarFallback>{initialsOf(review.author.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-trato-ink">{review.author.name}</span>
                  <Rating value={review.rating} size={12} />
                  <span className="text-xs text-trato-muted">{formatDate(review.createdAt)}</span>
                </div>
                {review.title && <p className="mt-1 text-sm font-semibold text-trato-ink">{review.title}</p>}
                <p className="mt-0.5 text-sm text-trato-muted">{review.comment}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 border-t border-trato-line pt-5 text-sm text-trato-muted">
          Este producto todavía no tiene opiniones. ¡Sé el primero en calificarlo!
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calificar este producto</DialogTitle>
            <DialogDescription className="line-clamp-2">{productTitle}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-trato-muted">Tu calificación</p>
              <RatingInput value={rating} onChange={setRating} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-trato-muted">Título (opcional)</p>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej: Excelente calidad" />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-trato-muted">Tu opinión</p>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Contanos cómo fue tu experiencia con el producto…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="subtle" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={sending}>
              {sending ? "Publicando…" : "Publicar opinión"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
