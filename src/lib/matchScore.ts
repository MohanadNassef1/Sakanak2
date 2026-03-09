// Tenant matching score calculator

interface ViewerData {
  age?: number | null;
  occupation_status?: string | null;
  university?: string | null;
}

interface ProfileData {
  age?: number | null;
  occupation?: string | null;
  university?: string | null;
  is_verified?: boolean;
  avatar_url?: string | null;
  job_title?: string | null;
  verification_status?: string;
}

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

  return Math.min(Math.round((total / 10) * 100), 100);
}
