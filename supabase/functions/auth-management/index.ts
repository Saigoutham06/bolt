import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface PassengerSignup {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  preferred_language?: string;
}

interface DriverSignup {
  employee_id: string;
  full_name: string;
  phone_number: string;
  license_number: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/auth-management', '');

    switch (req.method) {
      case 'POST':
        return await handlePost(supabaseClient, path, req);
      case 'PUT':
        return await handlePut(supabaseClient, path, req);
      case 'GET':
        return await handleGet(supabaseClient, path, url.searchParams);
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in auth-management function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handlePost(supabaseClient: any, path: string, req: Request) {
  const body = await req.json();
  
  switch (path) {
    case '/passenger-signup':
      return await passengerSignup(supabaseClient, body);
    case '/driver-signup':
      return await driverSignup(supabaseClient, body);
    case '/passenger-login':
      return await passengerLogin(supabaseClient, body);
    case '/driver-login':
      return await driverLogin(supabaseClient, body);
    case '/send-driver-otp':
      return await sendDriverOTP(supabaseClient, body);
    default:
      return new Response(
        JSON.stringify({ error: 'Endpoint not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
  }
}

async function handlePut(supabaseClient: any, path: string, req: Request) {
  const body = await req.json();
  
  switch (path) {
    case '/update-profile':
      return await updateProfile(supabaseClient, body, req);
    case '/verify-driver':
      return await verifyDriver(supabaseClient, body);
    default:
      return new Response(
        JSON.stringify({ error: 'Endpoint not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
  }
}

async function handleGet(supabaseClient: any, path: string, searchParams: URLSearchParams) {
  switch (path) {
    case '/profile':
      return await getProfile(supabaseClient, searchParams);
    case '/driver-status':
      return await getDriverStatus(supabaseClient, searchParams);
    default:
      return new Response(
        JSON.stringify({ error: 'Endpoint not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
  }
}

async function passengerSignup(supabaseClient: any, signupData: PassengerSignup) {
  const { email, password, full_name, phone_number, preferred_language = 'en' } = signupData;

  // Create auth user
  const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email for demo
    user_metadata: {
      full_name,
      user_type: 'passenger'
    }
  });

  if (authError) {
    return new Response(
      JSON.stringify({ error: 'Failed to create user account', details: authError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Create passenger profile
  const { error: profileError } = await supabaseClient
    .from('passengers')
    .insert({
      id: authData.user.id,
      full_name,
      phone_number,
      preferred_language
    });

  if (profileError) {
    // Cleanup: delete the auth user if profile creation fails
    await supabaseClient.auth.admin.deleteUser(authData.user.id);
    
    return new Response(
      JSON.stringify({ error: 'Failed to create passenger profile', details: profileError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Passenger account created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function driverSignup(supabaseClient: any, signupData: DriverSignup) {
  const { employee_id, full_name, phone_number, license_number } = signupData;

  // Check if employee_id already exists
  const { data: existingDriver } = await supabaseClient
    .from('drivers')
    .select('employee_id')
    .eq('employee_id', employee_id)
    .single();

  if (existingDriver) {
    return new Response(
      JSON.stringify({ error: 'Employee ID already registered' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // For drivers, we create a temporary account that needs admin verification
  // Generate a temporary email based on employee_id
  const tempEmail = `${employee_id}@buswhere.temp`;
  const tempPassword = generateTempPassword();

  const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
    email: tempEmail,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name,
      user_type: 'driver',
      employee_id
    }
  });

  if (authError) {
    return new Response(
      JSON.stringify({ error: 'Failed to create driver account', details: authError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Create driver profile
  const { error: profileError } = await supabaseClient
    .from('drivers')
    .insert({
      id: authData.user.id,
      employee_id,
      full_name,
      phone_number,
      license_number,
      is_verified: false, // Requires admin verification
      is_active: false
    });

  if (profileError) {
    await supabaseClient.auth.admin.deleteUser(authData.user.id);
    
    return new Response(
      JSON.stringify({ error: 'Failed to create driver profile', details: profileError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Driver registration submitted. Awaiting admin verification.',
      employee_id
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function passengerLogin(supabaseClient: any, loginData: any) {
  const { email, password } = loginData;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid credentials', details: error.message }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get passenger profile
  const { data: profile } = await supabaseClient
    .from('passengers')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return new Response(
    JSON.stringify({ 
      success: true,
      user: data.user,
      profile,
      session: data.session
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function driverLogin(supabaseClient: any, loginData: any) {
  const { employee_id, otp } = loginData;

  // Verify OTP (in a real app, you'd store OTPs in a secure way)
  // For demo purposes, we'll accept any 6-digit code
  if (!otp || otp.length !== 6) {
    return new Response(
      JSON.stringify({ error: 'Invalid OTP format' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get driver by employee_id
  const { data: driver, error: driverError } = await supabaseClient
    .from('drivers')
    .select('*')
    .eq('employee_id', employee_id)
    .eq('is_verified', true)
    .eq('is_active', true)
    .single();

  if (driverError || !driver) {
    return new Response(
      JSON.stringify({ error: 'Driver not found or not verified' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Create a session token for the driver (simplified approach)
  const sessionToken = generateSessionToken(driver.id);

  return new Response(
    JSON.stringify({ 
      success: true,
      driver,
      session_token: sessionToken,
      message: 'Driver logged in successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function sendDriverOTP(supabaseClient: any, otpData: any) {
  const { employee_id } = otpData;

  // Check if driver exists and is verified
  const { data: driver } = await supabaseClient
    .from('drivers')
    .select('employee_id, phone_number, is_verified, is_active')
    .eq('employee_id', employee_id)
    .single();

  if (!driver) {
    return new Response(
      JSON.stringify({ error: 'Employee ID not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!driver.is_verified || !driver.is_active) {
    return new Response(
      JSON.stringify({ error: 'Driver account not verified or inactive' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // In a real application, you would:
  // 1. Generate a random 6-digit OTP
  // 2. Store it in a secure cache (Redis) with expiration
  // 3. Send it via SMS to the driver's phone number
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // For demo purposes, we'll just return success
  // In production, integrate with SMS service like Twilio
  console.log(`OTP for ${employee_id}: ${otp}`);

  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'OTP sent successfully',
      // In production, never return the actual OTP
      debug_otp: otp // Only for demo purposes
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateProfile(supabaseClient: any, profileData: any, req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Authorization header required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Extract user from JWT token (simplified)
  const { user_type, user_id, ...updates } = profileData;
  
  const table = user_type === 'driver' ? 'drivers' : 'passengers';
  
  const { error } = await supabaseClient
    .from(table)
    .update(updates)
    .eq('id', user_id);

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update profile', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Profile updated successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function verifyDriver(supabaseClient: any, verificationData: any) {
  const { driver_id, is_verified, is_active } = verificationData;

  const { error } = await supabaseClient
    .from('drivers')
    .update({ is_verified, is_active })
    .eq('id', driver_id);

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to verify driver', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Driver verification updated' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getProfile(supabaseClient: any, searchParams: URLSearchParams) {
  const userId = searchParams.get('user_id');
  const userType = searchParams.get('user_type');

  if (!userId || !userType) {
    return new Response(
      JSON.stringify({ error: 'User ID and type required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const table = userType === 'driver' ? 'drivers' : 'passengers';
  
  const { data, error } = await supabaseClient
    .from(table)
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Profile not found', details: error.message }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getDriverStatus(supabaseClient: any, searchParams: URLSearchParams) {
  const employeeId = searchParams.get('employee_id');

  if (!employeeId) {
    return new Response(
      JSON.stringify({ error: 'Employee ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data, error } = await supabaseClient
    .from('drivers')
    .select('employee_id, full_name, is_verified, is_active')
    .eq('employee_id', employeeId)
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Driver not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Utility functions
function generateTempPassword(): string {
  return Math.random().toString(36).slice(-12);
}

function generateSessionToken(driverId: string): string {
  // In production, use proper JWT tokens
  return btoa(`${driverId}:${Date.now()}`);
}