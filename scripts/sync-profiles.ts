import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('\n❌ ERROR: Missing configuration!');
  console.error('Please ensure the following are set in your .env file:');
  console.error('1. VITE_SUPABASE_URL');
  console.error('2. SUPABASE_SERVICE_ROLE_KEY (Get this from Supabase Dashboard -> Settings -> API)\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function syncProfilesToAuth() {
  console.log('\n🚀 Starting Organization-wide Auth Sync...\n');

  // 1. Get all profiles
  const { data: profiles, error: fetchError } = await supabase
    .from('profiles')
    .select('*');

  if (fetchError) {
    console.error('❌ Failed to fetch profiles:', fetchError.message);
    return;
  }

  console.log(`📊 Found ${profiles.length} profiles to process.\n`);

  // Fetch all auth users once outside the loop (more efficient)
  const { data: { users: allUsers }, error: listError } = await supabase.auth.admin.listUsers({
    perPage: 1000
  });

  if (listError) {
    console.error('❌ Failed to fetch auth users:', listError.message);
    return;
  }

  for (const profile of profiles) {
    const email = profile.contact;
    const studentId = profile.student_id;

    if (!email || !studentId) {
      console.log(`⚠️  Skipping ${profile.full_name || 'Unknown'}: Missing email or Student ID.`);
      continue;
    }

    try {
      // 2. Check if Auth user already exists by email
      let existingUser = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());

      if (existingUser) {
        console.log(`✅ [ALREADY EXISTS] ${profile.full_name} (${email}) - UID: ${existingUser.id}`);

        // Ensure the profile table uses the correct Auth UID
        if (profile.id !== existingUser.id) {
          console.log(`   🔄 Correcting profile UID link...`);
          await supabase.from('profiles').delete().eq('student_id', studentId);
          await supabase.from('profiles').insert({
            ...profile,
            id: existingUser.id
          });
        }
        continue;
      }

      // 3. Delete existing profile row before creating auth user.
      //    The trigger will re-create it with the correct Auth UID.
      console.log(`✨ [SYNCING] ${profile.full_name} (${email})`);

      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('student_id', studentId);

      if (deleteError) {
        console.error(`   ❌ Failed to clear existing profile record:`, deleteError.message);
        continue;
      }

      // ✅ Wait for delete to fully propagate before trigger fires
      await new Promise(resolve => setTimeout(resolve, 300));

      // 4. Create the Auth User — pass full metadata so trigger populates correctly
      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: studentId,
        email_confirm: true,
        user_metadata: {
          full_name: profile.full_name,
          student_id: profile.student_id,  // ✅ trigger uses this instead of TEMP-
          division: profile.division,       // ✅ trigger uses this
          batch: profile.batch,             // ✅ trigger uses this
        }
      });

      if (createError) {
        if (createError.message.includes('Database error') || createError.message.includes('already exists')) {
          console.log(`   🔎 Create failed, searching for existing auth user ${email}...`);
          const { data: { users: searchUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
          const found = searchUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());

          if (found) {
            console.log(`   ✅ Found user ${email} in Auth. Linking...`);
            await supabase.from('profiles').delete().eq('student_id', studentId);
            await supabase.from('profiles').insert({ ...profile, id: found.id });
            continue;
          }
        }

        console.error(`   ❌ Failed to create auth account for ${email}:`, createError.message);
        // Restore the profile if auth creation failed
        await supabase.from('profiles').upsert(profile);
        continue;
      }

      const newUid = authData.user.id;

      // 5. Upsert the full original profile data onto the trigger-created row
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          ...profile,
          id: newUid,
          status: profile.status || 'active'
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (updateError) {
        console.error(`   ❌ Failed to sync profile data for ${email}:`, updateError.message);
        continue;
      }

      console.log(`   🎉 Successfully authenticated and linked!`);

    } catch (err: any) {
      console.error(`   ❌ Unexpected error for ${profile.full_name}:`, err.message);
    }
  }

  console.log('\n✅ All profiles processed successfully!\n');
  console.log('Members can now log in using:');
  console.log('Email: Their registered email');
  console.log('Password: Their Student ID\n');
}

syncProfilesToAuth().catch(console.error);