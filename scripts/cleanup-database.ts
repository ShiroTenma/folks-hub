import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// THE CHOSEN ONES (These accounts will NOT be deleted)
const PROTECTED_EMAILS = [
  'ansellmatita@gmail.com',
  'shirokumatenma@gmail.com'
];

async function cleanupDatabase() {
  console.log('\n🧨 WARNING: DATABASE CLEANUP IN PROGRESS 🧨');
  console.log('Targeting all data EXCEPT for protected admins.\n');

  try {
    // 1. Identify Protected UIDs
    const { data: { users: allUsers }, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (authError) throw authError;

    const protectedUsers = allUsers.filter(u => 
      u.email && PROTECTED_EMAILS.includes(u.email.toLowerCase())
    );
    const protectedUids = protectedUsers.map(u => u.id);

    if (protectedUids.length === 0) {
      console.error('❌ CRITICAL ERROR: Could not find any of the protected admin accounts in Auth!');
      console.error('Cleanup aborted to prevent locking yourself out.');
      return;
    }

    console.log(`🛡️ Found ${protectedUids.length} protected admin accounts.`);

    // 2. Clear Application Tables (Child tables first if possible)
    const tablesToWipe = [
      'split_bill_items',
      'split_bills',
      'finance_transactions',
      'notifications',
      'monthly_cash',
      'tasks'
    ];

    for (const table of tablesToWipe) {
      console.log(`🧹 Clearing table: ${table}...`);
      // Most of these don't necessarily have a direct link to a user in every row, 
      // so we might just wipe them entirely if they are transactional.
      // Or we can try to filter by creator_id if it exists.
      // For a "Reset", wiping them entirely is usually what's requested.
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
      if (error && error.code !== '42P01') {
        console.warn(`   ⚠️ Warning wiping ${table}: ${error.message}`);
      }
    }

    // 3. Clear Profiles (Except protected ones)
    console.log('👤 Cleaning up Profiles...');
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .not('id', 'in', `(${protectedUids.join(',')})`);
    
    if (profileError) {
      console.error('❌ Error cleaning profiles:', profileError.message);
    }

    // 4. Clear Auth Users (Except protected ones)
    console.log('🔑 Cleaning up Auth Users...');
    const usersToDelete = allUsers.filter(u => !protectedUids.includes(u.id));
    
    console.log(`   Found ${usersToDelete.length} users to remove from Auth.`);
    
    for (const user of usersToDelete) {
      process.stdout.write(`   Deleting ${user.email}... `);
      const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
      if (delError) {
        console.log('❌ Failed');
      } else {
        console.log('✅');
      }
    }

    console.log('\n✨ DATABASE CLEANUP COMPLETE ✨');
    console.log('The protected admin accounts remain intact.');
    console.log('Existing members must now re-authenticate or be re-synced.');

  } catch (err: any) {
    console.error('\n💥 FATAL ERROR DURING CLEANUP:', err.message);
  }
}

cleanupDatabase().catch(console.error);
