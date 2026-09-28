import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { SEED_USERS } from '../src/data/seedData.js';

// Load env vars
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  console.error("Please add SUPABASE_SERVICE_ROLE_KEY to .env to run this migration.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function migrateUsers() {
  console.log("Starting Supabase Auth user migration...");

  for (const user of SEED_USERS) {
    console.log(`Migrating user: ${user.email}`);

    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: (user as any).passcode || 'jarinyes', // Default password
      email_confirm: true,
      user_metadata: {
        name: user.name,
        role: user.role,
        agencyType: user.agencyType,
        agencyName: user.agencyName,
        barangay: user.barangay,
        position: user.position,
        badgeOrIdNumber: user.badgeOrIdNumber
      }
    });

    let authId: string;

    if (authError) {
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        console.log(`User ${user.email} already exists in auth.users, fetching existing ID...`);
        // Fetch existing user to get their ID
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error(`Failed to list users to find ${user.email}:`, listError);
          continue;
        }
        
        const existingUser = listData.users.find((u: any) => u.email === user.email);
        if (!existingUser) {
          console.error(`Could not find existing user ${user.email} in auth list.`);
          continue;
        }
        authId = existingUser.id;
      } else {
        console.error(`Failed to create auth user for ${user.email}:`, authError);
        continue;
      }
    } else {
      authId = authData.user.id;
      console.log(`Created auth user ${user.email} with UUID ${authId}`);
    }

    // Insert into public.users. 
    // If the database trigger handles this, you can skip this insert or do an UPSERT.
    // For safety, we will upsert directly in case the trigger wasn't set up yet.
    const { error: profileError } = await supabase.from('users').upsert({
      id: authId,
      legacy_id: user.id,
      name: user.name,
      role: user.role,
      agencyType: user.agencyType,
      agencyName: user.agencyName,
      barangay: user.barangay,
      position: user.position,
      badgeOrIdNumber: user.badgeOrIdNumber,
      email: user.email,
      phone: user.phone,
      address: user.address
    });

    if (profileError) {
      console.error(`Failed to create public.users profile for ${user.email}:`, profileError);
    } else {
      console.log(`Successfully migrated profile for ${user.email}`);
    }
  }

  console.log("Migration complete!");
}

migrateUsers().catch(console.error);
