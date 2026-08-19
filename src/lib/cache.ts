type Entry = {
  value: unknown;
  expiresAt: number;
};

const store = new Map<string, Entry>();

const DEFAULT_TTL = 60 * 60 * 1000;

export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttl = DEFAULT_TTL,
): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value as T;
  }
  const value = await fn();
  store.set(key, { value, expiresAt: Date.now() + ttl });
  return value;
}

export function clearCache(): void {
  store.clear();
}