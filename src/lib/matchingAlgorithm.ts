import { RoommateProfile, RoommateWithScore, MatchingCriteria } from '@/types/roommate';

interface MatchWeight {
  weight: number;
  reason: string;
}

// Rule-based scoring weights (max 60 points)
const WEIGHTS = {
  gender: { weight: 20, reason: 'Same gender preference' },
  smoking: { weight: 15, reason: 'Matching smoking preference' },
  pets: { weight: 10, reason: 'Compatible pet policy' },
  occupation: { weight: 10, reason: 'Similar occupation' },
  lookingFor: { weight: 5, reason: 'Compatible living preferences' },
};

// AI semantic scoring adds up to 40 points on top
const BEST_MATCH_THRESHOLD = 75;

export interface AIMatchScore {
  score: number;
  reason: string;
}

/**
 * Calculate rule-based compatibility score (max 60)
 */
export function calculateRuleBasedScore(
  currentUser: MatchingCriteria,
  candidate: RoommateProfile
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Gender matching (mandatory in this system - same gender only)
  if (currentUser.gender === candidate.gender) {
    score += WEIGHTS.gender.weight;
    reasons.push(WEIGHTS.gender.reason);
  }

  // Smoking compatibility
  if (currentUser.is_smoker === candidate.is_smoker) {
    score += WEIGHTS.smoking.weight;
    reasons.push(
      candidate.is_smoker 
        ? 'Both comfortable with smoking' 
        : 'Both prefer smoke-free environment'
    );
  }

  // Pets compatibility
  if (currentUser.has_pets === candidate.has_pets) {
    score += WEIGHTS.pets.weight;
    reasons.push(
      candidate.has_pets 
        ? 'Both have pets' 
        : 'Both prefer pet-free environment'
    );
  } else if (!currentUser.has_pets && candidate.has_pets) {
    score += WEIGHTS.pets.weight * 0.5;
    reasons.push('Candidate has pets');
  }

  // Occupation similarity
  if (currentUser.occupation && candidate.occupation) {
    const userOcc = currentUser.occupation.toLowerCase();
    const candOcc = candidate.occupation.toLowerCase();
    
    const occupationCategories = [
      ['student', 'university', 'college', 'studying'],
      ['engineer', 'developer', 'programmer', 'tech', 'software'],
      ['doctor', 'nurse', 'medical', 'healthcare', 'hospital'],
      ['teacher', 'professor', 'educator', 'instructor'],
      ['business', 'manager', 'executive', 'entrepreneur'],
      ['freelance', 'remote', 'work from home'],
    ];

    for (const category of occupationCategories) {
      const userMatch = category.some(k => userOcc.includes(k));
      const candMatch = category.some(k => candOcc.includes(k));
      if (userMatch && candMatch) {
        score += WEIGHTS.occupation.weight;
        reasons.push(WEIGHTS.occupation.reason);
        break;
      }
    }
  }

  // Looking for preferences alignment
  if (currentUser.looking_for && candidate.looking_for) {
    const userPrefs = currentUser.looking_for.toLowerCase();
    const candPrefs = candidate.looking_for.toLowerCase();
    
    const preferenceKeywords = ['quiet', 'clean', 'tidy', 'social', 'friendly', 'professional', 'student'];
    const sharedPrefs = preferenceKeywords.filter(
      k => userPrefs.includes(k) && candPrefs.includes(k)
    );
    
    if (sharedPrefs.length > 0) {
      score += WEIGHTS.lookingFor.weight;
      reasons.push('Similar lifestyle preferences');
    }
  }

  return { score: Math.min(score, 60), reasons };
}

/**
 * Merge rule-based and AI scores
 */
export function mergeScores(
  ruleScore: number,
  ruleReasons: string[],
  aiScore?: AIMatchScore
): { score: number; reasons: string[]; isBestMatch: boolean } {
  const totalScore = Math.min(ruleScore + (aiScore?.score || 0), 100);
  const reasons = [...ruleReasons];
  
  if (aiScore?.reason) {
    reasons.push(`🤖 ${aiScore.reason}`);
  }

  return {
    score: totalScore,
    reasons,
    isBestMatch: totalScore >= BEST_MATCH_THRESHOLD,
  };
}

/**
 * Calculate compatibility score between current user and a potential roommate
 * (backwards compatible - used when AI scores aren't available)
 */
export function calculateCompatibilityScore(
  currentUser: MatchingCriteria,
  candidate: RoommateProfile
): { score: number; reasons: string[] } {
  const { score, reasons } = calculateRuleBasedScore(currentUser, candidate);
  // Scale up to 100 for backwards compatibility when no AI
  const scaledScore = Math.min(Math.round(score * (100 / 60)), 100);
  return { score: scaledScore, reasons };
}

/**
 * Score and sort roommates by compatibility (rule-based only)
 */
export function rankRoommates(
  currentUser: MatchingCriteria,
  candidates: RoommateProfile[],
  aiScores?: Record<string, AIMatchScore>
): RoommateWithScore[] {
  return candidates
    .filter(candidate => candidate.user_id !== currentUser.gender)
    .map(candidate => {
      const { score: ruleScore, reasons: ruleReasons } = calculateRuleBasedScore(currentUser, candidate);
      const aiScore = aiScores?.[candidate.user_id];
      const { score, reasons, isBestMatch } = mergeScores(ruleScore, ruleReasons, aiScore);
      
      return {
        ...candidate,
        compatibilityScore: score,
        matchReasons: reasons,
        isBestMatch,
      };
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

/**
 * Get a human-readable explanation of the match
 */
export function getMatchExplanation(reasons: string[]): string {
  if (reasons.length === 0) {
    return 'Basic compatibility';
  }
  if (reasons.length === 1) {
    return reasons[0];
  }
  return `${reasons.slice(0, 3).join(' • ')}`;
}
