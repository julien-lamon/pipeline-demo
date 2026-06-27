# RULES.md — Règles de développement du repo `job-pipeline-demo`

Repo de la **démo web vitrine** du projet `job-pipeline`. Conduit selon la même
séparation des rôles que le repo principal : l'utilisateur est l'**AMO** (décide
du quoi/pourquoi), l'agent codeur est la **MOE** (exécute des prompts atomiques).

## Règles dures pour l'agent codeur (R1–R4)

> **R1. Demander avant de supposer.** Si l'intention, l'archi, le format de
> données ou un nom de fichier n'est pas explicite dans le prompt, poser une
> question avant d'écrire. Hésitation entre deux interprétations = une question,
> pas un choix unilatéral.
>
> **R2. La solution la plus simple d'abord.** Implémenter strictement ce qui est
> demandé. Pas d'abstraction préventive, pas de "au cas où", pas de dépendance
> non justifiée. Une ligne sans justification dans le prompt ne va pas au livrable.
>
> **R3. Ne pas toucher au code hors périmètre.** Ce qui n'est pas dans la section
> "Fichiers que tu peux toucher" du prompt est gelé. Une amélioration repérée se
> signale, elle ne s'implémente pas. En particulier : **ne jamais modifier le repo
> `job-pipeline` (Python)** depuis ce repo.
>
> **R4. Signaler l'incertitude explicitement.** Dire le doute avant ou avec la
> livraison ; préfixer une zone douteuse par `// TODO-CONFIANCE: …`. La confiance
> affichée doit correspondre à la confiance réelle.

## Périmètre & sécurité (non négociable pour cette démo)

- **Aucune IA appelée**, aucun relais serveur, aucune génération réelle de CV :
  c'est une coquille à données figées (le coach live arrive au brief B).
- **Aucun secret, aucune clé API, aucun appel réseau externe** dans le code.
- **Données 100% fictives**. Interdiction d'importer de vraies offres scrapées
  (le champ `emails` des offres réelles est une donnée personnelle — RGPD).
- Identités personas : prénom non genré + initiale seule, pas de photo, pas de
  nom complet.

## Conventions

- **Next.js (App Router) + TypeScript + Tailwind CSS**, déployable Vercel zéro-config.
- **UTF-8 sans BOM, fins de ligne LF** (cf. `.gitattributes`).
- Données fictives embarquées en **JSON** dans `data/`.
- Commits **Conventional Commits** (anglais), trailer
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- Pas de chemin absolu utilisateur dans le code commité.
