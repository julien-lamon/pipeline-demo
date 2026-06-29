# Architecture — job-pipeline-demo

> Décrit l'architecture **réelle** du code (juin 2026), pas une cible. Source de
> vérité : le code dans `app/`, `lib/`, `components/`, `data/`, `content/`.
> Pour le *pourquoi* des choix, voir [`DECISIONS.md`](DECISIONS.md).

Démo Next.js (App Router) déployable sur Vercel. Deux mondes coexistent :

- **La veille est figée** — offres et scores ATS sont calculés une fois hors ligne,
  stockés en JSON, servis sans aucun appel modèle (déterministe, coût nul).
- **Le coaching est live** — trois actions (analyse, CV, lettre) font de **vrais
  appels Claude**, mais uniquement via des **routes serveur** qui détiennent la clé.

---

## 1. Structure des écrans (`app/`)

Routing App Router, segments dynamiques `[persona]` / `[offerId]` :

| Route | Fichier | Rôle |
|---|---|---|
| `/` | `app/page.tsx` | Accueil : choix d'un des trois personas. |
| `/p/[persona]/offres` | `app/p/[persona]/offres/page.tsx` | Liste des offres scorées du persona (triées par score décroissant). |
| `/p/[persona]/offres/[offerId]` | `.../[offerId]/page.tsx` | Détail d'une offre (corps d'annonce + justification ATS + positionnement). |
| `/p/[persona]/coach` | `app/p/[persona]/coach/page.tsx` | Coach live : héberge le composant client `CoachLive`. |
| `/p/[persona]/cv` | `app/p/[persona]/cv/page.tsx` | CV d'origine (statique) du persona, non optimisé. |

Les pages sont des **Server Components** : elles chargent les données figées au rendu
(`lib/data.ts`, `lib/profil.ts`) et passent au client le strict nécessaire. Le seul
composant interactif central est `components/CoachLive.tsx` (`"use client"`), qui
orchestre les trois actions de coaching et leur état (persisté en `sessionStorage`,
purgé au changement de persona).

---

## 2. Flux de données

### 2a. Veille figée (aucun appel modèle)

```
data/personas.json ─┐
data/offers/*.json ─┼─► lib/data.ts ─► Server Components (pages) ─► HTML
data/cv/*.json ─────┘   (import statique, tri, seuils)
```

- `lib/data.ts` importe les JSON embarqués et expose `getOffers` (tri par score),
  `getOffer`, `getPersona`, `getCV`, et les seuils : **pertinence = 70**,
  **prioritaire = 85** (`SCORE_THRESHOLD`, `PRIORITY_MIN`).
- Le **score ATS** de chaque offre est figé dans `data/offers/*.json`
  (champ `score`, justifié par `atsMatch.covered/missing`). Règle de fabrication :
  [`scoring-ats.md`](scoring-ats.md). **Aucun recalcul au runtime.**
- Les types du domaine sont dans `lib/types.ts` (`Offer`, `Persona`, `CV`, …).

### 2b. Coaching live (vrais appels Claude, via le serveur)

```
CoachLive (client)
   │  fetch POST /api/{analyze,cv,letter}   ← jamais d'appel direct à l'API Anthropic
   ▼
Route serveur (app/api/*/route.ts)
   │  1. checkAccess (gating + plafond + quota)
   │  2. checkGenGuards (throttle + 1-gen)  [cv, letter]
   │  3. buildPrompt (lib/prompts.ts) à partir du document de vérité + offre
   │  4. lib/anthropic.ts ─► API Anthropic (clé via process.env, SDK)
   │  5. comptabilise le coût (addSpendEur) + quota (incrEmailCount) + marqueurs
   ▼
Réponse au client (stream texte pour analyze ; JSON structuré pour cv/letter)
```

Le **document de vérité** d'un persona (`content/profil-{persona}.md`, lu par
`lib/profil.ts`) est la **seule** source du contenu généré — le CV statique
n'entre jamais dans un prompt. C'est le contrôle qui rend la surface d'injection
quasi nulle : le visiteur ne saisit aucun texte libre, il déclenche des boutons.

---

## 3. Rôle des routes serveur (`app/api/`)

Toutes en `runtime = "nodejs"` + `dynamic = "force-dynamic"`.

| Route | Type d'appel | Garde-fous appliqués | Sortie |
|---|---|---|---|
| `POST /api/gate` | — (aucun appel modèle) | validation email + consentement | pose le cookie httpOnly `coach_email` ; enregistre le consentement |
| `POST /api/analyze` | **streaming** narratif | `checkAccess` | flux `text/plain` token par token |
| `POST /api/cv` | **structuré** (json_schema) | `checkAccess` + `checkGenGuards` | `{ cv }` validé contre `CV_SCHEMA` |
| `POST /api/letter` | **structuré** (json_schema) | `checkAccess` + `checkGenGuards` | `{ letter }` validé contre `COVER_LETTER_SCHEMA` |

- L'**analyse** est diffusée en streaming (effet « réflexion en direct ») ; le coût
  est comptabilisé à la fin via `stream.finalMessage()`.
- Le **CV** et la **lettre** utilisent la sortie structurée (`output_config.format`
  json_schema) : format garanti, pas de parsing fragile.
- En cas de refus de sécurité du modèle (`stop_reason === "refusal"`),
  `ClaudeRefusalError` est mappée en message propre (HTTP 422), jamais en erreur brute.
- Bornes anti-dérapage de coût dans `lib/config.ts` : `MAX_TOKENS`
  (analyze 1536 / cv 3072 / letter 1024) et `EFFORT` (analyze low / cv,letter medium),
  thinking **désactivé**.

---

## 4. Où vivent les secrets

**La clé API ne vit QUE dans une variable d'environnement serveur**, jamais dans le
repo, jamais côté client.

- `lib/anthropic.ts` instancie `new Anthropic()` : le SDK lit
  `process.env.ANTHROPIC_API_KEY` côté serveur. La clé n'est **jamais** envoyée au
  navigateur, ni embarquée dans le bundle client (les modules `lib/anthropic.ts`,
  `lib/store.ts` ne sont importés que par les routes serveur).
- Le client (`CoachLive.tsx`) n'appelle **que** `/api/analyze|cv|letter` — jamais
  l'API Anthropic en direct (vérifiable dans l'onglet réseau du navigateur).
- `.env*` est gitignoré (sauf `.env.example`, qui ne contient qu'un placeholder).

**Variables d'environnement** (inventaire complet) :

| Variable | Rôle | Secret | Requise |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | clé du modèle (lue par le SDK) | **oui** | oui |
| `KV_REST_API_URL` | endpoint REST du store managé | oui | **prod** |
| `KV_REST_API_TOKEN` | token du store managé | **oui** | **prod** |
| `DAILY_BUDGET_EUR` | plafond global/jour (défaut 10) | non | non |
| `PER_EMAIL_DAILY_QUOTA` | quota/email/jour (défaut 10) | non | non |
| `NODE_ENV` | posé par la plateforme (cookie `secure` en prod) | non | auto |

---

## 5. Où vivent les compteurs (`lib/store.ts`)

Le store persiste : **dépense du jour**, **quota par email**, **marqueurs 1-gen**,
**horodatage de throttle**, **journal de consentement (gating)**.

Deux backends, choisis **automatiquement** :

- **Prod — Redis REST managé** (Upstash Redis via Vercel Marketplace) : activé dès que
  `KV_REST_API_URL` **et** `KV_REST_API_TOKEN` sont présents. Partagé entre toutes les
  invocations serverless (indispensable : sans store partagé, chaque invocation aurait
  son propre compteur et les garde-fous ne tiendraient pas).
- **Dev — fichier `.data/store.json`** : fallback local uniquement, non versionné.
  **Ne fonctionne pas en serverless** (système de fichiers éphémère) → la prod **doit**
  fournir les variables KV.

Le backend actif est exposé par `storeBackend` (`"kv"` | `"file"`) pour diagnostic.
TTL des compteurs : **2 jours** (couvre le rollover de minuit). Les clés portent le
préfixe `coach:` (`coach:spend:`, `coach:quota:`, `coach:gen:`, `coach:last:`,
`coach:gate:`) et la date du jour (UTC) pour le découpage quotidien.

---

## 6. Comment fonctionnent les garde-fous (`lib/guards.ts`)

Tous **côté serveur** (un blocage client seul serait contournable). Deux étages :

**`checkAccess` (avant tout appel modèle — les trois actions)**
1. **Email gating** — sans cookie `coach_email` valide → 401 (`gating_required`).
2. **Plafond global** — si dépense du jour ≥ `DAILY_BUDGET_EUR` → 503 (`capacity`),
   coupure propre (« Démo à pleine capacité »).
3. **Quota par email** — si l'email a atteint `PER_EMAIL_DAILY_QUOTA` → 429
   (`email_quota`).

**`checkGenGuards` (CV et lettre uniquement)**
4. **1 génération par couple** (email × type × persona × offre) — re-clic sans
   régénération explicite → 409 (`already_generated`) ; bouton grisé après succès.
5. **Throttle** — délai minimum `THROTTLE_MS` = **120 s** entre deux générations du
   **même type** par email → 429 (`throttled`). S'applique aussi aux régénérations
   volontaires (`regenerate: true`).

Après une génération réussie, `recordGen` pose le marqueur 1-gen + l'horodatage throttle.
La comptabilité du coût (`addSpendEur`) utilise le coût **réel** calculé à partir de
l'objet `usage` renvoyé par l'API (`lib/config.ts` → `costEur`), ce qui garantit la
concordance entre le compteur interne et la consommation réelle facturée.

**Point d'extension anti-bot** : si l'AMO active Cloudflare Turnstile plus tard, la
vérification du token humain se branche dans `checkAccess`, avant les garde-fous budget,
sans toucher au reste (volontairement non implémenté — décision AMO, voir D19).

---

## 7. Frontière de confiance (résumé)

```
        Navigateur (non fiable)                 Serveur (fiable)
  ┌───────────────────────────┐        ┌──────────────────────────────────┐
  │ CoachLive.tsx (client)    │  POST  │ app/api/*  ── lib/guards           │
  │  - boutons, pas de saisie │ ─────► │            ── lib/anthropic (clé)  │
  │  - sessionStorage (UI)    │ ◄───── │            ── lib/store (compteurs)│
  └───────────────────────────┘  flux  └──────────────────────────────────┘
                                  /JSON          │ process.env (secrets)
                                                 ▼
                                       API Anthropic + Redis managé
```

La clé, les compteurs et les prompts restent **entièrement côté serveur**. Le client
ne voit que des boutons et des réponses déjà générées.
