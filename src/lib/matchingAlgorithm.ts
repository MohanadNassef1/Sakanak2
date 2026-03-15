import { RoommateProfile, RoommateWithScore, MatchingCriteria } from '@/types/roommate';

// Scoring weights — rebalanced for more nuanced matching
const WEIGHTS = {
  gender: 20,       // mandatory same-gender (always matches due to DB filter)
  smoking: 20,      // lifestyle deal-breaker
  pets: 15,         // lifestyle factor
  occupation: 10,   // social similarity
  lookingFor: 10,   // preference alignment
  nationality: 15,  // cultural similarity
  personalityTags: 10, // vibe overlap
};

const BEST_MATCH_THRESHOLD = 70;

/**
 * Calculate compatibility score between current user and a potential roommate
 */
export function calculateCompatibilityScore(
  currentUser: MatchingCriteria,
  candidate: RoommateProfile
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Gender matching (mandatory — same gender only, enforced by DB)
  if (currentUser.gender === candidate.gender) {
    score += WEIGHTS.gender;
    // Don't add as reason since it's always true
  }

  // Smoking compatibility
  if (currentUser.is_smoker === candidate.is_smoker) {
    score += WEIGHTS.smoking;
    reasons.push(
      candidate.is_smoker
        ? 'Both comfortable with smoking'
        : 'Both prefer smoke-free'
    );
  }

  // Pets compatibility
  if (currentUser.has_pets === candidate.has_pets) {
    score += WEIGHTS.pets;
    reasons.push(
      candidate.has_pets
        ? 'Both have pets'
        : 'Both prefer pet-free'
    );
  } else if (!currentUser.has_pets && candidate.has_pets) {
    score += Math.round(WEIGHTS.pets * 0.3);
    reasons.push('Candidate has pets');
  }

  // Occupation similarity
  if (currentUser.occupation && candidate.occupation) {
    const userOcc = currentUser.occupation.toLowerCase();
    const candOcc = candidate.occupation.toLowerCase();

    const occupationCategories = [
      ['student', 'university', 'college', 'studying', 'طالب', 'جامعة'],
      ['engineer', 'developer', 'programmer', 'tech', 'software', 'مهندس'],
      ['doctor', 'nurse', 'medical', 'healthcare', 'hospital', 'طبيب', 'ممرض'],
      ['teacher', 'professor', 'educator', 'instructor', 'مدرس'],
      ['business', 'manager', 'executive', 'entrepreneur', 'مدير'],
      ['freelance', 'remote', 'work from home', 'عمل حر'],
      ['accountant', 'finance', 'banking', 'محاسب'],
      ['designer', 'artist', 'creative', 'مصمم'],
    ];

    for (const category of occupationCategories) {
      const userMatch = category.some(k => userOcc.includes(k));
      const candMatch = category.some(k => candOcc.includes(k));
      if (userMatch && candMatch) {
        score += WEIGHTS.occupation;
        reasons.push('Similar field of work');
        break;
      }
    }
  }

  // Looking for preferences alignment
  if (currentUser.looking_for && candidate.looking_for) {
    const userPrefs = currentUser.looking_for.toLowerCase();
    const candPrefs = candidate.looking_for.toLowerCase();

    const preferenceKeywords = ['quiet', 'clean', 'tidy', 'social', 'friendly', 'professional', 'student', 'هادئ', 'نظيف', 'اجتماعي', 'مرتب'];
    const sharedPrefs = preferenceKeywords.filter(
      k => userPrefs.includes(k) && candPrefs.includes(k)
    );

    if (sharedPrefs.length > 0) {
      // Scale: 1 keyword = 50%, 2+ = 100%
      const ratio = sharedPrefs.length >= 2 ? 1 : 0.5;
      score += Math.round(WEIGHTS.lookingFor * ratio);
      reasons.push('Similar lifestyle preferences');
    }
  }

  // Nationality match (new)
  if (currentUser.nationality && candidate.nationality) {
    if (currentUser.nationality.toLowerCase().trim() === candidate.nationality.toLowerCase().trim()) {
      score += WEIGHTS.nationality;
      reasons.push('Same nationality');
    }
  }

  // Personality tags overlap (new)
  if (currentUser.personality_tags?.length && candidate.personality_tags?.length) {
    const userSet = new Set(currentUser.personality_tags);
    const overlap = candidate.personality_tags.filter(t => userSet.has(t)).length;
    if (overlap > 0) {
      const ratio = Math.min(overlap / 3, 1); // 3+ tags = full score
      score += Math.round(WEIGHTS.personalityTags * ratio);
      reasons.push(`${overlap} shared vibe${overlap > 1 ? 's' : ''}`);
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
