/**
 * Seed the initial accounts. Run once after applying schema.sql:
 *   npm run seed
 *
 * Seeded accounts have must_change_password=false so you can sign in
 * immediately for a demo. Accounts the admin creates from the UI go
 * through the real first-login password flow.
 */
import { supabase } from '../lib/supabase';
import { hashPassword } from '../lib/password';
import type { Role } from '../types';

interface SeedUser {
  email: string;
  name: string;
  role: Role;
  password: string;
  company_name?: string;
}

const USERS: SeedUser[] = [
  { email: 'admin@centuryjoy.in', name: 'Priya Admin', role: 'admin', password: 'Admin@12345' },
  { email: 'admin2@centuryjoy.in', name: 'Backup Admin', role: 'admin', password: 'Admin@12345' },
  { email: 'studio@centuryjoy.in', name: 'Studio Team', role: 'studio', password: 'Studio@12345' },
  { email: 'client@centuryjoy.in', name: 'Arjun Mehta', role: 'client', password: 'Client@12345', company_name: 'Mehta Design Studio' },
];

async function main() {
  for (const u of USERS) {
    const password_hash = await hashPassword(u.password);
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', u.email)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('users')
        .update({ password_hash, role: u.role, name: u.name, is_active: true, must_change_password: false })
        .eq('id', existing.id);
      console.log(`updated  ${u.role.padEnd(6)} ${u.email}`);
    } else {
      await supabase.from('users').insert({
        email: u.email,
        name: u.name,
        role: u.role,
        password_hash,
        company_name: u.company_name ?? null,
        must_change_password: false,
      });
      console.log(`created  ${u.role.padEnd(6)} ${u.email}`);
    }
  }
  console.log('\nDemo credentials:');
  for (const u of USERS) console.log(`  ${u.role.padEnd(6)} ${u.email}  /  ${u.password}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
