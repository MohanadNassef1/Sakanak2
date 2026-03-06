import { RoommateProfile, RoommateWithScore, MatchingCriteria } from '@/types/roommate';

interface MatchWeight {
  weight: number;
  reason: string;
}

// Scoring weights - can be adjusted by admin in the future
const WEIGHTS = {
  gender: { weight: 30, reason: 'Same gender preference' },
  smoking: { weight: 25, reason: 'Matching smoking preference' },
  pets: { weight: 20, reason: 'Compatible pet policy' },
  occupation: { weight: 15, reason: 'Similar occupation' },
  lookingFor: { weight: 10, reason: 'Compatible living preferences' },
};

const BEST_MATCH_THRESHOLD = 75;

/**
 * Calculate compatibility score between current user and a potential roommate
 */
export function calculateCompatibilityScore(
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
    // Slight penalty if user doesn't have pets but candidate does
    score += WEIGHTS.pets.weight * 0.5;
    reasons.push('Candidate has pets');
  }

  // Occupation similarity (if both have occupations listed)
  if (currentUser.occupation && candidate.occupation) {
    const userOcc = currentUser.occupation.toLowerCase();
    const candOcc = candidate.occupation.toLowerCase();
    
    // Check for common occupation keywords
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

  return { score: Math.min(score, 100), reasons };
}

/**
 * Score and sort roommates by compatibility
 */
export function rankRoommates(
  currentUser: MatchingCriteria,
  candidates: RoommateProfile[]
): RoommateWithScore[] {
  return candidates
    .filter(candidate => candidate.user_id !== currentUser.gender) // Don't show current user
    .map(candidate => {
      const { score, reasons } = calculateCompatibilityScore(currentUser, candidate);
      return {
        ...candidate,
        compatibilityScore: score,
        matchReasons: reasons,
        isBestMatch: score >= BEST_MATCH_THRESHOLD,
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
  return `${reasons.slice(0, 2).join(' • ')}`;
}
