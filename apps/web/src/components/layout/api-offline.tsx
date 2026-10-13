import { ServerCrash } from "lucide-react";
import { API_BASE } from "@/lib/api";

export function ApiOffline({ detail }: { detail?: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-[var(--shadow-card)]">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-amber-50">
        <ServerCrash className="size-7 text-amber-500" />
      </div>
      <h1 className="mb-2 text-xl font-bold text-trato-ink">No pudimos conectar con la API</h1>
      <p className="text-sm text-trato-muted">
        El frontend está funcionando, pero el backend no responde. En local, iniciá la API con:
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-trato-navy px-4 py-3 text-left text-xs text-trato-yellow">
        npm run dev:api
      </pre>
      <p className="mt-4 text-xs text-trato-muted">
        API configurada en <code className="font-semibold">{API_BASE}</code>
        {detail ? ` · ${detail}` : ""}
      </p>
    </div>
  );
}
