// Room-specific match score calculator
// Unlike roommate matching, this focuses on how well a ROOM suits the viewer
import { getGovernorateForArea } from '@/lib/locationData';

interface ViewerProfile {
  age?: number | null;
  gender?: string | null;
  occupation_status?: string | null;
  university?: string | null;
  personality_tags?: string[] | null;
  is_smoker?: boolean | null;
  has_pets?: boolean | null;
  nationality?: string | null;
  looking_for?: string | null;
  interested_area_1?: string | null;
  interested_area_2?: string | null;
}

interface RoomData {
  allows_smoking?: boolean | null;
  allows_pets?: boolean | null;
  preferred_gender?: string | null;
  personality_tags?: string[] | null;
  is_student_listing?: boolean | null;
  area?: string | null;
  city?: string | null;
  lister_type?: string | null;
  owner?: {
    age?: number | null;
    nationality?: string | null;
    university?: string | null;
    is_smoker?: boolean | null;
    has_pets?: boolean | null;
    personality_tags?: string[] | null;
    looking_for?: string | null;
    occupation?: string | null;
    avatar_url?: string | null;
    verification_status?: string | null;
  } | null;
}

export interface RoomScoreBreakdown {
  label: string;
  labelAr: string;
  points: number;
  maxPoints: number;
  icon: string;
}

// Total max = 30
const CRITERIA = {
  AREA_EXACT: 5,
  AREA_GOVERNORATE: 3,
  SMOKING: 3,
  PETS: 3,
  VIBES: 4,        // up to 4 (1 per shared tag, max 4)
  GENDER_PREF: 2,
  STUDENT_MATCH: 3,
  NATIONALITY: 2,
  AGE: 2,
  VERIFIED: 2,
  UNIVERSITY: 2,
  LIVING_PREFS: 2,
};

const MAX_ROOM_POINTS = 30;
const ROOM_BOOST = 1.35; // slightly lower than roommate boost since we have more achievable points

export function getRoomMatchBreakdown(viewer: ViewerProfile, room: RoomData): RoomScoreBreakdown[] {
  const breakdown: RoomScoreBreakdown[] = [];
  const owner = room.owner;
  const isTenantLister = room.lister_type === 'current_tenant' || room.lister_type === 'landlord_and_tenant';

  // 1. Area match (5 pts exact, 3 pts same governorate)
  let areaPoints = 0;
  let areaLabel = 'Location';
  let areaLabelAr = 'الموقع';
  const viewerAreas = [viewer.interested_area_1, viewer.interested_area_2]
    .filter(Boolean)
    .map(a => a!.toLowerCase().trim());
  const roomArea = room.area?.toLowerCase().trim();

  if (viewerAreas.length > 0 && roomArea) {
    if (viewerAreas.includes(roomArea)) {
      areaPoints = CRITERIA.AREA_EXACT;
      areaLabel = 'Same area';
      areaLabelAr = 'نفس المنطقة';
    } else {
      const viewerGovs = viewerAreas.map(a => getGovernorateForArea(a)?.toLowerCase()).filter(Boolean);
      const roomGov = (room.area ? getGovernorateForArea(room.area) : room.city)?.toLowerCase();
      if (roomGov && viewerGovs.includes(roomGov)) {
        areaPoints = CRITERIA.AREA_GOVERNORATE;
        areaLabel = 'Same city';
        areaLabelAr = 'نفس المحافظة';
      }
    }
  }
  breakdown.push({ label: areaLabel, labelAr: areaLabelAr, points: areaPoints, maxPoints: CRITERIA.AREA_EXACT, icon: '📍' });

  // 2. Smoking compatibility (3 pts)
  let smokingPoints = 0;
  const roomAllowsSmoking = room.allows_smoking ?? false;
  if (viewer.is_smoker != null) {
    if (viewer.is_smoker && roomAllowsSmoking) {
      smokingPoints = 3; // smoker + room allows = perfect
    } else if (!viewer.is_smoker && !roomAllowsSmoking) {
      smokingPoints = 3; // non-smoker + no smoking = perfect
    } else if (!viewer.is_smoker && roomAllowsSmoking) {
      smokingPoints = 1; // non-smoker but room allows — partial
    } else {
      smokingPoints = 0; // smoker but room doesn't allow
    }
  } else {
    smokingPoints = 1; // unknown preference, give benefit
  }
  breakdown.push({
    label: smokingPoints === 3 ? (viewer.is_smoker ? 'Smoking allowed' : 'Smoke-free') : 'Smoking',
    labelAr: smokingPoints === 3 ? (viewer.is_smoker ? 'التدخين مسموح' : 'بدون تدخين') : 'التدخين',
    points: smokingPoints, maxPoints: CRITERIA.SMOKING, icon: '🚬',
  });

  // 3. Pet compatibility (3 pts)
  let petPoints = 0;
  const roomAllowsPets = room.allows_pets ?? false;
  if (viewer.has_pets != null) {
    if (viewer.has_pets && roomAllowsPets) {
      petPoints = 3;
    } else if (!viewer.has_pets && !roomAllowsPets) {
      petPoints = 3;
    } else if (!viewer.has_pets && roomAllowsPets) {
      petPoints = 2; // no pets but room allows — mostly fine
    } else {
      petPoints = 0; // has pets but room doesn't allow
    }
  } else {
    petPoints = 1;
  }
  breakdown.push({
    label: petPoints === 3 ? (viewer.has_pets ? 'Pets welcome' : 'Pet-free') : 'Pets',
    labelAr: petPoints === 3 ? (viewer.has_pets ? 'حيوانات مرحب بها' : 'بدون حيوانات') : 'حيوانات',
    points: petPoints, maxPoints: CRITERIA.PETS, icon: '🐾',
  });

  // 4. Vibes / personality tags overlap (up to 4 pts)
  let vibePoints = 0;
  const roomTags = room.personality_tags || (isTenantLister && owner?.personality_tags) || [];
  if (viewer.personality_tags?.length && roomTags.length) {
    const viewerSet = new Set(viewer.personality_tags);
    const overlap = (roomTags as string[]).filter(t => viewerSet.has(t)).length;
    vibePoints = Math.min(overlap, 4);
  }
  breakdown.push({ label: 'Shared vibes', labelAr: 'اهتمامات مشتركة', points: vibePoints, maxPoints: CRITERIA.VIBES, icon: '✨' });

  // 5. Gender preference match (2 pts)
  let genderPoints = 0;
  const roomGenderPref = room.preferred_gender?.toLowerCase();
  if (!roomGenderPref || roomGenderPref === 'any') {
    genderPoints = 2; // open to all = good
  } else if (viewer.gender && roomGenderPref === viewer.gender.toLowerCase()) {
    genderPoints = 2; // matches
  }
  breakdown.push({ label: 'Gender fit', labelAr: 'الجنس', points: genderPoints, maxPoints: CRITERIA.GENDER_PREF, icon: '👤' });

  // 6. Student listing match (3 pts)
  let studentPoints = 0;
  if (room.is_student_listing && viewer.occupation_status === 'student') {
    studentPoints = 3; // student listing + student viewer = perfect
  } else if (!room.is_student_listing && viewer.occupation_status !== 'student') {
    studentPoints = 2; // working listing + working viewer = good
  } else if (!room.is_student_listing) {
    studentPoints = 1; // non-student listing, any viewer = partial
  }
  breakdown.push({
    label: studentPoints === 3 ? 'Student listing' : 'Occupation match',
    labelAr: studentPoints === 3 ? 'سكن طلاب' : 'توافق مهني',
    points: studentPoints, maxPoints: CRITERIA.STUDENT_MATCH, icon: '🎓',
  });

  // 7. Nationality (2 pts) — only if owner data available
  let natPoints = 0;
  if (owner?.nationality && viewer.nationality) {
    if (owner.nationality.toLowerCase().trim() === viewer.nationality.toLowerCase().trim()) {
      natPoints = 2;
    }
  } else {
    natPoints = 1; // unknown = benefit of doubt
  }
  breakdown.push({ label: 'Nationality', labelAr: 'الجنسية', points: natPoints, maxPoints: CRITERIA.NATIONALITY, icon: '🌍' });

  // 8. Age proximity (2 pts) — only for tenant listers
  let agePoints = 0;
  if (isTenantLister && owner?.age && viewer.age) {
    const diff = Math.abs(owner.age - viewer.age);
    if (diff <= 5) agePoints = 2;
    else if (diff <= 10) agePoints = 1;
  } else {
    agePoints = 1; // unknown / landlord = benefit of doubt
  }
  breakdown.push({ label: 'Age proximity', labelAr: 'قرب العمر', points: agePoints, maxPoints: CRITERIA.AGE, icon: '📅' });

  // 9. Verified owner (2 pts)
  const isVerified = owner?.verification_status === 'verified';
  breakdown.push({ label: 'Verified host', labelAr: 'مضيف موثق', points: isVerified ? 2 : 0, maxPoints: CRITERIA.VERIFIED, icon: '✅' });

  // 10. University match (2 pts) — for student listings
  let uniPoints = 0;
  if (viewer.university && owner?.university) {
    if (viewer.university.toLowerCase().trim() === owner.university.toLowerCase().trim()) {
      uniPoints = 2;
    } else {
      uniPoints = 0;
    }
  }
  breakdown.push({ label: 'Same university', labelAr: 'نفس الجامعة', points: uniPoints, maxPoints: CRITERIA.UNIVERSITY, icon: '🏫' });

  // 11. Living preferences (2 pts)
  let livingPoints = 0;
  if (isTenantLister && viewer.looking_for && owner?.looking_for) {
    const keywords = ['quiet', 'clean', 'tidy', 'social', 'friendly', 'professional', 'student', 'هادئ', 'نظيف', 'اجتماعي', 'مرتب', 'calm', 'organized', 'respectful'];
    const viewerWords = viewer.looking_for.toLowerCase();
    const ownerWords = owner.looking_for.toLowerCase();
    const shared = keywords.filter(k => viewerWords.includes(k) && ownerWords.includes(k)).length;
    if (shared >= 2) livingPoints = 2;
    else if (shared >= 1) livingPoints = 1;
  } else {
    livingPoints = 1; // unknown = partial credit
  }
  breakdown.push({ label: 'Living style', labelAr: 'أسلوب المعيشة', points: livingPoints, maxPoints: CRITERIA.LIVING_PREFS, icon: '🏠' });

  return breakdown;
}

export function getRoomMatchPercentage(viewer: ViewerProfile, room: RoomData): number {
  const total = getRoomMatchBreakdown(viewer, room).reduce((sum, b) => sum + b.points, 0);
  return Math.min(Math.round((total / MAX_ROOM_POINTS) * 100 * ROOM_BOOST), 100);
}
