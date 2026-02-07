import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useEffect } from 'react';

interface UseVerificationGateOptions {
  enabled?: boolean;
  returnPath?: string;
}

export const useVerificationGate = (options: UseVerificationGateOptions = {}) => {
  const { enabled = true, returnPath } = options;
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const navigate = useNavigate();

  const isLoading = authLoading || profileLoading;
  const isVerified = profile?.verification_status === 'verified';
  const isPending = profile?.verification_status === 'pending';
  const isRejected = profile?.verification_status === 'rejected';
  const needsVerification = !isVerified && !isPending;

  useEffect(() => {
    if (!enabled || isLoading) return;

    if (!user) {
      navigate('/auth', { state: { from: returnPath } });
      return;
    }

    if (needsVerification || isRejected) {
      navigate('/verify-identity', { state: { from: returnPath } });
    }
  }, [enabled, isLoading, user, needsVerification, isRejected, navigate, returnPath]);

  return {
    isLoading,
    isVerified,
    isPending,
    isRejected,
    needsVerification,
    canProceed: isVerified,
    user,
    profile,
  };
};

// Profile strength calculation
export const calculateProfileStrength = (profile: {
  full_name?: string | null;
  avatar_url?: string | null;
  about?: string | null;
  bio?: string | null;
  occupation?: string | null;
  phone?: string | null;
  age?: number | null;
  nationality?: string | null;
}) => {
  let score = 0;
  const maxScore = 100;
  const fields = [
    { field: 'full_name', weight: 15, check: (v: any) => !!v && v.length > 0 },
    { field: 'avatar_url', weight: 25, check: (v: any) => !!v },
    { field: 'about', weight: 15, check: (v: any) => !!v && v.length > 20 },
    { field: 'bio', weight: 10, check: (v: any) => !!v && v.length > 10 },
    { field: 'occupation', weight: 15, check: (v: any) => !!v && v.length > 0 },
    { field: 'phone', weight: 10, check: (v: any) => !!v && v.length > 5 },
    { field: 'age', weight: 5, check: (v: any) => !!v && v > 0 },
    { field: 'nationality', weight: 5, check: (v: any) => !!v && v.length > 0 },
  ];

  const missingFields: string[] = [];

  fields.forEach(({ field, weight, check }) => {
    const value = (profile as any)[field];
    if (check(value)) {
      score += weight;
    } else {
      missingFields.push(field);
    }
  });

  return {
    percentage: Math.min(score, maxScore),
    missingFields,
    isComplete: score >= 80,
  };
};
