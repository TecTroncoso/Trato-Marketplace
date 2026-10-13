"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Heart, LogOut, Package, ShoppingBag, Store, User as UserIcon, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { initialsOf } from "@/lib/utils";

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const clearFavorites = useFavoritesStore((state) => state.clear);
  const router = useRouter();

  const trigger = (
    <DropdownMenuTrigger className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-semibold text-white/90 outline-none transition hover:bg-white/10">
      {user ? (
        <Avatar className="size-7 bg-white/15">
          {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
          <AvatarFallback className="bg-white/20 text-[11px] text-white">{initialsOf(user.name)}</AvatarFallback>
        </Avatar>
      ) : (
        <UserIcon className="size-5" />
      )}
      <span className="hidden lg:block">{user ? user.name.split(" ")[0] : "Mi cuenta"}</span>
      <ChevronDown className="hidden size-3.5 lg:block" />
    </DropdownMenuTrigger>
  );

  if (!user || !token) {
    return (
      <DropdownMenu>
        {trigger}
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/ingresar">
              <UserIcon /> Ingresá
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/registro">Creá tu cuenta</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/mis-compras">
              <ShoppingBag /> Mis compras
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/vender">
              <Store /> Vender
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      {trigger}
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="normal-case">
          <span className="block text-sm font-semibold text-trato-ink">Hola, {user.name.split(" ")[0]}</span>
          <span className="block truncate text-xs font-normal text-trato-muted">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/mi-cuenta">
            <UserIcon /> Mi cuenta
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/mis-compras">
            <ShoppingBag /> Mis compras
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/mis-favoritos">
            <Heart /> Mis favoritos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/mi-cuenta?tab=ventas">
            <Wallet /> Mis ventas
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/vender">
            <Store /> Publicar producto
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/mi-cuenta?tab=publicaciones">
            <Package /> Mis publicaciones
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 data-[highlighted]:bg-red-50"
          onSelect={() => {
            logout();
            clearFavorites();
            toast.success("Cerraste sesión. ¡Hasta pronto!");
            router.push("/");
          }}
        >
          <LogOut className="text-red-500" /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
