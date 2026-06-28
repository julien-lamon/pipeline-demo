# job-pipeline-demo

Démo web vitrine du projet **job-pipeline** : elle fait comprendre, en moins de
trois minutes et sans inscription, le funnel **veille scorée → coaching ciblé →
CV taillé pour l'offre**.

> ⚠️ **Données 100% fictives et figées.** Les trois personas, leurs offres et
> leurs CV sont inventés ; **aucune vraie donnée, aucune offre scrapée**. Les
> écrans de veille (accueil, offres, détail) ne font **aucun appel réseau**.
>
> 🤖 **Le coach est live.** Les boutons « Analyser cette offre » et « Générer le
> CV ciblé » déclenchent de **vrais appels Claude**, via des routes serveur qui
> seules détiennent la clé API (jamais exposée au client). Accès filtré par email
> gating, dépense plafonnée. Voir [Coach live](#coach-live-appels-claude-réels).

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + TypeScript
- Tailwind CSS v4
- Déployable sur Vercel en zéro-config

## Lancer la démo en local

```bash
npm install                 # installe les dépendances (dont @anthropic-ai/sdk)
cp .env.example .env.local  # puis renseigner ANTHROPIC_API_KEY
npm run dev
```

Puis ouvrir **http://localhost:3000**. Les écrans de veille tournent sans clé ;
seul le coach live (écran 4) requiert `ANTHROPIC_API_KEY`.

## Coach live (appels Claude réels)

Deux actions **full-bouton** (aucune saisie de texte libre côté visiteur) sur
l'écran coach, à partir d'une offre figée déjà choisie :

1. **Analyser cette offre** → adéquation profil/offre + signalement explicite des
   **lignes rouges** heurtées (encart dédié).
2. **Générer le CV ciblé** → CV repriorisé/reformulé **pour l'offre**, sans rien
   inventer ; ce que l'offre exige et que le profil n'a pas est listé, pas fabriqué.

**Comment la clé est protégée.** Le navigateur n'appelle **jamais** l'API
Anthropic en direct : il appelle nos routes serveur (`app/api/analyze`,
`app/api/cv`, `app/api/gate`), qui lisent `ANTHROPIC_API_KEY` depuis
l'environnement serveur. La clé n'est ni dans le code, ni dans le bundle client,
ni committée (`.env.local` est gitignoré ; en prod, variable Vercel).

**Modèle & appel.** `claude-sonnet-4-6`, sortie structurée (`output_config.format`
+ JSON Schema → format garanti, pas de parsing fragile), `effort` bas/medium,
`thinking` désactivé, `max_tokens` borné. Coût observé : ~0,009 €/analyse,
~0,014 €/CV.

**Garde-fous de dépense.** Plafond **global 10 €/jour** (au-delà : coupure propre,
« démo à pleine capacité ») + **quota par email** (10 actions/jour par défaut).
Compteurs dans **Vercel KV** (`KV_REST_API_URL` + `KV_REST_API_TOKEN`) ; sans ces
variables, fallback fichier `.data/store.json` (dev uniquement). Réglables via
`DAILY_BUDGET_EUR` et `PER_EMAIL_DAILY_QUOTA`.

**Email gating (RGPD allégé).** Avant la 1ʳᵉ action, le visiteur saisit un email
et coche un consentement explicite (mention RGPD : finalité, pas de revente, droit
à l'effacement). On stocke **uniquement** : email + horodatage + finalité. Aucun CV
visiteur, aucun contenu personnel.

**Clé perso d'un testeur (documenté, pas d'UI).** Un testeur technique peut faire
tourner la démo en local avec **sa propre clé** : `cp .env.example .env.local`,
renseigner `ANTHROPIC_API_KEY`, `npm run dev`. Il n'existe **volontairement aucun**
champ « collez votre clé » dans l'interface publique (mauvaise pratique de
sécurité) — la clé passe exclusivement par l'environnement serveur.

> **En production (Vercel) :** définir `ANTHROPIC_API_KEY` et les variables KV dans
> Project Settings → Environment Variables. Sans store KV, les plafonds ne
> persistent pas entre invocations serverless.

## Parcours (5 écrans)

1. **Accueil** (`/`) — pitch + choix d'un des 3 profils à incarner.
2. **Offres scorées** (`/p/[persona]/offres`) — liste triée par score, badges
   colorés par niveau, marquage *prioritaire* / *sous le seuil*, recherche et
   filtres décoratifs.
3. **Détail offre** (`/p/[persona]/offres/[offerId]`) — score ATS, positionnement
   sur l'offre (5 niveaux), piste A/B, annonce intégrale + bouton *Coacher*.
4. **Coach** (`/p/[persona]/coach`) — **stub** : explique ce que fera le coach
   live, CTA désactivé, aucun appel réel.
5. **CV cible** (`/p/[persona]/cv`) — aperçu **statique** d'un CV d'exemple,
   étiqueté « exemple », bouton de téléchargement décoratif.

## Personas (fictifs)

| Profil | Secteur | Séniorité | Offres | CV d'exemple |
| --- | --- | --- | --- | --- |
| Camille D. | Ressources humaines | Junior (~2 ans) | 5 | 1 page |
| Sacha O. | Marketing digital | Confirmé (~6 ans) | 5 | 1 page |
| Claude R. | Direction financière | Senior (12+ ans) | 5 | 2 pages |

## Structure

```
app/
  page.tsx                       # Accueil + choix persona
  p/[persona]/offres/            # Liste + détail des offres
  p/[persona]/coach/             # Stub de coaching
  p/[persona]/cv/                # Aperçu CV statique
components/                      # Cartes, badges, header funnel, CV…
data/
  personas.json                  # Les 3 personas
  offers/{rh,marketing,finance}.json
  cv/{camille,sacha,claude}.json
content/profil-*.md              # "Documents de vérité" par persona
lib/                             # Types + accès aux données figées
```

## Thème

La couleur d'accent est une variable de thème (`--accent` dans
`app/globals.css`), volontairement distincte du jaune de Welcome to the Jungle.
La modifier met tout le funnel à jour.

## Périmètre

Voir [`RULES.md`](RULES.md). Cette démo est la **coquille** (interface + parcours
+ données figées). Le coaching live, le relais serverless détenant la clé API, le
plafond de dépense et l'*email gating* sont **hors périmètre** ici.
