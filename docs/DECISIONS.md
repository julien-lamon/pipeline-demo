# Journal des décisions — job-pipeline-demo

> Document de consolidation rédigé a posteriori (28 juin 2026). Il retrace les
> décisions **stratégiques** et **techniques** structurantes du projet, avec pour
> chacune l'option retenue, les alternatives écartées et la raison du choix.
>
> **Comment lire ce document.** Il s'adresse à deux lecteurs : un recruteur qui veut
> comprendre la démarche en quelques minutes (lire les sections 1 à 3 et la
> chronologie des virages en fin de document), et un développeur qui reprend le
> projet (tout le document, plus `docs/ARCHITECTURE.md`).
>
> Format : chaque décision est numérotée `Dn`. Statuts : **Implémentée** /
> **Actée — à implémenter** (V2 ou prod) / **En attente d'arbitrage**.

---

## 1. Cadre, méthode et stratégie produit

### D1 — Séparation maîtrise d'ouvrage / exécution (AMO ↔ MOE)
**Décision.** Le pilotage sépare la *décision* (assistant à maîtrise d'ouvrage : cadrage,
arbitrages, rédaction de briefs, recette) de l'*exécution* (agent codeur opérant sur la
machine locale). Le handoff se fait par des **briefs atomiques** versionnés ; chaque
livrable est recetté sur pièces (diff, sorties de commande, écarts déclarés).
**Pourquoi.** Garder une trace explicite du raisonnement, éviter la dérive d'un agent
laissé en autonomie, et produire une démarche reproductible et auditable.
**Statut.** Implémentée (méthode appliquée sur toute la durée du projet).

### D2 — Une démo vitrine, pas un produit SaaS
**Décision.** Construire une **démonstration de portfolio** permettant à un RH ou un
dirigeant de comprendre le concept (veille scorée → coaching → CV/lettre adaptés) en
moins de trois minutes, sans inscription ni paiement.
**Écarté.** Un plan de SaaS complet (comptes payants, facturation, freemium, B2B,
multi-utilisateurs) proposé par une plateforme tierce.
**Pourquoi.** L'objectif réel est de démontrer une compétence et de soutenir une
recherche d'emploi, pas de lancer une entreprise. Un SaaS aurait détourné l'effort vers
un projet entrepreneurial à part entière (charge RGPD, juridique, support), incompatible
avec le but et avec le principe de simplicité (R2).
**Statut.** Implémentée.

### D3 — Rejet de la plateforme tierce « Polsia » comme socle d'infrastructure
**Décision.** Ne pas adosser le projet à la plateforme qui avait produit le plan SaaS.
**Pourquoi.** Le plan était une offre commerciale déguisée en conseil : le modèle
économique de la plateforme (abonnement + commission sur le revenu généré, hébergement
sur sa propre infrastructure) la mettait en conflit d'intérêt. S'y ajoutaient un risque
documenté de verrouillage (déploiement et domaine captifs) et une réputation publique
défavorable — incompatibles avec un projet portfolio que l'auteur veut **maîtriser et
porter sur sa propre infrastructure**.
**Principe dégagé.** Toute plateforme commerciale produisant une recommandation
stratégique doit être évaluée pour conflit d'intérêt avant que son conseil soit suivi.
**Statut.** Implémentée.

### D4 — Repo dédié, séparé du pipeline Python
**Décision.** La démo vit dans un dépôt distinct (`job-pipeline-demo`), séparé de l'outil
personnel Python (`job-pipeline`).
**Écarté.** Un sous-dossier du repo existant.
**Pourquoi.** Écosystèmes techniques distincts (web TypeScript vs pipeline Python) ;
une vitrine séparée est plus lisible pour un relecteur ; la démo **réimplémente** la
logique métier plutôt que de réutiliser le code Python (voir D17).
**Statut.** Implémentée.

---

## 2. Personas et contenu

### D5 — Trois personas fictifs, multi-secteurs
**Décision.** Trois personas couvrant trois métiers et trois niveaux de séniorité :
Camille D. (Ressources humaines, junior), Sacha O. (Marketing digital, confirmé),
Claude R. (Direction financière, senior). Chacun dispose d'un « document de vérité »
(profil détaillé fictif) et d'un jeu d'offres dédié à son secteur.
**Pourquoi.** Trois domaines distincts démontrent que l'outil est **générique** (il ne
fonctionne pas que pour un métier), ce qui est un meilleur argument produit qu'un cas
unique.
**Statut.** Implémentée.

### D6 — Prénoms non genrés, initiale seule, pas de photo
**Décision.** Prénoms épicènes (Camille, Sacha, Claude), nom réduit à une initiale, aucune
photographie de personne.
**Pourquoi.** Trois bénéfices cumulés : aucune donnée personnelle réelle exposée ;
zéro problème de droit à l'image ; et un sous-texte « outil neutre, sans biais de genre »
qui parle aux recruteurs sensibilisés aux biais. Les avatars sont des illustrations
stylisées (visages volontairement minimalistes), pas des photos.
**Statut.** Implémentée.

---

## 3. Stack et architecture

### D7 — Next.js (App Router) + TypeScript + Tailwind, déployé sur Vercel
**Décision.** Un projet Next.js unique contenant le front **et** les routes serveur.
**Écarté.** Vite + React (qui aurait imposé un backend séparé pour le coach live).
**Pourquoi.** Un seul projet, un seul déploiement gratuit et maîtrisé ; les routes API
serveur du même projet hébergent le relais qui détient la clé (voir D11) ; stack standard,
immédiatement reconnaissable par un employeur technique.
**Statut.** Implémentée.

### D8 — Parcours en cinq écrans, puis quatre étapes de coaching
**Décision.** Accueil (choix du persona) → offres scorées → détail de l'offre → coach →
CV. Le coaching live s'est ensuite structuré en quatre actions : analyser, générer le CV,
générer la lettre.
**Pourquoi.** Un funnel linéaire et lisible incarne le récit produit. La frontière
« veille figée » / « coaching live » calque la séparation des lots de travail.
**Statut.** Implémentée.

### D9 — Direction visuelle : premium sobre, inspirée des job boards modernes
**Décision.** Esthétique épurée (beaucoup de blanc, un accent corail `#f2552d` unique,
typographie Inter), inspirée de l'esprit des job boards modernes sans copier de marque.
Le CV de sortie adopte une charte **plus sobre encore** (anthracite + bleu pétrole),
distincte du site, pour rester crédible aux yeux d'un vrai recruteur.
**Pourquoi.** Le public le plus exigeant (un DAF senior) valorise la crédibilité sur
l'audace ; l'effet « waouh » doit venir du raisonnement de l'IA montré en direct, pas de
la décoration.
**Statut.** Implémentée.

---

## 4. Conception du coach (cœur du produit)

### D10 — Coaching live sur données fixes, full-bouton
**Décision.** Le coach effectue de **vrais appels au modèle**, mais sur des données
**figées** (persona + offre de la démo). Le visiteur n'a **aucune saisie de texte libre** :
il déclenche des actions par boutons.
**Pourquoi.** Deux bénéfices : la surface d'attaque par injection de prompt est quasi
nulle (l'auteur contrôle 100 % de ce qui entre dans le modèle) ; et un parcours par
boutons est plus lisible pour un RH pressé. L'upload de CV réel et la saisie d'offre à la
main relèvent d'un palier ultérieur (testeurs invités), hors périmètre de la démo.
**Statut.** Implémentée.

### D11 — Relais serveur détenteur de la clé ; clé jamais côté client
**Décision.** Les appels au modèle passent par des routes serveur qui détiennent la clé
API (variable d'environnement). Le navigateur n'appelle jamais l'API directement.
**Écarté.** Appel direct depuis le front (exposerait la clé), et champ « collez votre clé »
dans l'UI (mauvaise pratique de sécurité ; conservé uniquement comme possibilité
**documentée** pour un testeur technique en local).
**Statut.** Implémentée.

### D12 — Parcours en deux temps : analyse narrative streamée, puis livrables structurés
**Décision.** L'étape « Analyser » produit une **analyse narrative diffusée token par token**
(effet « réflexion en direct »). Les étapes CV et lettre utilisent une **sortie structurée**
(format garanti), sans streaming narratif.
**Pourquoi.** Un JSON structuré ne se lit pas comme une pensée : le spectacle, c'est
l'analyse qui se déroule en direct. Le CV et la lettre, eux, sont des documents : ils
exigent un format déterministe, pas une narration. Le séquencement (analyse → puis
livrables) remet aussi le raisonnement avant le résultat, et le gating économise les
appels (on ne paie un livrable que si le visiteur va au bout).
**Statut.** Implémentée.

---

## 5. Scoring ATS et indicateur de positionnement

### D13 — Deux axes indépendants : score ATS (mesurable) vs jugement du coach (qualitatif)
**Décision.** Séparer nettement (a) un **score ATS** = proximité sémantique offre/profil,
déterministe, et (b) la **couche coach** = jugement qualitatif appliquant les lignes
rouges. Les deux sont indépendants : une offre peut avoir un bon score ATS **et** franchir
une ligne rouge — c'est même le cas le plus démonstratif.
**Pourquoi.** C'est le fonctionnement réel des ATS (parsing + correspondance de mots-clés,
pondérant les compétences techniques et l'intitulé, ignorant les soft skills). Le message
produit devient lisible : « l'ATS dit si tu passes la machine ; le coach dit si tu dois y
aller ».
**Statut.** Implémentée. **Sources** citées dans `docs/scoring-ats.md`.

### D14 — Score ATS figé (Option 1), fabriqué hors-ligne avec une règle documentée
**Décision.** Les scores de la démo sont **calculés une fois, hors-ligne, puis figés** dans
les données. Aucun recalcul au runtime, aucun appel au modèle en production pour le score.
La règle de calcul est documentée et alignée sur la méthode de la skill de coaching
(couverture de mots-clés : `(Présent×1 + Partiel×0,5) / Total ×100`, pénalités diplôme et
expérience, bonus intitulé exact).

**Raffinement — malus de surqualification (commit 0232d38).** Un **malus de -15 à -20**
est appliqué lorsque (a) la séniorité du profil dépasse **nettement** le niveau du poste
**et** (b) la couverture brute est quasi totale (**≥ 90 %**) — la seule configuration où
un simple taux de couverture **surévaluerait** l'adéquation (un profil très senior coche
tous les mots-clés d'un poste sous son niveau et ressortirait artificiellement en tête).
C'est une **propriété de l'ATS réel**, pas une contamination par le positionnement : hors
cette configuration, la surqualification reste portée par le **positionnement** (qualitatif),
jamais par le score. Application unique sur `fi-2` (Claude R. couvre 100 % d'un poste de
contrôle de gestion sous son niveau) : couverture brute 100 → malus -18 → **score figé 82**
(commit 32b2251). Détail dans `docs/scoring-ats.md` §3.
**Écarté.** (a) Un vrai algorithme TF-IDF déterministe en production (reporté en V2,
trop de travail pour la démo) ; (b) un recalcul du score par le modèle à chaque visite
(circulaire et coûteux).
**Pourquoi.** Figer garantit le déterminisme et le coût nul en production ; documenter la
règle la rend défendable en entretien et crédible pour un relecteur.
**Statut.** Implémentée. **Dette mineure :** le calcul réutilise un appariement
couvert/manquant binaire comme proxy, sans ré-extraction complète des mots-clés en quatre
catégories (le « partiel » n'est pas exploité). Sans impact à l'usage.

### D15 — Indicateur recadré : « positionnement sur l'offre » (5 niveaux), et non « chances d'entretien »
**Décision.** Renommer l'indicateur qualitatif « chances d'entretien » (3 niveaux) en
**« positionnement sur l'offre »** (5 niveaux : Très faible → Très fort). Il mesure la
**solidité du dossier face à l'offre**, pas une prédiction de réponse du recruteur. Le
calibrage est **baissier par défaut** (le volume de candidatures, le poids du réseau et la
non-réponse fréquente tirent vers le bas) ; « Très fort » est réservé à un différenciateur
**rare** (poste équivalent déjà tenu dans une organisation comparable, avec résultat
prouvé — un diplôme prestigieux seul ne suffit pas).
**Déclencheur.** Constat de terrain : sur ~20 candidatures réelles notées « fortes » ou
« très fortes » par l'outil personnel, aucune réponse RH. L'indicateur promettait une issue
que ni l'outil ni personne ne peut tenir.
**Pourquoi.** « Chances d'entretien » confond adéquation et probabilité de réponse, ce qui
produit un biais d'optimisme et, à l'usage, de la frustration. Mesurer ce que le candidat
**contrôle** (la solidité de son dossier) plutôt que ce qu'il ne contrôle pas (la réaction
du recruteur) est plus honnête et plus crédible — un outil lucide rassure un RH.
**Statut.** Implémentée. **À implémenter (perso, V2) :** porter le même recadrage dans
l'outil personnel `analyzer.py`.

---

## 6. Lettre de motivation

### D16 — Lettre générée à la volée, cloison analyse/livrable, ton « plaidoyer »
**Décision.** La lettre est générée à la volée à partir du document de vérité et de l'offre
(jamais pré-rédigée, jamais à partir du CV généré). Contraintes : ≤ 1800 signes, structure
en quatre paragraphes (dont un paragraphe « premiers chantiers » différenciant), peu
chiffrée (le CV porte les chiffres). **Cloison stricte :** l'analyse dit la vérité au
candidat ; la lettre, elle, est un acte de candidature et **ne déconseille jamais**, même
sur une offre qui franchit une ligne rouge — dans ce cas elle **assume l'écart et le
retourne en valeur ajoutée** (mode « plaidoyer »).
**Déclencheur.** Une lettre générée pour une offre franchissant une ligne rouge se
**sabotait** elle-même (elle expliquait au recruteur pourquoi ne pas recruter le candidat).
La cause : l'analyse contaminait le livrable.
**Pourquoi.** Conseiller et exécuter sont deux actes distincts. Une ligne rouge n'est pas
un veto : c'est un coût que le candidat peut choisir d'assumer (cas « tir au but »). Montrer
que l'outil sait **conseiller lucidement et exécuter quand même** est un argument de démo
fort. Un seul bouton (toujours en mode plaidoyer) ; l'avertissement reste dans l'analyse,
en amont.
**Statut.** Implémentée.

### D17 — Le coaching transpose la méthode de la skill `coach-carriere`, sans la consommer
**Décision.** La qualité du coaching (posture honnête/probabiliste/actionnable, « un CV est
un récit », règles d'écriture CV/LM, séparation ATS/positionnement) est **transposée** dans
les prompts de la démo. La démo ne **charge pas** la skill personnelle.
**Écarté.** Faire consommer la skill par la démo (couplage entre l'outil personnel et le
produit public).
**Pourquoi.** Le couplage réintroduirait une dépendance fragile et mêlerait données
personnelles et produit public. La démo est volontairement une version **plus mince et
non-interactive** de la méthode (un seul parcours lisible vs six modes). La divergence est
assumée et documentée dans `docs/coaching-methode.md` ; la skill reste la source de vérité
côté outil personnel.
**Statut.** Implémentée.

---

## 7. Sécurité, garde-fous et données

### D18 — Garde-fous budget en couches
**Décision.** Plafond de dépense global (10 €/jour, coupure propre au-delà), quota par
email, **blocage à une génération par couple offre × persona** (bouton grisé après succès,
régénération volontaire explicite), et **throttle** (délai minimum entre deux générations)
appliqué **côté serveur**.
**Pourquoi.** Un lien public + des boutons payants est une cible pour les scripts. La
combinaison « une génération par offre + throttle » plafonne mécaniquement le coût et
réduit fortement la surface d'abus, sans dégrader l'expérience.
**Statut.** Implémentée.

### D19 — Anti-bot léger d'abord, Cloudflare en réserve
**Décision.** Commencer **sans** CAPTCHA ni service anti-bot, en s'appuyant sur D18. Laisser
le code prêt à recevoir Cloudflare Turnstile plus tard, sans l'implémenter.
**Écarté.** CAPTCHA (dégrade l'expérience d'un RH venu tester en trois minutes).
**Pourquoi.** Simplicité (R2). Pari assumé : un attaquant déterminé pourrait contourner le
throttle (rotation d'emails/IP), mais le blocage « une génération par offre » limite la
casse. Déclencheur de bascule vers Turnstile : abus constatés dans les logs.
**Statut.** Implémentée.

### D20 — Données 100 % fictives ; RGPD par conception
**Décision.** Aucune vraie offre scrapée (elles contiennent des emails → RGPD), aucun
profil réel dans le repo public. La seule donnée personnelle réelle collectée (email de
gating) est limitée à email + horodatage + finalité, avec mention et droit à l'effacement.
**Pourquoi.** Le repo est public ; les données réelles restent locales. C'est la ligne
tenue sur tout le projet.
**Statut.** Implémentée (gating) ; journalisation des emails et de la consommation **à
implémenter** côté prod (voir D23).

---

## 8. Sources de données (orientation V2)

### D21 — Abandon du scraping côté produit web, au profit d'API officielles
**Décision.** Pour la version vivante (V2), remplacer le scraping (fragile, juridiquement
gris) par des **API officielles**.
**Pourquoi.** Robustesse, légalité, et argument portfolio (intégrer une API publique vaut
mieux que gratter un site). Le scraping reste l'affaire de l'outil personnel, pas du produit.
**Statut.** Actée — à implémenter (V2).

### D22 — France Travail primaire, Adzuna en complément, APEC écartée
**Décision.** **France Travail** (API officielle, publique, française, gratuite) comme
source primaire V2 ; **Adzuna** (API développeur officielle, free tier, données salaire,
multi-pays) comme complément / plan B. **APEC écartée** (pas d'API publique ; le scraping
de l'APEC est exclu par principe).
**Pourquoi.** Deux sources officielles couvrent largement le besoin tout en respectant la
ligne « pas de scraping ». À vérifier au moment du cadrage : contrats de licence et limites
de débit.
**Statut.** Actée — à implémenter (V2).

---

## 9. Infrastructure et mise en production

### D23 — Cadrer le passage en production comme une étape dédiée
**Décision.** Traiter la mise en ligne sur Vercel comme un lot de travail à part entière,
avec : clé API **dédiée** au projet (cloisonnement budgétaire, révocable sans impacter
l'outil perso), provisionnement du store managé en production, journalisation des emails et
de la consommation dans ce store (pas dans un fichier local — le système de fichiers
serverless est éphémère), et concordance entre le compteur interne et la consommation réelle.
**Risque identifié.** Le **timeout des fonctions** sur le plan gratuit : un appel à un modèle
d'IA peut dépasser la limite et renvoyer une erreur. Le streaming atténue, mais la
génération structurée (CV/LM) est le point à mesurer. À vérifier : durée réelle d'une
génération → décide du maintien sur le plan gratuit ou du passage au plan payant.
**Contrainte de licence.** Le plan gratuit autorise un usage **non commercial** uniquement
(démo portfolio = conforme ; produit monétisé = plan payant obligatoire).
**Statut.** Actée — à implémenter (étape « C-PROD »).

---

## 10. Outillage d'agent (skills)

### D24 — Une seule skill d'agent, locale ; rejet d'une skill globale auto-suggérante
**Décision.** Conserver la skill `design-taste-frontend` (installée localement dans le repo,
risque évalué faible) ; **désinstaller** `find-skills` (installée globalement, risque évalué
moyen, dont la fonction est de suggérer l'installation d'autres skills).
**Pourquoi.** Cohérence avec le principe de contrôle : on garde l'outil utile et local, on
rejette ce qui est global et qui pousse à étendre la surface sans nécessité (R2). Toute
skill tierce est lue avant usage (elle s'exécute avec les pleins droits de l'agent).
**Statut.** Implémentée.

---

## 11. Décisions en attente et dette tracée

**En attente d'arbitrage**
- **Niveau « Très fort » jamais atteint.** Le calibrage strict fait qu'aucune offre
  n'illustre le cran maximal de l'échelle (le persona finance n'a jamais été numéro un).
  À décider : créer un cas illustratif (une offre taillée pour un persona) ou conserver la
  rigueur à quatre crans visibles.

**Dette tracée (sans action immédiate)**
- Calcul ATS par proxy : la formule de la skill n'est pas appliquée intégralement (pas de
  ré-extraction complète des mots-clés ; « partiel » non exploité). Voir D14.
- ~~README de la démo périmé (décrit encore le coach comme un stub désactivé)~~ —
  **résolu (29 juin 2026)** : README rafraîchi (coach live, versions exactes, store, commandes)
  et `docs/ARCHITECTURE.md` créé lors de la passe de mise en production (brief « déploiement pipeline »).
- Convergence de l'outil personnel `analyzer.py` vers la conception cible (ATS séparé du
  jugement, indicateur « positionnement ») — V2.
- Packaging de la skill `coach-carriere` à corriger (table de routing pointant vers un
  sous-dossier inexistant) — backlog personnel, hors démo.

---

## Annexe — Chronologie des virages assumés

Ces revirements ne sont pas des hésitations à masquer : ils montrent une méthode itérative
qui corrige sur la base de l'évidence. Ils sont conservés volontairement.

1. **Du SaaS à la démo.** Un plan de produit commercial complet a été envisagé puis
   **écarté** au profit d'une démo vitrine, après mise en évidence du conflit d'intérêt de
   la source du plan (D2, D3).
2. **Le score qu'on croyait déterministe.** On a longtemps supposé que le score ATS de
   l'outil personnel était un calcul TF-IDF déterministe. L'**audit du code** a révélé qu'il
   était en réalité produit par le modèle. Conséquence : la démo incarne désormais la
   conception **cible** (ATS séparé), différente de l'outil perso actuel, dont la convergence
   est reportée en V2 (D13, D14).
3. **L'indicateur recadré après le terrain.** « Chances d'entretien » a été remplacé par
   « positionnement sur l'offre » après le constat que des dossiers notés « forts » restaient
   sans réponse RH — l'indicateur promettait une issue intenable (D15).
4. **La lettre qui se sabotait.** Une lettre générée sur une offre franchissant une ligne
   rouge se désistait d'elle-même ; la correction a introduit la cloison analyse/livrable et
   le mode « plaidoyer » (D16).
5. **Du scraping aux API officielles.** L'approche scraping (héritée de l'outil perso) a été
   abandonnée côté produit au profit de France Travail et Adzuna (D21, D22).