const baseUrl: string = (import.meta as any).env?.VITE_API_URL || '';

export type ApiError = { status: number; message: string; traceId?: string };

const parse = async (res: Response) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};

export const api = {
  async get<T>(path: string, opts?: RequestInit): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, opts);
    if (!res.ok) {
      const body = await parse(res);
      throw {
        status: res.status,
        message: body?.message || body?.error || 'Request failed',
        traceId: body?.traceId,
      } as ApiError;
    }
    return (await parse(res)) as T;
  },
  async post<T>(path: string, body?: unknown, opts?: RequestInit): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) },
      body: body != null ? JSON.stringify(body) : undefined,
      ...opts,
    });
    if (!res.ok) {
      const data = await parse(res);
      throw {
        status: res.status,
        message: data?.message || data?.error || 'Request failed',
        traceId: (data as any)?.traceId,
      } as ApiError;
    }
    return (await parse(res)) as T;
  },
};
