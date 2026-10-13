"use client";

import { CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const METHODS = [
  { label: "Tarjeta de crédito", detail: "Hasta 12 cuotas sin interés con bancos seleccionados." },
  { label: "Tarjeta de débito", detail: "Débito inmediato de tu cuenta." },
  { label: "Transferencia bancaria", detail: "Te enviamos CBU/CVU al confirmar el pedido." },
  { label: "Efectivo", detail: "Pagá en cualquiera de los puntos de pago Trato." },
];

const BADGES = ["Visa", "Mastercard", "Mercado Pago", "PayPal"];

export function PaymentCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)]">
      <div className="bg-gradient-to-br from-trato-navy-deep to-[#1d3a8f] p-4 text-white">
        <span className="flex size-10 items-center justify-center rounded-xl bg-white/15">
          <CreditCard className="size-5" />
        </span>
        <h3 className="mt-3 text-base font-bold leading-snug">Comprá ahora y pagá como quieras</h3>
        <p className="mt-1 text-xs text-white/75">Tarjetas, transferencias, efectivo y más.</p>
      </div>
      <div className="p-4">
        <Dialog>
          <DialogTrigger className="text-xs font-semibold text-trato-blue transition hover:underline">
            Ver medios de pago →
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Medios de pago</DialogTitle>
              <DialogDescription>Estos son los medios disponibles hoy en Trato.</DialogDescription>
            </DialogHeader>
            <ul className="flex flex-col gap-3">
              {METHODS.map((method) => (
                <li key={method.label}>
                  <p className="text-sm font-semibold text-trato-ink">{method.label}</p>
                  <p className="text-xs text-trato-muted">{method.detail}</p>
                </li>
              ))}
            </ul>
          </DialogContent>
        </Dialog>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {BADGES.map((badge) => (
            <span
              key={badge}
              className="rounded-md border border-trato-line bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-trato-muted"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
