# Règle de scoring ATS (démo)

> **Périmètre.** Ce document décrit comment le **score ATS** des offres de la démo
> est fabriqué. Les scores sont **figés** dans `data/offers/*.json` : calculés une
> fois, hors ligne, selon la règle ci-dessous, puis stockés. La démo ne recalcule
> **rien** en direct et ne fait **aucun appel** pour scorer.
>
> Cette règle est **alignée sur la méthode de la skill `coach-carriere`** (outil
> perso, `references/analyse-offre.md`), volontairement transposée ici sans coupler
> la démo à la skill. Voir `docs/coaching-methode.md`.

## 1. Deux axes séparés

Une offre porte **deux indicateurs distincts** qu'on ne mélange jamais :

1. **Score ATS** (mesurable, %) : adéquation lexicale/structurelle offre↔profil,
   telle qu'un ATS la calculerait. C'est l'objet de ce document.
2. **Positionnement sur l'offre** (qualitatif, 5 niveaux) : solidité du dossier,
   intégrant le marché. Ce N'EST PAS une prédiction de réponse RH. Il est porté par
   la couche coach, pas par le score (voir `docs/coaching-methode.md`).

Les **lignes rouges** du candidat (présentiel, rémunération, niveau, diplôme) n'entrent
dans **aucun** des deux : c'est le coach qui les signale, séparément.

## 2. Sources

Transposé de la méthode publique des ATS et de `analyse-offre.md` :

- Jobscan, *Resume Match Report* : `https://www.jobscan.co/` — le match repose sur
  les **hard skills** et la **correspondance d'intitulé**, cible recommandée ~75 %+.
- Jobscan, *What is an ATS?* : `https://www.jobscan.co/applicant-tracking-systems`
- Guides ATS 2026 (Teal, Indeed Career Guide) : poids fort aux compétences
  techniques et à l'intitulé, **peu aux soft skills**, pénalité sur les mots-clés
  exigés absents.

## 3. La règle (méthode skill, simplifiée)

### Étape 1 — Extraire les mots-clés critiques de l'offre

8 à 15 mots-clés ou expressions, classés en 4 catégories :
- **Compétences techniques** (outils, méthodes, langages) ;
- **Compétences métier** (domaines, secteurs, fonctions) ;
- **Soft skills exigés** (comptent peu) ;
- **Exigences administratives** (diplôme, années d'expérience, langues, mobilité).

### Étape 2 — Marquer la présence dans le profil

Pour chaque mot-clé : **Présent** (1), **Partiel** (0.5, dérivé/implicite), **Absent** (0).

### Étape 3 — Calculer le score

```
Score brut = (Présent x 1 + Partiel x 0.5) / Total des mots-clés x 100
```

Pondérations :
- **Pénalité diplôme** : -10 si une exigence de diplôme n'est pas respectée ;
- **Pénalité expérience** : -5 par tranche de 3 ans manquants ;
- **Bonus intitulé exact** : +10 si l'intitulé du dernier poste correspond
  **exactement** à l'intitulé visé ;
- **Malus de surqualification** : -15 à -20 lorsque (a) la séniorité du profil dépasse
  **nettement** le niveau du poste ET (b) la couverture brute est quasi totale
  (**>= 90 %**). C'est le cas où un score de couverture **surévaluerait** l'adéquation :
  un profil très senior coche tous les mots-clés d'un poste sous son niveau et
  ressortirait artificiellement en tête. Hors cette configuration, la surqualification
  n'entre PAS dans le score : elle est portée par le **positionnement** (qualitatif).

Score final borné à 0-100.

### Étape 4 — Interpréter

| Plage | Lecture |
|---|---|
| `> 80` | Forte adéquation : le dossier devrait passer le filtre automatique. |
| `60 - 80` | Adéquation moyenne : passage incertain selon la rigueur du tri. |
| `< 60` | Adéquation faible : susceptible d'être éliminé au tri sauf intervention humaine. |

Seuils de la démo (badge/tri, dans `lib/data.ts`) : **seuil de pertinence = 70** ;
**prioritaire = score >= 85**.

## 4. Application figée dans la démo

Pour chaque offre, le jeu de mots-clés exigés est porté par `atsMatch.covered`
(Présent) et `atsMatch.missing` (Absent) ; le score figé en découle via l'étape 3.

Particularités des données actuelles (documentées et assumées) :
- **Aucun bonus intitulé** : aucun dernier poste d'un persona ne correspond
  *exactement* à un intitulé d'offre (ex. "Growth Marketer" vs "Growth Manager"),
  donc +10 ne s'applique nulle part.
- **Aucune pénalité diplôme/expérience** : les trois personas satisfont les exigences
  de diplôme et d'expérience des offres de leur secteur (écarts d'expérience < 3 ans).
- **Un seul malus de surqualification, sur `fi-2`.** Claude R. (niveau DAF) couvre
  **100 %** des compétences d'un poste de "Responsable du contrôle de gestion",
  nettement sous son niveau. Calcul : couverture brute 100 -> malus **-18** ->
  **score figé 82**. C'est la **seule** offre du jeu à réunir les deux conditions :
  la condition (b) couverture >= 90 % n'est atteinte QUE par `fi-2` (toutes les autres
  offres sont <= 89 %), donc le malus ne peut s'appliquer qu'à elle. Sa surqualification
  reste par ailleurs traitée par le **positionnement (Moyen)** et la **ligne rouge
  rémunération**.
- Pour les autres offres, le score figé est essentiellement le **taux de couverture**
  des compétences exigées (Présent / Total x 100), conformément à l'étape 3.

> **Alignement (juin 2026).** L'ancienne règle de la démo pondérait des composantes
> (intitulé 30 / compétences 45 / diplôme 15 / bonus 10), ce qui gonflait les scores
> via la composante intitulé. L'alignement sur la formule de couverture ci-dessus a
> fait **baisser la plupart des scores** (méthode plus conservatrice et éprouvée).
> Détail du décalage dans le rapport de transposition.

> **Règle simplifiée** : le vrai matching ATS (TF-IDF / similarité vectorielle sur le
> texte complet) reste une **cible V2**. Le `Partiel` est peu utilisé ici (données
> figées binaires couvert/manquant) ; il est conservé dans la méthode pour fidélité.
