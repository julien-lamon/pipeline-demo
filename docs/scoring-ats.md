# Règle de scoring ATS (démo)

> **Périmètre.** Ce document décrit comment le **score ATS** des offres de la démo
> est fabriqué. Les scores sont **figés** dans `data/offers/*.json` : ils sont
> calculés une fois, hors ligne, selon la règle ci-dessous, puis stockés. La démo
> ne recalcule **rien** en direct et ne fait **aucun appel** pour scorer.

## 1. Ce que le score mesure (et ne mesure pas)

Le score ATS de la démo mesure une **proximité sémantique offre ↔ profil** : à quel
point le profil **couvre les éléments exigés par l'annonce**. C'est la logique des
ATS réels, qui classent les candidatures sur la correspondance de mots-clés
(compétences dures, intitulé), pas sur un jugement qualitatif.

Le score **n'inclut pas** les lignes rouges du candidat (présentiel, fourchette de
rémunération, diplôme rédhibitoire, niveau hiérarchique, secteur). Ces critères sont
traités **séparément** par la couche coach (analyse en langage naturel). Conséquence
voulue : **une offre peut avoir un excellent score ATS et heurter une ligne rouge**
(« l'ATS dit oui, le coach dit attention »). Les deux axes sont indépendants.

> Cette conception (ATS pur + coach séparé) est la **cible** de la démo. Elle diffère
> volontairement de l'outil perso `job-pipeline`, où le score est un jugement porté
> par un LLM. Faire converger les deux est un sujet **V2**, hors périmètre ici.

## 2. Sources

Inspiré du fonctionnement public des ATS et des guides de matching de CV :

- Jobscan, *Resume Match Report* et *ATS résumé optimization* :
  `https://www.jobscan.co/` — le « match rate » repose sur les **hard skills** et la
  **correspondance d'intitulé**, avec une cible recommandée d'environ **75 % et plus**.
- Jobscan, *What is an ATS?* : `https://www.jobscan.co/applicant-tracking-systems`
- Guides ATS 2026 (principes généraux, ex. Teal, Indeed Career Guide) : un ATS pèse
  fortement les compétences techniques et l'intitulé, **peu les soft skills**, et
  pénalise l'absence de mots-clés exigés.

## 3. La règle (simplifiée)

> **Avertissement.** C'est une **règle simplifiée et reproductible**, pas le calcul
> algorithmique d'un vrai ATS. Le vrai matching (TF-IDF / similarité vectorielle sur
> le texte complet) est une **cible V2**.

Score sur 100 = somme de quatre composantes, plafonné à 100 :

| Composante | Poids | Calcul |
|---|---:|---|
| **Intitulé de poste** | 30 | 30 si même famille de poste que l'intitulé cible du profil ; 18 si adjacent ; 8 si vaguement lié ; 0 si étranger. |
| **Compétences / outils exigés** | 45 | `45 × (compétences dures exigées par l'annonce présentes dans le profil ÷ total des compétences dures exigées)`. |
| **Diplôme / certifications exigés** | 15 | 15 si le profil satisfait l'exigence (ou aucune exigée) ; 8 si partiel ; 0 si un prérequis dur est absent. |
| **Bonus contextualisation** | 10 | Jusqu'à 10 si le profil **chiffre** les compétences clés exigées (réalisations quantifiées). |

- **Soft skills** (autonomie, rigueur, esprit d'équipe…) : quasi **non comptées**,
  conforme aux ATS réels.
- **Lignes rouges** : **n'entrent jamais** dans le score (cf. §1).

## 4. Échelle et seuils

| Plage | Lecture |
|---|---|
| `< 65` | Adéquation faible (couverture lacunaire). |
| `65 - 74` | Limite : pertinent mais incomplet. |
| `75 - 85` | Bonne adéquation. |
| `> 85` | Excellente adéquation. |

Seuils de la démo : **seuil de pertinence = 70** (en dessous : « sous le seuil ») ;
**prioritaire = score ≥ 85**. Ces deux seuils vivent dans `lib/data.ts`
(`SCORE_THRESHOLD`, `PRIORITY_MIN`).

## 5. Fabrication et figeage

Pour chaque offre : on liste les **compétences/outils exigés** dans son corps
d'annonce, on les confronte aux **compétences du document de vérité** du persona
(`content/profil-*.md`), on applique la grille du §3, et on **fige** le résultat dans
`score`. Le champ `atsMatch` (mots-clés `covered` / `missing`) accompagne le score
comme **justification factuelle** affichée dans l'UI ; il n'est **pas** transmis au
coach (qui, lui, lit le corps d'annonce et raisonne séparément).
