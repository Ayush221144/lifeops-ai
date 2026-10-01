import type { Obligation } from "./types";

export async function loadApiUrl(): Promise<string> {
  try {
    const r = await fetch("/config.json", { cache: "no-store" });
    return ((await r.json()) as { apiUrl?: string }).apiUrl ?? "";
  } catch { return ""; }
}
const toBase64 = (buf: ArrayBuffer) => { let s = ""; new Uint8Array(buf).forEach((b) => (s += String.fromCharCode(b))); return btoa(s); };

export async function uploadDocument(apiUrl: string, file: File): Promise<Obligation> {
  if (file.size > 5_000_000) throw new Error("File larger than 5MB");
  const r = await fetch(`${apiUrl}/documents`, {
    method: "POST", headers: { "content-type": "application/json", "x-user": "demo" },
    body: JSON.stringify({ filename: file.name, contentBase64: toBase64(await file.arrayBuffer()) }),
  });
  if (!r.ok) throw new Error(((await r.json().catch(() => ({}))) as { error?: string }).error ?? `HTTP ${r.status}`);
  return (await r.json()) as Obligation;
}
