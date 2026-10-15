"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote, Building2, CheckCircle2, CreditCard, MapPin, Truck } from "lucide-react";
import { toast } from "sonner";
import { PAYMENT_METHODS, type Address, type Order } from "@trato/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageContainer } from "@/components/ui/page-container";
import { Section } from "@/components/ui/section";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { selectCartSubtotal, useCartStore } from "@/store/cart-store";
import { useMounted } from "@/hooks/use-client";
import { cn, formatPrice } from "@/lib/utils";

const PAYMENT_ICONS: Record<string, typeof CreditCard> = {
  tarjeta_credito: CreditCard,
  tarjeta_debito: CreditCard,
  efectivo: Banknote,
  transferencia: Building2,
};

const INSTALLMENTS = [1, 3, 6, 12];

interface AddressForm {
  recipient: string;
  street: string;
  city: string;
  province: string;
  zip: string;
  phone: string;
}

const EMPTY_ADDRESS: AddressForm = { recipient: "", street: "", city: "", province: "", zip: "", phone: "" };

export default function CheckoutPage() {
  const router = useRouter();
  const mounted = useMounted();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore(selectCartSubtotal);
  const clear = useCartStore((state) => state.clear);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState("tarjeta_credito");
  const [installments, setInstallments] = useState("12");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<Address[]>("/users/me/addresses", { token })
      .then((list) => {
        setSavedAddresses(list);
        const preferred = list.find((item) => item.isDefault) ?? list[0];
        if (preferred) {
          setAddress({
            recipient: preferred.recipient,
            street: preferred.street,
            city: preferred.city,
            province: preferred.province,
            zip: preferred.zip,
            phone: preferred.phone ?? "",
          });
        }
      })
      .catch(() => setSavedAddresses([]));
  }, [token]);

  useEffect(() => {
    if (mounted && user && !address.recipient) {
      setAddress((current) => ({ ...current, recipient: user.name, phone: user.phone ?? "" }));
    }
  }, [mounted, user, address.recipient]);

  if (!mounted) {
    return (
      <PageContainer>
        <Skeleton className="h-72 w-full rounded-xl" />
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer padding="lg">
        <Section className="p-0">
          <EmptyState
            icon={CreditCard}
            title="Ingresá para completar tu compra"
            description="Necesitás una cuenta de Trato para finalizar el pedido y seguir el envío."
            action={
              <Button asChild variant="primary">
                <Link href="/ingresar">Ingresar</Link>
              </Button>
            }
          />
        </Section>
      </PageContainer>
    );
  }

  if (items.length === 0) {
    return (
      <PageContainer padding="lg">
        <Section className="p-0">
          <EmptyState
            icon={Truck}
            title="No hay productos para comprar"
            description="Agregá productos al carrito antes de pasar por el checkout."
            action={
              <Button asChild variant="yellow">
                <Link href="/buscar">Explorar productos</Link>
              </Button>
            }
          />
        </Section>
      </PageContainer>
    );
  }

  const isCard = paymentMethod === "tarjeta_credito" || paymentMethod === "tarjeta_debito";

  async function confirm() {
    if (address.recipient.trim().length < 3 || address.street.trim().length < 4 || address.city.trim().length < 2 || address.zip.trim().length < 4) {
      toast.error("Completá correctamente la dirección de envío");
      return;
    }
    if (isCard && (cardNumber.replace(/\s/g, "").length < 15 || cardName.trim().length < 3)) {
      toast.error("Completá los datos de la tarjeta");
      return;
    }
    setSubmitting(true);
    try {
      const order = await apiFetch<Order>("/orders/checkout", {
        method: "POST",
        token,
        body: {
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          paymentMethod,
          shippingMethod: "estandar",
          address: {
            recipient: address.recipient.trim(),
            street: address.street.trim(),
            city: address.city.trim(),
            province: address.province.trim() || "Buenos Aires",
            zip: address.zip.trim(),
            phone: address.phone.trim() || undefined,
          },
        },
      });
      clear();
      toast.success(`¡Compra confirmada! Pedido ${order.code}`, {
        description: "Podés seguir el estado desde Mis compras.",
      });
      router.push("/mis-compras");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <Link href="/carrito" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-trato-blue transition hover:underline">
        <ArrowLeft className="size-4" /> Volver al carrito
      </Link>
      <h1 className="mb-5 text-xl font-bold text-trato-ink sm:text-2xl">Finalizá tu compra</h1>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <Section>
            <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-trato-ink">
              <MapPin className="size-4 text-trato-blue" /> Dirección de envío
            </h2>
            {savedAddresses.length > 0 && (
              <div className="mb-4">
                <Label>Usar una dirección guardada</Label>
                <Select
                  onValueChange={(value) => {
                    const found = savedAddresses.find((item) => item.id === value);
                    if (found) {
                      setAddress({
                        recipient: found.recipient,
                        street: found.street,
                        city: found.city,
                        province: found.province,
                        zip: found.zip,
                        phone: found.phone ?? "",
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí una dirección" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedAddresses.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label} · {item.street}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="recipient">Nombre de quien recibe</Label>
                <Input id="recipient" value={address.recipient} onChange={(event) => setAddress({ ...address, recipient: event.target.value })} placeholder="Juan Pérez" />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={address.phone} onChange={(event) => setAddress({ ...address, phone: event.target.value })} placeholder="11 5555-5555" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="street">Calle y número</Label>
                <Input id="street" value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} placeholder="Av. Corrientes 1234, Piso 5" />
              </div>
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} placeholder="Capital Federal" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="province">Provincia</Label>
                  <Input id="province" value={address.province} onChange={(event) => setAddress({ ...address, province: event.target.value })} placeholder="Buenos Aires" />
                </div>
                <div>
                  <Label htmlFor="zip">Código postal</Label>
                  <Input id="zip" value={address.zip} onChange={(event) => setAddress({ ...address, zip: event.target.value })} placeholder="1043" />
                </div>
              </div>
            </div>
          </Section>

          <Section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-trato-ink">
              <Truck className="size-4 text-trato-blue" /> Envío
            </h2>
            <div className="flex items-center justify-between rounded-lg border border-trato-blue bg-trato-blue-soft px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-trato-ink">Envío estándar a domicilio</p>
                <p className="text-xs text-trato-muted">Llega mañana si comprás hoy</p>
              </div>
              <span className="text-sm font-bold text-trato-green">Gratis</span>
            </div>
          </Section>

          <Section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-trato-ink">
              <CreditCard className="size-4 text-trato-blue" /> Medio de pago
            </h2>
            <div className="flex flex-col gap-2">
              {PAYMENT_METHODS.map((method) => {
                const Icon = PAYMENT_ICONS[method.value] ?? CreditCard;
                const active = paymentMethod === method.value;
                return (
                  <label
                    key={method.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition",
                      active ? "border-trato-blue bg-trato-blue-soft" : "border-trato-line hover:border-trato-blue/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={active}
                      onChange={() => setPaymentMethod(method.value)}
                      className="accent-trato-blue"
                    />
                    <Icon className="size-4 text-trato-muted" />
                    <span className="flex-1 text-sm font-medium text-trato-ink">{method.label}</span>
                    {active && <CheckCircle2 className="size-4 text-trato-blue" />}
                  </label>
                );
              })}
            </div>

            {isCard && (
              <div className="mt-4 grid gap-3 rounded-lg bg-black/[0.02] p-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="cardNumber">Número de tarjeta</Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value.replace(/[^\d\s]/g, "").slice(0, 19))}
                    placeholder="4509 9535 6623 3704"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <Label htmlFor="cardName">Titular (como figura en la tarjeta)</Label>
                  <Input id="cardName" value={cardName} onChange={(event) => setCardName(event.target.value)} placeholder="Juan Pérez" />
                </div>
                <div>
                  <Label>Cuotas {paymentMethod === "tarjeta_credito" ? "sin interés" : ""}</Label>
                  <Select value={installments} onValueChange={setInstallments} disabled={paymentMethod === "tarjeta_debito"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTALLMENTS.map((count) => (
                        <SelectItem key={count} value={String(count)}>
                          {count === 1 ? "1 pago" : `${count} cuotas de ${formatPrice(Math.ceil(subtotal / count))}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-trato-muted sm:col-span-2">
                  Demo: no se realiza ningún cobro real. Usá cualquier número de prueba.
                </p>
              </div>
            )}

            {paymentMethod === "efectivo" && (
              <p className="mt-4 rounded-lg bg-black/[0.02] p-4 text-sm text-trato-muted">
                Vas a poder pagar en efectivo en cualquier punto de pago Trato una vez que confirmes la compra.
              </p>
            )}
            {paymentMethod === "transferencia" && (
              <p className="mt-4 rounded-lg bg-black/[0.02] p-4 text-sm text-trato-muted">
                Te enviaremos los datos bancarios (CBU/CVU) por email al confirmar el pedido.
              </p>
            )}
          </Section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Section>
            <h2 className="mb-4 text-base font-semibold text-trato-ink">Resumen</h2>
            <ul className="mb-4 flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.title} className="size-12 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs text-trato-ink">{item.title}</p>
                    <p className="text-xs text-trato-muted">Cantidad: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-trato-ink">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="flex flex-col gap-2 border-t border-trato-line pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-trato-muted">Subtotal</dt>
                <dd className="text-trato-ink">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-trato-muted">Envío</dt>
                <dd className="font-semibold text-trato-green">Gratis</dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-trato-line pt-3 text-base">
                <dt className="font-semibold text-trato-ink">Total</dt>
                <dd className="font-bold text-trato-ink">{formatPrice(subtotal)}</dd>
              </div>
            </dl>
            <Button size="lg" className="mt-5 w-full" onClick={confirm} disabled={submitting}>
              {submitting ? "Confirmando…" : "Confirmar compra"}
            </Button>
            <p className="mt-3 text-center text-xs text-trato-muted">
              Al confirmar aceptás los términos y condiciones de Trato.
            </p>
          </Section>
        </aside>
      </div>
    </PageContainer>
  );
}
