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
  /** Marqueurs "déjà généré" par email/jour/type/offre (anti re-clic et anti-script). */
  gen: Record<string, string>;
  /** Dernière génération (epoch ms) par email/type, pour le throttle. */
  last: Record<string, number>;
  gate: Record<string, { ts: string; purpose: string }>;
}

const FILE_PATH = join(process.cwd(), ".data", "store.json");

async function readFileStore(): Promise<FileShape> {
  try {
    const raw = JSON.parse(await readFile(FILE_PATH, "utf8")) as Partial<FileShape>;
    return {
      spend: raw.spend ?? {},
      quota: raw.quota ?? {},
      gen: raw.gen ?? {},
      last: raw.last ?? {},
      gate: raw.gate ?? {},
    };
  } catch {
    return { spend: {}, quota: {}, gen: {}, last: {}, gate: {} };
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
const genKey = (
  date: string,
  email: string,
  kind: string,
  personaId: string,
  offerId: string,
) => `coach:gen:${date}:${encodeURIComponent(email)}:${kind}:${personaId}:${offerId}`;
const lastKey = (email: string, kind: string) =>
  `coach:last:${encodeURIComponent(email)}:${kind}`;

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

/** Une génération (CV ou LM) a-t-elle déjà eu lieu pour ce couple email/type/offre ? */
export async function hasGenerated(
  date: string,
  email: string,
  kind: string,
  personaId: string,
  offerId: string,
): Promise<boolean> {
  const k = genKey(date, email, kind, personaId, offerId);
  if (useKv) return Boolean(await kv(["GET", k]));
  return Boolean((await readFileStore()).gen[k]);
}

/** Marque une génération comme effectuée (TTL 2 jours). */
export async function markGenerated(
  date: string,
  email: string,
  kind: string,
  personaId: string,
  offerId: string,
): Promise<void> {
  const k = genKey(date, email, kind, personaId, offerId);
  if (useKv) {
    await kv(["SET", k, "1"]);
    await kv(["EXPIRE", k, TTL_SECONDS]);
    return;
  }
  const store = await readFileStore();
  store.gen[k] = "1";
  await writeFileStore(store);
}

/** Horodatage (epoch ms) de la dernière génération de ce type par cet email. 0 si aucune. */
export async function getLastGenMs(email: string, kind: string): Promise<number> {
  const k = lastKey(email, kind);
  if (useKv) {
    const v = await kv(["GET", k]);
    return v ? Number(v) : 0;
  }
  return (await readFileStore()).last[k] ?? 0;
}

/** Mémorise l'instant de la dernière génération de ce type (pour le throttle). */
export async function setLastGenMs(
  email: string,
  kind: string,
  ms: number,
): Promise<void> {
  const k = lastKey(email, kind);
  if (useKv) {
    await kv(["SET", k, ms]);
    await kv(["EXPIRE", k, TTL_SECONDS]);
    return;
  }
  const store = await readFileStore();
  store.last[k] = ms;
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
