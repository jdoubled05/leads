export type LeadInputs = {
  estEquity: number;
  timeline: string;
  creditBand: string;
  primaryResidence: boolean;
  useCase: string;
};

export type LeadScoreResult = {
  score: number;
  tier: "HOT" | "WARM" | "NURTURE";
};

export function scoreLead(inputs: LeadInputs): LeadScoreResult {
  let score = 0;

  if (inputs.estEquity >= 100000) {
    score += 25;
  } else if (inputs.estEquity >= 50000) {
    score += 15;
  }

  if (inputs.timeline === "0-30" || inputs.timeline === "1-3") {
    score += 25;
  }

  if (inputs.creditBand === "740+" || inputs.creditBand === "700-739") {
    score += 20;
  }

  if (inputs.primaryResidence) {
    score += 15;
  }

  if (
    inputs.useCase === "home_improvement" ||
    inputs.useCase === "debt_consolidation"
  ) {
    score += 15;
  }

  score = Math.min(score, 100);

  let tier: LeadScoreResult["tier"] = "NURTURE";
  if (score >= 70) {
    tier = "HOT";
  } else if (score >= 50) {
    tier = "WARM";
  }

  return { score, tier };
}
