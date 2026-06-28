# Méthode de coaching de la démo — transposition de `coach-carriere`

## Statut

Le coaching de cette démo est une **transposition productisée et NON-INTERACTIVE**
de la méthode de la skill `coach-carriere` (outil perso, hors de ce repo). La
**substance méthodologique** a été recopiée à la main dans les prompts (`lib/prompts.ts`)
et la documentation de scoring (`docs/scoring-ats.md`).

> **Pas de couplage.** La démo n'importe rien de la skill et ne lit aucun de ses
> fichiers au runtime. La skill reste la **source de vérité** côté outil perso ; la
> démo en est un **sous-ensemble figé**. Si la méthode évolue dans la skill, il faut
> reporter manuellement le changement ici.

## Ce qui est REPRIS (transposé)

| Élément de la skill | Où, dans la démo |
|---|---|
| Séparation **ATS mesurable** / **positionnement qualitatif** | `scoring-ats.md` + prompt analyse (deux axes figés, jamais mélangés) |
| **Positionnement 5 niveaux** (Très faible → Très fort), calibrage **baissier**, "Très fort" réservé au différenciateur rare | type `Positionnement`, données figées, prompt analyse |
| Posture : honnête sans brutalité, **probabiliste** (pas de promesse), **actionnable** | prompt analyse |
| **"Un CV n'est pas une fiche, c'est un récit"** : choisir le récit prioritaire | prompt analyse + CV (`summary` = synthèse positionnement) |
| **Signaux faibles** / **actifs sous-vendus** | prompt analyse |
| **Facteur marché** (volume, réseau, non-réponse) signalé | prompt analyse |
| Formule ATS (mots-clés 4 catégories, couverture, pénalités, bonus) | `scoring-ats.md` |
| CV : **verbe d'action + métrique**, bannir "participation/contribution/implication", **règle des 3 étages** (senior), vocabulaire calibré | prompt CV |
| LM : **4 paragraphes** (dont §3 "premiers chantiers"), **4 erreurs bannies** | prompt LM |
| LM : **cloison analyse/lettre**, mode **plaidoyer**, anti-auto-sabotage | prompt LM |

## Ce qui est VOLONTAIREMENT OMIS (et pourquoi)

- **Questions interactives** (la skill demande "vers quel récit voulez-vous aller ?").
  → La démo est **full-bouton** : le coach tranche et justifie, il ne pose pas de
  question (aucune saisie libre visiteur).
- **Les 3 leviers** (activer le réseau, approche LinkedIn ciblée, livrable
  d'entretien). → Actions personnelles et interactives ; la démo se contente de
  **signaler** le facteur marché dans l'analyse, sans proposer d'actions nominatives.
- **Modes entretien / stratégie-cartographie / bilan de personnalité**. → Hors
  périmètre du funnel démo (veille → CV d'origine → coaching : analyse + CV + LM).
- **Journal de bord + dashboard de candidatures**. → Outillage du projet perso, pas
  d'une vitrine sans persistance utilisateur.
- **Plusieurs versions de CV** (corporate / EdTech / académique…). → La démo produit
  **un** CV ciblé par offre.

## Écarts connus à garder en tête

- La démo ne fait pas de **sélection interactive du récit** : elle en choisit un et
  l'assume. C'est un choix de format (vitrine), pas une régression de méthode.
- Les données (offres, profils) sont **figées et fictives** : le positionnement et le
  score ATS sont pré-calculés hors ligne, pas évalués en direct sur un vrai dossier.
