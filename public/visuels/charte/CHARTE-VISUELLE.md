# Charte visuelle — job-pipeline

> Habillage illustration flat « Alegria retenue ». Document de référence pour
> l'intégration front. À lire avec la skill `design-taste-frontend` (`.agents/skills/`).
> Assets vectoriels dans `./assets/`.

---

## 1. Intention

Site premium, léché, rassurant (façon Malt). Lecteur le plus exigeant = **DAF
senior** : la crédibilité prime sur l'audace. Style flat illustration, mais en
**version retenue** — beaucoup de blanc, l'illustration ponctue, elle n'envahit
jamais.

**Règle d'or — si un écran hésite entre « une illustration de plus » et « du
blanc », choisir le blanc.**

---

## 2. Règle 70 / 20 / 10

| Part | Rôle | Couleurs |
|------|------|----------|
| **70 %** | Fond, respiration | blanc `#ffffff`, surface `#faf8f5` |
| **20 %** | Texte, aplats illustration | gris chauds (`#6b645c` → `#2e2a26`) |
| **10 %** | Point chaud | corail `#f2552d` |

**Un seul point chaud corail par écran** : un bouton clé, OU un visage/détail, OU
une carte prioritaire. Jamais les trois en même temps.

---

## 3. Tokens couleur

Les variables corail existent déjà dans `app/globals.css` — **ne pas les changer**.
Ce qui suit ajoute les **neutres chauds** et les **teintes de peau** propres à
l'illustration.

### 3.1 Accent (déjà en place)
```
--accent:        #f2552d   /* corail — point chaud */
--accent-strong: #d8401b   /* corail foncé — texte sur soft, score haut */
--accent-soft:   #fff1ec   /* aplat corail très clair — zones hero/badges */
```

### 3.2 Neutres chauds — à ajouter
Le repo utilise des gris froids (`#18181b`, `#6b7280`, `#ececef`). L'illustration
demande des gris **chauds** pour rester cohérente. Ajouter dans `:root` :
```
--ink:          #2e2a26   /* titres */
--ink-soft:     #6b645c   /* texte courant chaud */
--ink-faint:    #8a8278   /* labels, légendes */
--surface-warm: #faf8f5   /* surface chaude */
--line-warm:    #ece8e2   /* filets, bordures cartes illustrées */
--fill-warm:    #bcb4a8   /* aplat principal (corps, vêtements) */
```

### 3.3 Teintes de peau — NON réalistes (garde-fou anti-biais)
Choix esthétique **et** éthique : on ne genre ni n'ethnicise. Ne jamais virer
vers des tons réalistes.
```
peau corail clair  #f4a78f   (Camille / hero)
peau beige         #e8cfb6   (Sacha)
peau gris-rosé     #d9c2c2   (Claude)
ombre peau         #ec9a82 / #ddc1a6 / #cdb2b2   (cou)
cheveux            #6b5d4f · #4a443d · #9a9389 (gris) · #43403a
yeux / traits      #3a342e
```

### 3.4 Scores (déjà en place — ne pas illustrer en arc-en-ciel)
Dans l'illustration, **un seul** score est mis en avant (corail) ; les autres
restent en gris chaud neutre, même s'ils sont « hauts ». Les pastilles de score
fonctionnelles de l'UI gardent leurs tokens `--score-*`.

---

## 4. Typo

**Inter** (déjà chargée via `--font-inter`). Titres généreux (`font-weight 700/800`,
`letter-spacing -.02em`), corps aéré (`line-height 1.45–1.5`), hiérarchie nette.
Aucune autre famille.

---

## 5. Style d'illustration (cohérence absolue hero ↔ avatars)

- **Flat vector**, personnages stylisés à l'extrême, proportions simplifiées.
- **Visages quasi vides** : yeux = 2 points (`#3a342e`), **pas de bouche, pas de
  nez**. C'est volontaire — ça humanise sans genrer ni ethniciser.
- **2–3 couleurs max par illustration**, pas de dégradés, pas d'arc-en-ciel.
- Hero et avatars sont **de la même main** : mêmes proportions de tête
  (`rx≈23 / ry≈26`), mêmes yeux, même casque de cheveux, mêmes peaux.

La même figure de référence sert au hero ET aux avatars (cf. `hero-mur-offres.svg`
et les 3 `avatar-*.svg`).

---

## 6. Assets livrés (`./assets/`)

| Fichier | Usage | viewBox |
|---------|-------|---------|
| `hero-mur-offres.svg` | **Hero recommandé** (variante A1, la + sobre) | `0 0 520 300` |
| `avatar-camille.svg` | Persona RH junior — fond gris chaud pâle | `0 0 100 100` |
| `avatar-sacha.svg` | Persona Marketing confirmé — fond sable | `0 0 100 100` |
| `avatar-claude.svg` | Persona Finance senior — fond taupe | `0 0 100 100` |
| `spot-ligne-rouge.svg` | Spot « seuil » (ligne rouge élégante) | `0 0 560 150` |
| `spot-etat-vide.svg` | Spot état vide / confirmation | `0 0 560 140` |

Les avatars sont **ronds** (clip circulaire intégré), cadrage buste, lisibles de
**28 px à 150 px**. Chaque fichier a un `clipPath` à id unique → aucun risque de
collision si plusieurs sont inlinés sur la même page.

> Le hero existe aussi en 3 autres variantes (A2 flux, B1/B2 CV) dans la planche
> de validation `Habillage visuel.dc.html` / `public/visuels/Habillage visuel.pdf`.
> A1 est le choix par défaut. Demander si une autre piste est retenue.

---

## 7. Intégration dans le repo

### 7.1 Où poser les fichiers
Copier `charte/assets/*.svg` dans `public/visuels/` (à côté des visuels existants).

### 7.2 Mapping personas → avatars
`data/personas.json` porte les `id` `camille` / `sacha` / `claude`. Brancher
l'avatar par convention de nom : `/visuels/avatar-${persona.id}.svg`.

Composant à habiller en priorité : **`components/PersonaCard.tsx`** (remplacer les
initiales `initials` par l'avatar) et l'en-tête de **`app/p/[persona]`**.

### 7.3 Spots → composants existants
- `spot-ligne-rouge.svg` → **`components/RedLineCallout.tsx`** (le moment seuil).
- `spot-etat-vide.svg` → états vides / confirmations (fin de funnel, listes vides).

### 7.4 Hero
Poser `hero-mur-offres.svg` dans le bloc haut de `app/page.tsx`, à droite du
titre, sur fond blanc. Ne **pas** ajouter d'autre illustration sur cet écran.

### 7.5 Inline vs `<img>`
- **Avatars & spots** : `<img src="/visuels/avatar-camille.svg" alt="" />` suffit
  (pas d'interaction, couleurs fixes).
- **Hero** : inliner le SVG (ou composant React) seulement si on veut animer/recolorier.
  Sinon `<img>` est plus simple et évite les collisions d'id.

---

## 8. Ce qu'on NE veut PAS

- ❌ Photos de personnes réelles (RGPD + biais) — aucune dans `public/visuels`.
- ❌ Banque d'images générique.
- ❌ Palette vive multi-couleurs « corporate Memphis » / facebookienne.
- ❌ Dégradés lourds, ombres tape-à-l'œil.
- ❌ Plus d'un point chaud corail par écran.
- ❌ Surcharge : dans le doute, du blanc.

### Icônes
Une **seule** librairie outline (pas de génération maison, pas de mix). Trait fin,
cohérent avec la finesse de l'illustration.
