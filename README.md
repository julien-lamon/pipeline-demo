# job-pipeline-demo

> Démonstration interactive d'un assistant de recherche d'emploi : il trie des
> offres par pertinence, analyse une candidature, et génère un CV et une lettre de
> motivation **adaptés à l'offre visée** — sans que le candidat ait à réécrire quoi
> que ce soit.

Démo en ligne : _à renseigner après le premier déploiement Vercel_ (voir
[`docs/DECISIONS.md`](docs/DECISIONS.md) D23 — la mise en prod est cadrée comme un lot dédié).

---

## Le problème

Postuler, c'est répéter trois tâches chronophages pour chaque offre : juger si le
poste vaut la candidature, adapter son CV au vocabulaire de l'annonce, et rédiger une
lettre qui ne soit pas un copier-coller. La plupart des outils automatisent l'une de
ces étapes ; aucun ne relie la **veille scorée** au **coaching taillé pour le poste
exact**.

Cette démo montre ce chaînage de bout en bout, sur trois profils fictifs de secteurs
différents.

## Ce que fait la démo

Le visiteur incarne l'un des trois personas, parcourt ses offres déjà scorées, en
ouvre une, et déclenche le coaching :

1. **Analyse de l'offre** — une analyse écrite en direct (diffusée mot à mot) qui
   sépare deux questions : l'adéquation mesurable du dossier (score ATS) et son
   *positionnement* qualitatif. Elle signale aussi les « lignes rouges » du profil
   que l'offre pourrait heurter.
2. **CV ciblé** — un CV reformulé et repriorisé pour l'offre (jamais inventé : le
   socle de vérité ne bouge pas), au format d'un CV moderne lisible par les ATS.
3. **Lettre de motivation** — une lettre générée pour l'offre, éditable et copiable.

Le tout est piloté **par boutons** : pas de zone de saisie libre.

## Ce que le projet démontre

- **Une vraie IA en production, encadrée.** L'analyse, le CV et la lettre sont
  générés en direct par un modèle de langage — mais via un relais serveur qui protège
  la clé, avec plafond de dépense, quotas et garde-fous anti-abus.
- **Une conception orientée sécurité et RGPD.** Aucune saisie libre (surface
  d'injection quasi nulle), données 100 % fictives, aucune donnée personnelle réelle
  dans le dépôt.
- **Un produit qui conseille sans mentir.** L'outil distingue *conseiller* (une
  analyse lucide, qui n'enjolive pas les chances) et *exécuter* (une lettre qui plaide
  la candidature, même quand le candidat choisit d'assumer un poste mal calibré). Il
  ne dit pas oui à tout, et ne bloque pas pour autant.
- **Une démarche tracée.** Les choix structurants — et leurs revirements — sont
  consignés dans [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Les trois personas (fictifs)

| Persona     | Secteur               | Séniorité |
|-------------|-----------------------|-----------|
| Camille D.  | Ressources humaines   | Junior    |
| Sacha O.    | Marketing digital     | Confirmé  |
| Claude R.   | Direction financière  | Senior    |

Prénoms non genrés, initiale seule, pas de photo : un choix de neutralité (et un
sous-texte « outil sans biais »). Chaque persona dispose d'un profil détaillé et de
son propre jeu d'offres scorées.

## Pile technique

- Next.js 16.2.9 (App Router, Turbopack), React 19.2.4, TypeScript 5, Tailwind CSS 4
- SDK `@anthropic-ai/sdk` 0.106.x ; modèle `claude-sonnet-4-6`
- Routes serveur Next.js pour les appels au modèle (la clé reste côté serveur)
- Déploiement Vercel (build zéro-config)
- Store managé **Upstash Redis (REST)** via Vercel Marketplace pour les compteurs
  (plafond, quotas, throttle) — variables `KV_REST_API_URL` / `KV_REST_API_TOKEN`

## Lancer en local

```bash
npm install
npm run dev
# → http://localhost:3000
```

Pour exécuter le coaching en local, une clé API est requise dans `.env.local`
(`ANTHROPIC_API_KEY=…` ; copier `.env.example`). Sans elle, les écrans de veille
fonctionnent ; les actions de coaching nécessitent la clé. En local sans store managé,
les compteurs basculent sur un fichier `.data/store.json` (dev uniquement, non versionné).

## Comment c'est construit

- **Veille figée.** Les offres et leurs scores sont calculés une fois puis figés :
  la démo est déterministe et ne coûte rien à servir. La règle de scoring (inspirée
  du fonctionnement réel des ATS) est documentée dans
  [`docs/scoring-ats.md`](docs/scoring-ats.md).
- **Coaching live.** Seules les trois actions de coaching appellent le modèle, via le
  relais serveur, dans la limite des garde-fous.
- **Méthode de coaching.** Le coaching transpose — sans la copier — la méthode d'un
  coach emploi senior ; le périmètre repris et omis est documenté dans
  [`docs/coaching-methode.md`](docs/coaching-methode.md).

## Limites assumées

C'est une **démonstration**, pas un produit commercial : données fictives, offres
figées, pas de comptes utilisateurs. Une version vivante (offres réelles via API
officielles, comptes de testeurs invités) est esquissée dans
[`docs/DECISIONS.md`](docs/DECISIONS.md).

## Documentation

- [`docs/DECISIONS.md`](docs/DECISIONS.md) — journal des décisions stratégiques et techniques
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — architecture et flux de données
- [`docs/scoring-ats.md`](docs/scoring-ats.md) — règle de scoring ATS
- [`docs/coaching-methode.md`](docs/coaching-methode.md) — méthode de coaching transposée
