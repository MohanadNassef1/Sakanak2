import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const VALID_GENDERS = ['male', 'female'];

describe('signup e2e', () => {
  it('signs up a new user and creates a profile with a valid gender enum', async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const email = `e2e_${Date.now()}_${Math.floor(Math.random() * 1e6)}@example.com`;
    const password = 'TestPass12345!';
    const fullName = 'E2E Test User';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          gender: 'female',
          nationality: 'egyptian',
          date_of_birth: '2000-01-01',
          phone: '01234567890',
          interested_area_1: 'area1',
          occupation_status: 'student',
          university: 'Cairo University',
          faculty: 'Engineering',
        },
      },
    });

    expect(error).toBeNull();
    expect(data.user).toBeTruthy();
    const userId = data.user!.id;

    // Poll the profile (trigger runs in same txn but allow brief delay just in case)
    let profile: any = null;
    for (let i = 0; i < 5; i++) {
      const { data: p } = await supabase
        .from('profiles')
        .select('user_id, full_name, gender, email')
        .eq('user_id', userId)
        .maybeSingle();
      if (p) {
        profile = p;
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    expect(profile).toBeTruthy();
    expect(profile.email).toBe(email);
    expect(profile.full_name).toBe(fullName);
    expect(VALID_GENDERS).toContain(profile.gender);
    expect(profile.gender).toBe('female');
  }, 30000);
});
