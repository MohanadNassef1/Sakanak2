// Tenant matching score calculator — enhanced version

interface ViewerData {
  age?: number | null;
  occupation_status?: string | null;
  university?: string | null;
  personality_tags?: string[] | null;
  is_smoker?: boolean | null;
  has_pets?: boolean | null;
  nationality?: string | null;
  looking_for?: string | null;
}

interface ProfileData {
  age?: number | null;
  occupation?: string | null;
  university?: string | null;
  is_verified?: boolean;
  avatar_url?: string | null;
  job_title?: string | null;
  verification_status?: string;
  personality_tags?: string[] | null;
  is_smoker?: boolean | null;
  has_pets?: boolean | null;
  nationality?: string | null;
  looking_for?: string | null;
}

export interface ScoreBreakdown {
  label: string;
  labelAr: string;
  points: number;
  maxPoints: number;
  icon: string; // emoji for display
}

const MAX_POINTS = 20;

export function calculateMatchScore(viewer: ViewerData, profile: ProfileData): number {
  return getMatchBreakdown(viewer, profile).reduce((sum, b) => sum + b.points, 0);
}

export function getMatchBreakdown(viewer: ViewerData, profile: ProfileData): ScoreBreakdown[] {
  const breakdown: ScoreBreakdown[] = [];
  const isVerified = profile.is_verified ?? profile.verification_status === 'verified';

  // 1. Same university (3 pts) or both students (2 pts) or any uni listed (1 pt)
  const sameUni = viewer.university && profile.university &&
    viewer.university.toLowerCase().trim() === profile.university.toLowerCase().trim();
  const bothStudents = viewer.occupation_status === 'student' && profile.university;
  const anyUni = viewer.university || profile.university;
  const uniPoints = sameUni ? 3 : bothStudents ? 2 : anyUni ? 1 : 0;
  breakdown.push({
    label: sameUni ? 'Same university' : bothStudents ? 'Both students' : 'University',
    labelAr: sameUni ? 'نفس الجامعة' : bothStudents ? 'كلاكما طلاب' : 'الجامعة',
    points: uniPoints,
    maxPoints: 3,
    icon: '🎓',
  });

  // 2. Age proximity — generous tiers (2 pts max)
  let agePoints = 0;
  if (viewer.age && profile.age) {
    const diff = Math.abs(viewer.age - profile.age);
    if (diff <= 5) agePoints = 2;
    else if (diff <= 10) agePoints = 1;
  } else {
    // If age not provided, give benefit of the doubt
    agePoints = 1;
  }
  breakdown.push({
    label: 'Age proximity',
    labelAr: 'قرب العمر',
    points: agePoints,
    maxPoints: 2,
    icon: '📅',
  });

  // 3. Verified (3 pts)
  breakdown.push({
    label: 'Verified identity',
    labelAr: 'هوية موثقة',
    points: isVerified ? 3 : 0,
    maxPoints: 3,
    icon: '✅',
  });

  // 4. Profile photo (2 pts)
  breakdown.push({
    label: 'Profile photo',
    labelAr: 'صورة شخصية',
    points: profile.avatar_url ? 2 : 0,
    maxPoints: 2,
    icon: '📸',
  });

  // 5. Personality tag overlap (up to 3 pts — 1 pt per shared tag, max 3)
  let tagOverlap = 0;
  if (viewer.personality_tags?.length && profile.personality_tags?.length) {
    const viewerSet = new Set(viewer.personality_tags);
    tagOverlap = Math.min(profile.personality_tags.filter(t => viewerSet.has(t)).length, 3);
  }
  breakdown.push({
    label: 'Shared vibes',
    labelAr: 'اهتمامات مشتركة',
    points: tagOverlap,
    maxPoints: 3,
    icon: '✨',
  });

  // 6. Same smoking preference (2 pts)
  const smokingMatch = viewer.is_smoker != null && profile.is_smoker != null && viewer.is_smoker === profile.is_smoker;
  breakdown.push({
    label: viewer.is_smoker ? 'Both smokers' : 'Both non-smokers',
    labelAr: viewer.is_smoker ? 'كلاكما مدخنان' : 'كلاكما غير مدخنين',
    points: smokingMatch ? 2 : 0,
    maxPoints: 2,
    icon: '🚬',
  });

  // 7. Same pet preference (1 pt)
  const petMatch = viewer.has_pets != null && profile.has_pets != null && viewer.has_pets === profile.has_pets;
  breakdown.push({
    label: viewer.has_pets ? 'Both have pets' : 'Both pet-free',
    labelAr: viewer.has_pets ? 'كلاكما لديه حيوانات' : 'كلاكما بدون حيوانات',
    points: petMatch ? 1 : 0,
    maxPoints: 1,
    icon: '🐾',
  });

  // 8. Same nationality (2 pts)
  const sameNat = viewer.nationality && profile.nationality &&
    viewer.nationality.toLowerCase().trim() === profile.nationality.toLowerCase().trim();
  breakdown.push({
    label: 'Same nationality',
    labelAr: 'نفس الجنسية',
    points: sameNat ? 2 : 0,
    maxPoints: 2,
    icon: '🌍',
  });

  // 9. Living preferences keyword overlap (2 pts)
  let lookingForPoints = 0;
  if (viewer.looking_for && profile.looking_for) {
    const keywords = ['quiet', 'clean', 'tidy', 'social', 'friendly', 'professional', 'student', 'هادئ', 'نظيف', 'اجتماعي', 'مرتب', 'calm', 'organized', 'respectful'];
    const viewerWords = viewer.looking_for.toLowerCase();
    const profileWords = profile.looking_for.toLowerCase();
    const shared = keywords.filter(k => viewerWords.includes(k) && profileWords.includes(k)).length;
    if (shared >= 2) lookingForPoints = 2;
    else if (shared >= 1) lookingForPoints = 1;
  }
  breakdown.push({
    label: 'Living preferences',
    labelAr: 'تفضيلات السكن',
    points: lookingForPoints,
    maxPoints: 2,
    icon: '🏠',
  });

  return breakdown;
}

export function getMatchPercentage(viewer: ViewerData, profile: ProfileData): number {
  const total = getMatchBreakdown(viewer, profile).reduce((sum, b) => sum + b.points, 0);
  return Math.min(Math.round((total / MAX_POINTS) * 100), 100);
}
