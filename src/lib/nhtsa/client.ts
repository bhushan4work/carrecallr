export class NhtsaError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "NhtsaError";
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function nhtsaFetch<T>(url: string): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, { next: { revalidate: 3600 } });
    } catch {
      if (attempt === 0) {
        await sleep(800);
        continue;
      }
      throw new NhtsaError("couldn't reach nhtsa");
    }

    if (!res.ok) {
      throw new NhtsaError(`nhtsa request failed (${res.status})`, res.status);
    }

    const json = (await res.json()) as T & { message?: string };
    if (json && json.message === "Endpoint request timed out") {
      if (attempt === 0) {
        await sleep(800);
        continue;
      }
      throw new NhtsaError("nhtsa request timed out");
    }

    return json;
  }
  throw new NhtsaError("nhtsa request failed");
}