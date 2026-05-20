// Thin fetch wrapper for the Spring Boot backend. Adds the Supabase access
// token (when one is available) as a Bearer header, and JSON-encodes/decodes
// bodies. Designed to be the only direct fetch surface used by `repository.ts`.

import { createClient } from "@/utils/supabase/client";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";

export const BACKEND_ENABLED = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.headers as Record<string, string> | undefined),
    ...(await authHeader()),
  };
  const requestInit: RequestInit = { ...init, headers };
  if (init.json !== undefined) {
    headers["Content-Type"] = "application/json";
    requestInit.body = JSON.stringify(init.json);
  }
  const controller = new AbortController();
  const timeoutMs = 2500;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const res = await fetch(`${BASE_URL}${path}`, { ...requestInit, signal: controller.signal }).finally(
    () => {
      clearTimeout(timeout);
    },
  );
  if (res.status === 204) return undefined as unknown as T;
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: "GET" }),
  post: <T>(path: string, json?: unknown) => apiFetch<T>(path, { method: "POST", json }),
  patch: <T>(path: string, json?: unknown) => apiFetch<T>(path, { method: "PATCH", json }),
  delete: <T = void>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
