# job-pipeline-demo

Démo web vitrine du projet **job-pipeline** : elle fait comprendre, en moins de
trois minutes et sans inscription, le funnel **veille scorée → coaching ciblé →
CV taillé pour l'offre**.

> ⚠️ **Données 100% fictives et figées.** Cette démo n'appelle **aucune IA**, ne
> contient **aucun secret** et ne fait **aucun appel réseau externe**. Les trois
> personas, leurs offres et leurs CV sont inventés. Le coaching *live* (vrai
> modèle, relais serveur, génération réelle de CV) fera l'objet d'une version
> ultérieure et n'est pas inclus ici.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + TypeScript
- Tailwind CSS v4
- Déployable sur Vercel en zéro-config

## Lancer la démo en local

```bash
npm install   # déjà fait si le repo a été scaffoldé localement
npm run dev
```

Puis ouvrir **http://localhost:3000**.

## Parcours (5 écrans)

1. **Accueil** (`/`) — pitch + choix d'un des 3 profils à incarner.
2. **Offres scorées** (`/p/[persona]/offres`) — liste triée par score, badges
   colorés par niveau, marquage *prioritaire* / *sous le seuil*, recherche et
   filtres décoratifs.
3. **Détail offre** (`/p/[persona]/offres/[offerId]`) — score détaillé
   (score ATS, chances d'entretien, piste A/B, notes) + bouton *Coacher*.
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
