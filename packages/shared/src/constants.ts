export const CURRENCY = "ARS";

export const SORT_OPTIONS = [
  { value: "relevance", label: "Más relevantes" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "sold_desc", label: "Más vendidos" },
  { value: "rating_desc", label: "Mejores opiniones" },
  { value: "newest", label: "Más nuevos" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const CONDITIONS = [
  { value: "nuevo", label: "Nuevo" },
  { value: "usado", label: "Usado" },
] as const;

export const ORDER_STATUSES: Record<string, { label: string; tone: "warning" | "info" | "success" | "danger" | "neutral" }> = {
  confirmado: { label: "Pago confirmado", tone: "info" },
  preparando: { label: "Preparando envío", tone: "info" },
  enviado: { label: "En camino", tone: "warning" },
  entregado: { label: "Entregado", tone: "success" },
  cancelado: { label: "Cancelado", tone: "danger" },
};

export const SELLER_STATUSES = ["MercadoLíder Platinum", "MercadoLíder Gold", "MercadoLíder", null] as const;

export const PAYMENT_METHODS = [
  { value: "tarjeta_credito", label: "Tarjeta de crédito", icon: "credit-card" },
  { value: "tarjeta_debito", label: "Tarjeta de débito", icon: "credit-card" },
  { value: "efectivo", label: "Efectivo en punto de pago", icon: "banknote" },
  { value: "transferencia", label: "Transferencia bancaria", icon: "arrow-left-right" },
] as const;

export const INSTALLMENT_PLANS = [1, 3, 6, 12] as const;

export const MAX_INSTALLMENTS = 12;
