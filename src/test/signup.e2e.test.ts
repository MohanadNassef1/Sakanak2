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

    // The original bug ("Database error saving new user") manifested as a 500
    // because the handle_new_user trigger could not cast text -> user_gender.
    // A successful signUp (no error, user returned) proves the trigger ran and
    // the profile row was inserted with a valid gender enum.
    expect(error).toBeNull();
    expect(data.user).toBeTruthy();
    expect(data.user!.email).toBe(email);
    expect(data.user!.user_metadata?.gender).toBeDefined();
    expect(VALID_GENDERS).toContain(data.user!.user_metadata?.gender);

    // If the project auto-confirms emails, a session is returned and we can
    // also read the profile back through RLS to confirm the persisted gender.
    if (data.session) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, gender, email')
        .eq('user_id', data.user!.id)
        .maybeSingle();
      expect(profileError).toBeNull();
      expect(profile).toBeTruthy();
      expect(profile!.email).toBe(email);
      expect(profile!.full_name).toBe(fullName);
      expect(VALID_GENDERS).toContain(profile!.gender as string);
      expect(profile!.gender).toBe('female');
    }
  }, 30000);
});
