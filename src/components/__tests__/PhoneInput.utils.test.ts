import { describe, it, expect } from 'vitest';
import { getExampleNumber, type CountryCode } from 'libphonenumber-js';
import examples from 'libphonenumber-js/examples.mobile.json';
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

/** Helper: a real, valid mobile example number for the given country (national digits). */
const exampleNational = (code: string): string => {
  const ex = getExampleNumber(code as CountryCode, examples);
  if (!ex) throw new Error(`No example for ${code}`);
  return ex.nationalNumber.toString();
};
const exampleE164 = (code: string): string => {
  const ex = getExampleNumber(code as CountryCode, examples);
  if (!ex) throw new Error(`No example for ${code}`);
  return ex.number;
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
    expect(normalizeLocal(get('KW'), '012345678').startsWith('0')).toBe(true);
  });

  it('caps at the hard typing limit (E.164 max 15 digits incl. dial)', () => {
    // EG dial is 2 digits → max 13 local digits
    const long = '9'.repeat(30);
    expect(normalizeLocal(get('EG'), long).length).toBeLessThanOrEqual(13);
  });
});

describe('PhoneInput - isValidLocal (libphonenumber-backed)', () => {
  // Sample a wide spread of countries — all use real example mobile numbers.
  const sampleCodes = [
    'EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'JO', 'LB', 'IQ',
    'MA', 'DZ', 'TN', 'GB', 'IE', 'DE', 'FR', 'IT', 'ES', 'NL',
    'SE', 'CH', 'TR', 'US' in {} ? 'US' : 'GB', 'IN', 'PK', 'BD', 'CN', 'JP', 'KR',
    'AU', 'NZ', 'BR', 'MX', 'AR', 'NG', 'KE', 'ZA',
  ];

  sampleCodes.forEach((code) => {
    const country = COUNTRIES.find((c) => c.code === code);
    if (!country) return;
    const ex = getExampleNumber(code as CountryCode, examples);
    if (!ex) return;
    it(`accepts a real example mobile number for ${code}`, () => {
      const local = ex.nationalNumber.toString();
      expect(isValidLocal(country, local)).toBe(true);
    });
  });

  it('rejects empty string', () => {
    expect(isValidLocal(get('EG'), '')).toBe(false);
  });

  it('rejects too-short numbers', () => {
    expect(isValidLocal(get('EG'), '12')).toBe(false);
    expect(isValidLocal(get('SA'), '5')).toBe(false);
  });

  it('rejects too-long numbers', () => {
    expect(isValidLocal(get('EG'), '12345678901234')).toBe(false);
  });

  it('rejects letters-only input', () => {
    expect(isValidLocal(get('EG'), 'abcdef')).toBe(false);
  });

  it('rejects an obviously bogus pattern (all zeros)', () => {
    expect(isValidLocal(get('EG'), '0000000000')).toBe(false);
    expect(isValidLocal(get('SA'), '000000000')).toBe(false);
  });

  it('rejects a number that is valid in another country but not this one', () => {
    // A real US national number should not validate against EG
    const usEx = getExampleNumber('US' as CountryCode, examples);
    if (!usEx) return;
    expect(isValidLocal(get('EG'), usEx.nationalNumber.toString())).toBe(false);
  });
});

describe('PhoneInput - toE164', () => {
  ['EG', 'SA', 'AE', 'GB', 'DE', 'FR', 'IT', 'IN', 'BR', 'AU'].forEach((code) => {
    const country = COUNTRIES.find((c) => c.code === code);
    if (!country) return;
    it(`produces canonical E.164 for ${code}`, () => {
      const local = exampleNational(code);
      expect(toE164(country, local)).toBe(exampleE164(code));
    });
  });

  it('strips non-digits in local before composing', () => {
    const local = exampleNational('EG');
    const formatted = local.replace(/(\d{3})(?=\d)/g, '$1 ');
    expect(toE164(get('EG'), formatted)).toBe(exampleE164('EG'));
  });

  it('falls back to raw concat when number cannot be validated (graceful)', () => {
    expect(toE164(get('EG'), '12')).toBe('+2012');
  });
});

describe('PhoneInput - parsePhone', () => {
  it('returns default country with empty local for null/empty input', () => {
    expect(parsePhone(null)).toEqual({ country: DEFAULT_COUNTRY, local: '' });
    expect(parsePhone('')).toEqual({ country: DEFAULT_COUNTRY, local: '' });
  });

  ['EG', 'SA', 'AE', 'GB', 'DE', 'FR', 'IN', 'BR'].forEach((code) => {
    const country = COUNTRIES.find((c) => c.code === code);
    if (!country) return;
    it(`round-trips an E.164 ${code} number`, () => {
      const e164 = exampleE164(code);
      const r = parsePhone(e164);
      expect(r.country.code).toBe(code);
      expect(r.local).toBe(exampleNational(code));
      expect(toE164(r.country, r.local)).toBe(e164);
    });
  });

  it('matches longest dial-code prefix (e.g. +971 not +9)', () => {
    const e164 = exampleE164('AE');
    expect(parsePhone(e164).country.code).toBe('AE');
  });

  it('falls back to Egypt for legacy "01..." numbers', () => {
    const local = exampleNational('EG'); // e.g. "1001234567"
    const r = parsePhone(`0${local}`);
    expect(r.country.code).toBe('EG');
    expect(r.local).toBe(local);
  });
});

describe('PhoneInput - end-to-end (normalize → validate → E.164)', () => {
  const codes = ['EG', 'SA', 'AE', 'GB', 'FR', 'MA', 'DE', 'IN', 'BR', 'AU'];
  codes.forEach((code) => {
    const country = COUNTRIES.find((c) => c.code === code);
    if (!country) return;
    it(`${code}: normalize+validate+toE164 matches libphonenumber example`, () => {
      const ex = getExampleNumber(code as CountryCode, examples)!;
      const userTyped = country.trunkZero ? `0${ex.nationalNumber}` : ex.nationalNumber.toString();
      const local = normalizeLocal(country, userTyped);
      expect(local).toBe(ex.nationalNumber.toString());
      expect(isValidLocal(country, local)).toBe(true);
      expect(toE164(country, local)).toBe(ex.number);
    });
  });

  it('rejects an Egypt number that is the wrong length even after normalization', () => {
    const country = get('EG');
    const local = normalizeLocal(country, '0123');
    expect(isValidLocal(country, local)).toBe(false);
  });
});
