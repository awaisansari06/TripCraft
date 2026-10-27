import { Buffer } from "node:buffer";

/** Bound JSON before parsing, including chunked requests without Content-Length. */
export async function readJsonBody(request: Request, maxBytes: number): Promise<
  { ok: true; value: unknown } | { ok: false; status: 400 | 413; error: string }
> {
  const tooLarge = { ok: false as const, status: 413 as const, error: "Request body is too large." };
  const length = request.headers.get("content-length");
  if (length && /^\d+$/.test(length) && Number(length) > maxBytes) return tooLarge;
  if (!request.body) return { ok: false, status: 400, error: "Invalid JSON body" };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel().catch(() => {});
        return tooLarge;
      }
      chunks.push(value);
    }
    return { ok: true, value: JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown };
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON body" };
  } finally { reader.releaseLock(); }
}
