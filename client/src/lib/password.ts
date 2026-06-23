const RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

export const PASSWORD_RULE =
  'At least 10 characters with an uppercase, a lowercase, a digit, and a special character.';

export function isStrongPassword(p: string): boolean {
  return RE.test(p);
}
