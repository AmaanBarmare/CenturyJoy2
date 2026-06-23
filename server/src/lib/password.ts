import bcrypt from 'bcryptjs';

const BCRYPT_COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** PRD: min 10 chars, one upper, one lower, one digit, one special. */
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

export function isStrongPassword(p: string): boolean {
  return PASSWORD_RE.test(p);
}

export const PASSWORD_RULE =
  'Password must be at least 10 characters and include an uppercase letter, a lowercase letter, a digit, and a special character.';

/** Generate a temporary password that satisfies the policy. */
export function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%&*?';
  const all = upper + lower + digits + special;
  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];
  let out = pick(upper) + pick(lower) + pick(digits) + pick(special);
  for (let i = 0; i < 8; i++) out += pick(all);
  // shuffle
  return out
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
