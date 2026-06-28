// Construction des prompts des deux actions live. Le DOCUMENT DE VÉRITÉ (avec ses
// lignes rouges) est l'UNIQUE source de faits autorisée, pour l'analyse comme
// pour le CV. Le CV statique n'entre jamais dans le prompt.

import type { Offer } from "./types";

function offerBlock(offer: Offer): string {
  return [
    `Intitulé : ${offer.title}`,
    `Entreprise : ${offer.company}`,
    `Lieu : ${offer.location}`,
    `Contrat : ${offer.contract} · ${offer.remote}`,
    `Tags : ${offer.tags.join(", ")}`,
    `Score veille interne : ${offer.score}/100 (ATS ${offer.scoreAts}/100), ` +
      `chances ${offer.chancesEntretien}, piste ${offer.piste}`,
    `Notes de la veille : ${offer.notes}`,
  ].join("\n");
}

export function buildAnalyzePrompt(truth: string, offer: Offer) {
  const system = [
    "Tu es un coach en repositionnement professionnel, direct et factuel, en français.",
    "On te donne le DOCUMENT DE VÉRITÉ d'un profil (positionnement, cible, réalisations,",
    "compétences et surtout ses LIGNES ROUGES) et une OFFRE d'emploi. Tu évalues l'adéquation.",
    "",
    "Règles :",
    "1. Ne te fonde QUE sur le document de vérité et l'offre. N'invente aucun fait.",
    "2. Si l'offre heurte une ou plusieurs LIGNES ROUGES du profil, signale-le explicitement",
    "   dans `redLines` (une entrée par ligne heurtée). Laisse `redLines` vide si aucune.",
    "3. `gaps` = ce que l'offre exige et que le profil n'a manifestement pas.",
    "4. Sois honnête : ne dis pas oui à tout. Le verdict doit refléter les lignes rouges.",
  ].join("\n");

  const user = [
    "# Document de vérité du profil",
    truth.trim(),
    "",
    "# Offre à analyser",
    offerBlock(offer),
  ].join("\n");

  return { system, user };
}

export function buildCvPrompt(truth: string, offer: Offer) {
  const system = [
    "Tu es un coach qui adapte un CV à une offre précise, en français.",
    "On te donne le DOCUMENT DE VÉRITÉ du profil (son UNIQUE source de faits) et une OFFRE.",
    "Construis un CV complet À PARTIR DU SEUL DOCUMENT DE VÉRITÉ, repriorisé et reformulé",
    "POUR cette offre :",
    "- `name`, `title`, `contact` (email, ville, linkedin) : repris du document de vérité ;",
    "- `summary` : accroche réécrite pour la cible ;",
    "- `highlightedSkills` : compétences du profil réordonnées, les plus pertinentes d'abord ;",
    "- `experiences` : expériences pertinentes remontées et reformulées (verbes d'action,",
    "  faits chiffrés du profil) ;",
    "- `education`, `languages`, `certifications` : repris du document de vérité.",
    "",
    "RÈGLE ABSOLUE, NON NÉGOCIABLE :",
    "n'invente JAMAIS une compétence, expérience, diplôme, certification, langue ou chiffre",
    "absent du document de vérité. Tu réordonnes et reformules des faits existants, tu n'en",
    "crées pas. Si l'offre exige quelque chose que le profil n'a pas, ne le fabrique pas :",
    "liste-le dans `missingForOffer`. `tailoredFor` doit reprendre l'intitulé exact de l'offre.",
    "N'emploie jamais de tiret long (cadratin ou demi-cadratin) ; utilise le trait d'union simple (-).",
  ].join("\n");

  const user = [
    "# Document de vérité du profil (source unique)",
    truth.trim(),
    "",
    "# Offre cible",
    offerBlock(offer),
  ].join("\n");

  return { system, user };
}
