// Construction des prompts des deux actions live. Le document de vérité (avec ses
// lignes rouges) et le CV de référence sont la SEULE source de faits autorisée.

import type { CV, Offer } from "./types";

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

export function buildCvPrompt(truth: string, baseCv: CV, offer: Offer) {
  const system = [
    "Tu es un coach qui adapte un CV à une offre précise, en français.",
    "On te donne le DOCUMENT DE VÉRITÉ du profil, son CV DE RÉFÉRENCE (faits avérés) et une OFFRE.",
    "Produis une version du CV REPRIORISÉE et REFORMULÉE POUR cette offre :",
    "accroche (`summary`) réécrite pour la cible, compétences réordonnées (`highlightedSkills`),",
    "expériences pertinentes remontées et reformulées (verbes d'action, faits chiffrés du profil).",
    "",
    "RÈGLE ABSOLUE — NON NÉGOCIABLE :",
    "n'invente JAMAIS une compétence, expérience, diplôme ou chiffre absent du document de vérité",
    "ou du CV de référence. Tu réordonnes et reformules des faits existants, tu n'en crées pas.",
    "Si l'offre exige quelque chose que le profil n'a pas, ne le fabrique pas : liste-le dans",
    "`missingForOffer`. `tailoredFor` doit reprendre l'intitulé exact de l'offre.",
  ].join("\n");

  const user = [
    "# Document de vérité du profil",
    truth.trim(),
    "",
    "# CV de référence (faits avérés — ne pas dépasser)",
    JSON.stringify(baseCv, null, 2),
    "",
    "# Offre cible",
    offerBlock(offer),
  ].join("\n");

  return { system, user };
}
