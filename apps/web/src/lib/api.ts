function apiBase(): string {
  if (typeof window !== "undefined") {
    const explicit = process.env.NEXT_PUBLIC_API_URL;
    if (explicit && explicit.trim()) return explicit.trim().replace(/\/+$/, "");
    return "/api/v1";
  }
  const bound = process.env.API_SERVICE_URL;
  if (bound && bound.trim()) return `${bound.trim().replace(/\/+$/, "")}/api/v1`;
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
}

export const API_BASE = apiBase();

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const raw = data?.message ?? data?.error;
    const message = Array.isArray(raw) ? raw.join(", ") : typeof raw === "string" ? raw : "Ocurrió un error inesperado";
    throw new ApiError(response.status, message);
  }
  return data as T;
}

export async function serverFetch<T>(path: string, options: { revalidate?: number | false } = {}): Promise<T> {
  const init: RequestInit = options.revalidate
    ? { next: { revalidate: options.revalidate } }
    : { cache: "no-store" };
  const response = await fetch(`${API_BASE}${path}`, init as RequestInit);
  return parse<T>(response);
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });
  return parse<T>(response);
}

export type QueryValue = string | number | boolean | undefined | null | string[];

export function buildQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, item);
    } else {
      search.append(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}
