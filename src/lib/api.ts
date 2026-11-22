export const ADMIN_TOKEN_KEY = "abdeen_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function api<T = unknown>(
  path: string,
  opts: {
    method?: string;
    body?: unknown;
    token?: string | null;
    isFormData?: boolean;
  } = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (!opts.isFormData) headers["Content-Type"] = "application/json";
  const token = opts.token ?? (typeof window !== "undefined" ? getToken() : null);
  if (token) headers["x-admin-token"] = token;
  const res = await fetch(path, {
    method: opts.method ?? "GET",
    headers,
    body:
      opts.body !== undefined
        ? opts.isFormData
          ? (opts.body as FormData)
          : JSON.stringify(opts.body)
        : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `فشل الطلب (${res.status})`
    );
  }
  return data as T;
}
