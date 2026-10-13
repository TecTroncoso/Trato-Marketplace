"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircleQuestion, Send } from "lucide-react";
import { toast } from "sonner";
import type { Question } from "@trato/shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { formatDate, initialsOf } from "@/lib/utils";

export function QuestionsSection({
  productId,
  sellerId,
  initialQuestions,
}: {
  productId: string;
  sellerId: string;
  initialQuestions: Question[];
}) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isSeller = Boolean(user && user.id === sellerId);
  const [questions, setQuestions] = useState(initialQuestions);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerDraft, setAnswerDraft] = useState("");

  async function ask() {
    if (draft.trim().length < 5) {
      toast.error("Escribí una pregunta un poco más larga");
      return;
    }
    setSending(true);
    try {
      const created = await apiFetch<Question>("/questions", {
        method: "POST",
        token,
        body: { productId, question: draft.trim() },
      });
      setQuestions((current) => [created, ...current]);
      setDraft("");
      toast.success("¡Pregunta enviada! El vendedor te responderá a la brevedad.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function answer(questionId: string) {
    if (answerDraft.trim().length < 3) {
      toast.error("Escribí una respuesta válida");
      return;
    }
    try {
      const updated = await apiFetch<Question>(`/questions/${questionId}/answer`, {
        method: "POST",
        token,
        body: { answer: answerDraft.trim() },
      });
      setQuestions((current) => current.map((item) => (item.id === questionId ? updated : item)));
      setAnsweringId(null);
      setAnswerDraft("");
      toast.success("Respuesta publicada");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <section id="preguntas" className="rounded-xl bg-white p-5 shadow-[var(--shadow-card)]">
      <h2 className="mb-1 text-lg font-semibold text-trato-ink">Preguntas y respuestas</h2>
      <p className="mb-4 text-xs text-trato-muted">
        {questions.length > 0 ? `${questions.length} preguntas realizadas` : "Sé el primero en preguntar"}
      </p>

      {user ? (
        <div className="mb-5 rounded-lg bg-black/[0.03] p-3">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Escribí tu pregunta para el vendedor…"
            className="mb-2 min-h-16 bg-white"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={ask} disabled={sending}>
              <Send /> {sending ? "Enviando…" : "Preguntar"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-trato-blue-soft px-4 py-3 text-sm">
          <span className="text-trato-ink">Ingresá para hacer una pregunta al vendedor.</span>
          <Button asChild size="sm" variant="primary">
            <Link href="/ingresar?next=/">Ingresar</Link>
          </Button>
        </div>
      )}

      {questions.length === 0 ? (
        <p className="flex items-center gap-2 py-6 text-sm text-trato-muted">
          <MessageCircleQuestion className="size-4" /> Todavía no hay preguntas sobre este producto.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {questions.map((question) => (
            <li key={question.id} className="border-t border-trato-line pt-4 first:border-t-0 first:pt-0">
              <div className="flex gap-3">
                <Avatar className="size-8">
                  {question.author?.avatar ? <AvatarImage src={question.author.avatar} alt={question.author.name} /> : null}
                  <AvatarFallback>{question.author ? initialsOf(question.author.name) : "?"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-trato-ink">{question.question}</p>
                  <p className="mt-0.5 text-xs text-trato-muted">
                    {question.author?.name ?? "Usuario"} · {formatDate(question.createdAt)}
                  </p>

                  {question.answer ? (
                    <div className="mt-2 rounded-lg bg-black/[0.03] p-3">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-trato-muted">Respuesta del vendedor</p>
                      <p className="text-sm text-trato-ink">{question.answer}</p>
                    </div>
                  ) : isSeller ? (
                    <div className="mt-2">
                      {answeringId === question.id ? (
                        <div className="rounded-lg bg-trato-blue-soft p-3">
                          <Textarea
                            value={answerDraft}
                            onChange={(event) => setAnswerDraft(event.target.value)}
                            placeholder="Escribí tu respuesta…"
                            className="mb-2 min-h-14 bg-white"
                          />
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="subtle" onClick={() => setAnsweringId(null)}>
                              Cancelar
                            </Button>
                            <Button size="sm" onClick={() => answer(question.id)}>
                              Responder
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setAnsweringId(question.id)}>
                          Responder
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs italic text-trato-muted">Aún sin responder</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
