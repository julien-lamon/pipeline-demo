// Compteurs persistés : dépense du jour + quotas par email + journal de gating.
// Deux backends, choisis automatiquement :
//   - Vercel KV / Upstash Redis (REST) si KV_REST_API_URL + KV_REST_API_TOKEN sont
//     présents (cible prod : un store managé, partagé entre invocations serverless) ;
//   - sinon, fichier .data/store.json (DEV UNIQUEMENT ; non versionné, non
//     persistant en serverless — la prod DOIT fournir les variables KV).
//
// Server-only : ce module lit des secrets d'environnement et ne doit jamais être
// importé côté client.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const useKv = Boolean(KV_URL && KV_TOKEN);

/** TTL des compteurs : 2 jours (couvre le rollover de minuit sans accumuler). */
const TTL_SECONDS = 172_800;

// --- Backend Upstash Redis (REST) ------------------------------------------

async function kv(args: (string | number)[]): Promise<unknown> {
  const res = await fetch(KV_URL as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV ${args[0]} failed: ${res.status}`);
  const data = (await res.json()) as { result?: unknown };
  return data.result ?? null;
}

// --- Backend fichier local (dev) -------------------------------------------

interface FileShape {
  spend: Record<string, number>;
  quota: Record<string, number>;
  gate: Record<string, { ts: string; purpose: string }>;
}

const FILE_PATH = join(process.cwd(), ".data", "store.json");

async function readFileStore(): Promise<FileShape> {
  try {
    return JSON.parse(await readFile(FILE_PATH, "utf8")) as FileShape;
  } catch {
    return { spend: {}, quota: {}, gate: {} };
  }
}

async function writeFileStore(data: FileShape): Promise<void> {
  await mkdir(join(process.cwd(), ".data"), { recursive: true });
  await writeFile(FILE_PATH, JSON.stringify(data, null, 2), "utf8");
}

// --- API publique -----------------------------------------------------------

const spendKey = (date: string) => `coach:spend:${date}`;
const quotaKey = (date: string, email: string) =>
  `coach:quota:${date}:${encodeURIComponent(email)}`;
const gateKey = (email: string) => `coach:gate:${encodeURIComponent(email)}`;

/** Dépense cumulée du jour (euros). */
export async function getSpendEur(date: string): Promise<number> {
  if (useKv) {
    const v = await kv(["GET", spendKey(date)]);
    return v ? Number(v) : 0;
  }
  return (await readFileStore()).spend[date] ?? 0;
}

/** Ajoute une dépense au cumul du jour. */
export async function addSpendEur(date: string, amount: number): Promise<void> {
  if (useKv) {
    await kv(["INCRBYFLOAT", spendKey(date), amount]);
    await kv(["EXPIRE", spendKey(date), TTL_SECONDS]);
    return;
  }
  const store = await readFileStore();
  store.spend[date] = (store.spend[date] ?? 0) + amount;
  await writeFileStore(store);
}

/** Nombre d'actions déjà consommées par cet email aujourd'hui. */
export async function getEmailCount(
  date: string,
  email: string,
): Promise<number> {
  if (useKv) {
    const v = await kv(["GET", quotaKey(date, email)]);
    return v ? Number(v) : 0;
  }
  return (await readFileStore()).quota[`${date}:${email}`] ?? 0;
}

/** Incrémente le compteur d'actions de cet email pour aujourd'hui. */
export async function incrEmailCount(
  date: string,
  email: string,
): Promise<void> {
  if (useKv) {
    await kv(["INCR", quotaKey(date, email)]);
    await kv(["EXPIRE", quotaKey(date, email), TTL_SECONDS]);
    return;
  }
  const store = await readFileStore();
  const k = `${date}:${email}`;
  store.quota[k] = (store.quota[k] ?? 0) + 1;
  await writeFileStore(store);
}

/** Enregistre le consentement de gating : email + horodatage + finalité. Rien d'autre. */
export async function recordGate(
  email: string,
  ts: string,
  purpose: string,
): Promise<void> {
  const record = { ts, purpose };
  if (useKv) {
    await kv(["SET", gateKey(email), JSON.stringify(record)]);
    return;
  }
  const store = await readFileStore();
  store.gate[email] = record;
  await writeFileStore(store);
}

/** Backend actif (pour diagnostic / README). */
export const storeBackend = useKv ? "kv" : "file";
