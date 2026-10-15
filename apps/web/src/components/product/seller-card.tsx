import { Crown, MapPin, Star, TrendingUp, UserCheck } from "lucide-react";
import type { SellerSummary } from "@trato/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { initialsOf, formatCompact } from "@/lib/utils";

export function SellerCard({ seller }: { seller: SellerSummary }) {
  const reputation = Math.min(100, Math.round((seller.rating / 5) * 100));

  return (
    <Section>
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          {seller.avatar ? <AvatarImage src={seller.avatar} alt={seller.name} /> : null}
          <AvatarFallback>{initialsOf(seller.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-trato-ink">{seller.name}</p>
          {seller.status ? (
            <Badge variant="gold" className="mt-0.5">
              <Crown className="size-3" /> {seller.status}
            </Badge>
          ) : (
            <span className="text-xs text-trato-muted">Vendedor de Trato</span>
          )}
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-trato-muted">
          <TrendingUp className="size-3.5" />
          <dt>Ventas concretadas</dt>
          <dd className="ml-auto font-semibold text-trato-ink">{formatCompact(seller.sales)}</dd>
        </div>
        <div className="flex items-center gap-2 text-trato-muted">
          <Star className="size-3.5" />
          <dt>Calificación</dt>
          <dd className="ml-auto font-semibold text-trato-ink">{seller.rating.toFixed(1)} / 5</dd>
        </div>
        {seller.location && (
          <div className="flex items-center gap-2 text-trato-muted">
            <MapPin className="size-3.5" />
            <dt>Ubicación</dt>
            <dd className="ml-auto truncate font-semibold text-trato-ink">{seller.location}</dd>
          </div>
        )}
        {seller.memberSince && (
          <div className="flex items-center gap-2 text-trato-muted">
            <UserCheck className="size-3.5" />
            <dt>En Trato desde</dt>
            <dd className="ml-auto font-semibold text-trato-ink">{seller.memberSince}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-trato-muted">
          <span>Reputación</span>
          <span className="font-semibold text-trato-ink">{reputation}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
          <div className="h-full rounded-full bg-trato-green" style={{ width: `${reputation}%` }} />
        </div>
      </div>

      <a
        href="#vendedor"
        className="mt-4 block text-center text-xs font-semibold text-trato-blue transition hover:underline"
      >
        Ver más publicaciones del vendedor
      </a>
    </Section>
  );
}
