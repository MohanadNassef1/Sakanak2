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

    const fullName = 'E2E Test User';
    const password = 'TestPass12345!';

    // Retry around the project's email-send rate limit (transient infra limit,
    // unrelated to the regression we're guarding against).
    let data: any = null;
    let error: any = null;
    let lastEmail = '';
    for (let attempt = 0; attempt < 4; attempt++) {
      lastEmail = `e2e_${Date.now()}_${Math.floor(Math.random() * 1e6)}@example.com`;
      const res = await supabase.auth.signUp({
        email: lastEmail,
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
      data = res.data;
      error = res.error;
      const msg = (error?.message ?? '').toLowerCase();
      if (!error || (!msg.includes('rate limit') && !msg.includes('over_email_send_rate_limit'))) break;
      await new Promise((r) => setTimeout(r, 20000));
    }

    // The original bug ("Database error saving new user") was a 500 caused by
    // the handle_new_user trigger failing to cast text -> user_gender. A
    // successful signUp proves the trigger ran and the profile was inserted
    // with a valid gender enum.
    expect(error, `signup failed: ${error?.message ?? ''}`).toBeNull();
    expect(data.user).toBeTruthy();
    expect(data.user.email).toBe(lastEmail);
    expect(VALID_GENDERS).toContain(data.user.user_metadata?.gender);

    // If the project auto-confirms emails, a session is returned and we can
    // also read the profile back through RLS to confirm the persisted gender.
    if (data.session) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, gender, email')
        .eq('user_id', data.user.id)
        .maybeSingle();
      expect(profileError).toBeNull();
      expect(profile).toBeTruthy();
      expect(profile!.email).toBe(lastEmail);
      expect(profile!.full_name).toBe(fullName);
      expect(VALID_GENDERS).toContain(profile!.gender as string);
      expect(profile!.gender).toBe('female');
    }
  }, 120000);
});
