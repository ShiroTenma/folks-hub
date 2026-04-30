import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, full_name, id: profileId } = await req.json()

    // 1. Create or Update Auth User
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError

    let authUser = users.find(u => u.email === email)
    
    if (authUser) {
      // Update existing auth user
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        authUser.id,
        { password: password, user_metadata: { full_name } }
      )
      if (error) throw error
      authUser = data.user
    } else {
      // Create new auth user
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name }
      })
      if (error) throw error
      authUser = data.user
    }

    // 2. LINKING LOGIC: Update the profile to match the new Auth ID
    // We search by email (contact) or the current temporary ID
    console.log(`Linking profile for ${email}...`)
    
    const { data: existingProfile, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .or(`contact.eq."${email}",id.eq."${profileId}"`)
      .maybeSingle()

    if (findError) {
      console.error('Error finding profile:', findError)
    }

    if (existingProfile) {
      if (existingProfile.id !== authUser.id) {
        console.log(`Updating profile ID from ${existingProfile.id} to ${authUser.id}`)
        
        const { error: linkError } = await supabaseAdmin
          .from('profiles')
          .update({ id: authUser.id })
          .eq('id', existingProfile.id)
        
        if (linkError) {
          console.error('CRITICAL: Failed to link profile ID:', linkError)
          throw new Error(`Database error: ${linkError.message}. Make sure you ran the Cascade Fix SQL.`)
        }
        console.log('Profile ID linked successfully.')
      } else {
        console.log('Profile already linked correctly.')
      }
    } else {
      console.log('No existing profile found to link. Creating a new one...')
      // If no profile exists at all, we create one
      const { error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUser.id,
          full_name: full_name || 'New Member',
          contact: email,
          student_id: `TEMP_${Math.floor(Math.random() * 10000)}`, // Placeholder
          division: 'Executive Board', // Default
          batch: '2024' // Default
        })
      if (createError) console.error('Error creating missing profile:', createError)
    }

    return new Response(
      JSON.stringify({ user: authUser }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
