import { describe, it, expect } from 'vitest';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  normalizeLocal,
  isValidLocal,
  toE164,
  parsePhone,
  type Country,
} from '@/components/PhoneInput';

const get = (code: string): Country => {
  const c = COUNTRIES.find((x) => x.code === code);
  if (!c) throw new Error(`Missing country ${code}`);
  return c;
};

describe('PhoneInput - normalizeLocal', () => {
  it('strips non-digits', () => {
    expect(normalizeLocal(get('EG'), '01 (234) 567-890')).toBe('1234567890');
  });

  it('strips leading trunk zero for trunkZero countries (EG)', () => {
    expect(normalizeLocal(get('EG'), '01234567890')).toBe('1234567890');
  });

  it('strips multiple leading zeros for trunkZero countries', () => {
    expect(normalizeLocal(get('EG'), '0001234567890')).toBe('1234567890');
  });

  it('keeps leading zero for non-trunkZero countries (KW)', () => {
    // Kuwait has no trunkZero; leading 0 is preserved as a digit (capped to length 8)
    expect(normalizeLocal(get('KW'), '012345678')).toBe('01234567');
  });

  it('caps at the country max length (UK = 10)', () => {
    expect(normalizeLocal(get('GB'), '07123456789999')).toBe('7123456789');
  });

  it('caps at multi-length max (DE = 11)', () => {
    expect(normalizeLocal(get('DE'), '171234567899999')).toBe('17123456789');
  });
});

describe('PhoneInput - isValidLocal', () => {
  it('accepts valid Egypt 10-digit local', () => {
    expect(isValidLocal(get('EG'), '1234567890')).toBe(true);
  });

  it('rejects Egypt with too few digits', () => {
    expect(isValidLocal(get('EG'), '12345')).toBe(false);
  });

  it('rejects Egypt with too many digits', () => {
    expect(isValidLocal(get('EG'), '12345678901')).toBe(false);
  });

  it('accepts Saudi Arabia 9-digit local', () => {
    expect(isValidLocal(get('SA'), '512345678')).toBe(true);
  });

  it('accepts UAE 9-digit local', () => {
    expect(isValidLocal(get('AE'), '501234567')).toBe(true);
  });

  it('accepts Lebanon (multi-length: 7 or 8)', () => {
    expect(isValidLocal(get('LB'), '1234567')).toBe(true);
    expect(isValidLocal(get('LB'), '12345678')).toBe(true);
    expect(isValidLocal(get('LB'), '123456')).toBe(false);
  });

  it('accepts Germany (multi-length: 10 or 11)', () => {
    expect(isValidLocal(get('DE'), '1712345678')).toBe(true);
    expect(isValidLocal(get('DE'), '17123456789')).toBe(true);
    expect(isValidLocal(get('DE'), '171234567')).toBe(false);
  });

  it('rejects empty string everywhere', () => {
    expect(isValidLocal(get('EG'), '')).toBe(false);
    expect(isValidLocal(get('US' in {} ? 'US' : 'GB'), '')).toBe(false);
  });
});

describe('PhoneInput - toE164', () => {
  it('builds E.164 for Egypt', () => {
    expect(toE164(get('EG'), '1234567890')).toBe('+201234567890');
  });

  it('builds E.164 for Saudi Arabia', () => {
    expect(toE164(get('SA'), '512345678')).toBe('+966512345678');
  });

  it('builds E.164 for UAE', () => {
    expect(toE164(get('AE'), '501234567')).toBe('+971501234567');
  });

  it('builds E.164 for UK', () => {
    expect(toE164(get('GB'), '7123456789')).toBe('+447123456789');
  });

  it('builds E.164 for Germany', () => {
    expect(toE164(get('DE'), '17123456789')).toBe('+4917123456789');
  });

  it('strips non-digits in local before composing', () => {
    expect(toE164(get('EG'), '123-456 7890')).toBe('+201234567890');
  });
});

describe('PhoneInput - parsePhone', () => {
  it('returns default country with empty local for null/empty input', () => {
    expect(parsePhone(null)).toEqual({ country: DEFAULT_COUNTRY, local: '' });
    expect(parsePhone('')).toEqual({ country: DEFAULT_COUNTRY, local: '' });
  });

  it('parses E.164 Egypt number', () => {
    const r = parsePhone('+201234567890');
    expect(r.country.code).toBe('EG');
    expect(r.local).toBe('1234567890');
  });

  it('parses E.164 Saudi number', () => {
    const r = parsePhone('+966512345678');
    expect(r.country.code).toBe('SA');
    expect(r.local).toBe('512345678');
  });

  it('parses E.164 UK number', () => {
    const r = parsePhone('+447123456789');
    expect(r.country.code).toBe('GB');
    expect(r.local).toBe('7123456789');
  });

  it('matches longest dial-code prefix (e.g. +971 not +9)', () => {
    const r = parsePhone('+971501234567');
    expect(r.country.code).toBe('AE');
    expect(r.local).toBe('501234567');
  });

  it('falls back to Egypt for legacy "01..." numbers', () => {
    const r = parsePhone('01234567890');
    expect(r.country.code).toBe('EG');
    expect(r.local).toBe('1234567890');
  });
});

describe('PhoneInput - end-to-end normalize + validate + E.164', () => {
  const cases: Array<[string, string, string, string]> = [
    // [countryCode, userInput, expectedLocal, expectedE164]
    ['EG', '01234567890', '1234567890', '+201234567890'],
    ['SA', '0512345678', '512345678', '+966512345678'],
    ['AE', '0501234567', '501234567', '+971501234567'],
    ['GB', '07123456789', '7123456789', '+447123456789'],
    ['FR', '0612345678', '612345678', '+33612345678'],
    ['MA', '0612345678', '612345678', '+212612345678'],
  ];

  cases.forEach(([code, input, expectedLocal, expectedE164]) => {
    it(`${code}: normalizes ${input}, validates, and converts to ${expectedE164}`, () => {
      const c = get(code);
      const local = normalizeLocal(c, input);
      expect(local).toBe(expectedLocal);
      expect(isValidLocal(c, local)).toBe(true);
      expect(toE164(c, local)).toBe(expectedE164);
    });
  });

  it('rejects invalid Egypt number (too short)', () => {
    const c = get('EG');
    const local = normalizeLocal(c, '0123');
    expect(isValidLocal(c, local)).toBe(false);
  });

  it('rejects invalid Saudi number (too long, before cap-aware caller)', () => {
    const c = get('SA');
    // bypass normalize cap to simulate a raw bad value
    expect(isValidLocal(c, '5123456789012')).toBe(false);
  });

  it('rejects letters-only input', () => {
    const c = get('EG');
    expect(isValidLocal(c, 'abcdef')).toBe(false);
  });
});
