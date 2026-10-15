"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, MapPin, Package, Pause, Play, Plus, Trash2, User as UserIcon, Wallet } from "lucide-react";
import { toast } from "sonner";
import type { Address, Order, ProductSummary, User } from "@trato/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderCard } from "@/components/account/order-card";
import { EmptyState } from "@/components/ui/empty-state";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Section } from "@/components/ui/section";
import { formatDate, formatPrice } from "@/lib/utils";

interface MyProduct extends ProductSummary {
  status?: string;
  createdAt?: string;
}

const TABS = ["perfil", "direcciones", "publicaciones", "ventas"] as const;
type TabValue = (typeof TABS)[number];

export function AccountTabs() {
  const user = useAuthStore((state) => state.user)!;
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const [tab, setTab] = useState<TabValue>("perfil");

  const [profile, setProfile] = useState({ name: user.name, phone: user.phone ?? "", location: user.location ?? "", sellerName: user.sellerName ?? "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState({ label: "Casa", recipient: user.name, street: "", city: "", province: "", zip: "", phone: "" });

  const [products, setProducts] = useState<MyProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("tab");
    if (requested && (TABS as readonly string[]).includes(requested)) {
      setTab(requested as TabValue);
    }
  }, []);

  const loadAddresses = useCallback(() => {
    if (!token) return;
    apiFetch<Address[]>("/users/me/addresses", { token }).then(setAddresses).catch(() => setAddresses([]));
  }, [token]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  useEffect(() => {
    if (!token || tab !== "publicaciones") return;
    apiFetch<MyProduct[]>("/products/mine", { token }).then(setProducts).catch(() => setProducts([]));
  }, [token, tab]);

  useEffect(() => {
    if (!token || tab !== "ventas") return;
    apiFetch<Order[]>("/orders/sales", { token }).then(setOrders).catch(() => setOrders([]));
  }, [token, tab]);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const updated = await apiFetch<User>("/users/me", { method: "PATCH", token, body: profile });
      setUser(updated);
      toast.success("Datos actualizados");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function addAddress() {
    if (newAddress.street.trim().length < 4 || newAddress.city.trim().length < 2 || newAddress.zip.trim().length < 4) {
      toast.error("Completá la dirección correctamente");
      return;
    }
    try {
      await apiFetch<Address>("/users/me/addresses", { method: "POST", token, body: newAddress });
      toast.success("Dirección agregada");
      setNewAddress({ label: "Casa", recipient: user.name, street: "", city: "", province: "", zip: "", phone: "" });
      loadAddresses();
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function removeAddress(id: string) {
    try {
      await apiFetch(`/users/me/addresses/${id}`, { method: "DELETE", token });
      setAddresses((current) => current.filter((item) => item.id !== id));
      toast.success("Dirección eliminada");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function makeDefault(id: string) {
    try {
      await apiFetch(`/users/me/addresses/${id}/default`, { method: "PUT", token });
      loadAddresses();
      toast.success("Dirección predeterminada actualizada");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function toggleProduct(product: MyProduct) {
    try {
      const result = await apiFetch<{ id: string; status: string }>(`/products/${product.id}/pause`, { method: "PUT", token });
      setProducts((current) => current.map((item) => (item.id === result.id ? { ...item, status: result.status } : item)));
      toast.success(result.status === "active" ? "Publicación reactivada" : "Publicación pausada");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-[1000px] px-3 py-6 sm:px-4">
      <h1 className="mb-1 text-xl font-bold text-trato-ink sm:text-2xl">Mi cuenta</h1>
      <p className="mb-5 text-sm text-trato-muted">
        {user.name} · {user.email}
      </p>

      <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
        <TabsList className="mb-5 overflow-x-auto">
          <TabsTrigger value="perfil">
            <UserIcon className="mr-1.5 size-4" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="direcciones">
            <MapPin className="mr-1.5 size-4" /> Direcciones
          </TabsTrigger>
          <TabsTrigger value="publicaciones">
            <Package className="mr-1.5 size-4" /> Mis publicaciones
          </TabsTrigger>
          <TabsTrigger value="ventas">
            <Wallet className="mr-1.5 size-4" /> Mis ventas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <Section>
            <h2 className="mb-4 text-base font-semibold text-trato-ink">Datos personales</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Nombre completo</Label>
                <Input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="11 5555-5555" />
              </div>
              <div>
                <Label>Ubicación</Label>
                <Input value={profile.location} onChange={(event) => setProfile({ ...profile, location: event.target.value })} placeholder="Capital Federal" />
              </div>
              <div>
                <Label>Nombre de vendedor</Label>
                <Input value={profile.sellerName} onChange={(event) => setProfile({ ...profile, sellerName: event.target.value })} placeholder="Mi tienda" />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="direcciones">
          <div className="flex flex-col gap-4">
{addresses.length > 0 && (
          <Section>
            <h2 className="mb-3 text-base font-semibold text-trato-ink">Direcciones guardadas</h2>
                <ul className="flex flex-col gap-3">
                  {addresses.map((address) => (
                    <li key={address.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-trato-line p-3">
                      <div>
                        <p className="text-sm font-semibold text-trato-ink">
                          {address.label}
                          {address.isDefault && <Badge variant="blue" className="ml-2 normal-case">Predeterminada</Badge>}
                        </p>
                        <p className="text-xs text-trato-muted">
                          {address.recipient} · {address.street} · {address.city}, {address.province} ({address.zip})
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!address.isDefault && (
                          <Button size="sm" variant="ghost" onClick={() => makeDefault(address.id)}>
                            Usar por defecto
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => removeAddress(address.id)}>
                          <Trash2 />
                        </Button>
                      </div>
                    </li>
                  ))}
                 </ul>
               </Section>
             )}

            <Section>
              <h2 className="mb-4 text-base font-semibold text-trato-ink">Agregar dirección</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Etiqueta</Label>
                  <Input value={newAddress.label} onChange={(event) => setNewAddress({ ...newAddress, label: event.target.value })} placeholder="Casa / Trabajo" />
                </div>
                <div>
                  <Label>Quien recibe</Label>
                  <Input value={newAddress.recipient} onChange={(event) => setNewAddress({ ...newAddress, recipient: event.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Calle y número</Label>
                  <Input value={newAddress.street} onChange={(event) => setNewAddress({ ...newAddress, street: event.target.value })} />
                </div>
                <div>
                  <Label>Ciudad</Label>
                  <Input value={newAddress.city} onChange={(event) => setNewAddress({ ...newAddress, city: event.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Provincia</Label>
                    <Input value={newAddress.province} onChange={(event) => setNewAddress({ ...newAddress, province: event.target.value })} />
                  </div>
                  <div>
                    <Label>Código postal</Label>
                    <Input value={newAddress.zip} onChange={(event) => setNewAddress({ ...newAddress, zip: event.target.value })} />
                  </div>
                </div>
              </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={addAddress}>
                <Plus /> Agregar dirección
              </Button>
            </div>
          </Section>
          </div>
        </TabsContent>

        <TabsContent value="publicaciones">
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <Button asChild variant="yellow">
                <Link href="/vender">
                  <Plus /> Publicar producto
                </Link>
              </Button>
            </div>
            {products.length === 0 ? (
              <div className="rounded-xl bg-white shadow-[var(--shadow-card)]">
                <EmptyState
                  icon={Package}
                  title="No tenés publicaciones"
                  description="Publicá tu primer producto y empezá a vender en Trato."
                  action={
                    <Button asChild variant="primary">
                      <Link href="/vender">Publicar ahora</Link>
                    </Button>
                  }
                />
              </div>
            ) : (
              products.map((product) => (
                <article key={product.id} className="flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-[var(--shadow-card)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.images[0] ?? "/products/placeholder.svg"} alt={product.title} className="size-16 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/productos/${product.slug}`} className="line-clamp-1 text-sm font-semibold text-trato-ink transition hover:text-trato-blue">
                      {product.title}
                    </Link>
                    <p className="text-xs text-trato-muted">
                      {formatPrice(product.price)} · {product.soldQuantity} vendidos · stock {product.stock}
                      {product.createdAt ? ` · ${formatDate(product.createdAt)}` : ""}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={product.status === "active" ? "shipping" : "used"} className="normal-case">
                        {product.status === "active" ? "Activa" : "Pausada"}
                      </Badge>
                      <span className="text-xs text-trato-muted">
                        <Eye className="mr-0.5 inline size-3" />
                        {product.soldQuantity} vendidos
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/productos/${product.slug}`}>Ver</Link>
                    </Button>
                    <Button size="sm" variant={product.status === "active" ? "subtle" : "primary"} onClick={() => toggleProduct(product)}>
                      {product.status === "active" ? <Pause /> : <Play />}
                      {product.status === "active" ? "Pausar" : "Activar"}
                    </Button>
                  </div>
                </article>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="ventas">
          {orders.length === 0 ? (
            <div className="rounded-xl bg-white shadow-[var(--shadow-card)]">
              <EmptyState
                icon={Wallet}
                title="Todavía no tenés ventas"
                description="Cuando alguien compre tus productos, vas a ver las ventas acá y podrás gestionar los envíos."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  mode="sale"
                  onUpdated={(updated) => setOrders((current) => current.map((item) => (item.id === updated.id ? updated : item)))}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
