// Tenant matching score calculator

interface ViewerData {
  age?: number | null;
  occupation_status?: string | null;
  university?: string | null;
  personality_tags?: string[] | null;
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
}

const MAX_POINTS = 14;

export function calculateMatchScore(viewer: ViewerData, profile: ProfileData): number {
  let total = 0;

  const isVerified = profile.is_verified ?? profile.verification_status === 'verified';

  // 1. Same university (3 pts) or Student (2 pts)
  const sameUni = viewer.university && profile.university &&
    viewer.university.toLowerCase().trim() === profile.university.toLowerCase().trim();
  if (sameUni) {
    total += 3;
  } else if (viewer.occupation_status === 'student') {
    total += 2;
  }

  // 2. Age within 5 years (3 pts)
  if (viewer.age && profile.age && Math.abs(viewer.age - profile.age) <= 5) {
    total += 3;
  }

  // 3. Working / has job (3 pts)
  if (profile.occupation || profile.job_title) {
    total += 3;
  }

  // 4. Verified (3 pts)
  if (isVerified) {
    total += 3;
  }

  // 5. Profile photo (2 pts)
  if (profile.avatar_url) {
    total += 2;
  }

  // 6. Personality tag overlap (up to 4 pts — 1 pt per shared tag, max 4)
  if (viewer.personality_tags?.length && profile.personality_tags?.length) {
    const viewerSet = new Set(viewer.personality_tags);
    const overlap = profile.personality_tags.filter(t => viewerSet.has(t)).length;
    total += Math.min(overlap, 4);
  }

  return Math.min(Math.round((total / MAX_POINTS) * 100), 100);
}
