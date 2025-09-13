import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface BusLocationUpdate {
  bus_id: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  next_stop_id?: string;
  estimated_arrival?: string;
  status?: 'on-time' | 'delayed' | 'early' | 'breakdown';
  current_passengers?: number;
}

interface SearchQuery {
  query: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/bus-tracking', '');

    switch (req.method) {
      case 'GET':
        return await handleGet(supabaseClient, path, url.searchParams);
      case 'POST':
        return await handlePost(supabaseClient, path, req);
      case 'PUT':
        return await handlePut(supabaseClient, path, req);
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in bus-tracking function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleGet(supabaseClient: any, path: string, searchParams: URLSearchParams) {
  switch (path) {
    case '/search':
      return await searchBuses(supabaseClient, searchParams);
    case '/live-locations':
      return await getLiveLocations(supabaseClient);
    case '/routes':
      return await getRoutes(supabaseClient);
    case '/stops':
      return await getStops(supabaseClient, searchParams);
    case '/route-details':
      return await getRouteDetails(supabaseClient, searchParams);
    default:
      return new Response(
        JSON.stringify({ error: 'Endpoint not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
  }
}

async function handlePost(supabaseClient: any, path: string, req: Request) {
  const body = await req.json();
  
  switch (path) {
    case '/update-location':
      return await updateBusLocation(supabaseClient, body);
    case '/passenger-board':
      return await recordPassengerBoarding(supabaseClient, body);
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
    case '/bus-status':
      return await updateBusStatus(supabaseClient, body);
    default:
      return new Response(
        JSON.stringify({ error: 'Endpoint not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
  }
}

async function searchBuses(supabaseClient: any, searchParams: URLSearchParams) {
  const query = searchParams.get('query') || '';
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const radius = parseFloat(searchParams.get('radius') || '5'); // Default 5km radius

  let searchQuery = supabaseClient
    .from('routes')
    .select(`
      *,
      buses!inner(
        id,
        bus_number,
        current_passengers,
        capacity,
        is_active,
        bus_locations!inner(
          latitude,
          longitude,
          speed,
          status,
          estimated_arrival,
          next_stop_id,
          recorded_at,
          bus_stops!bus_locations_next_stop_id_fkey(
            stop_name,
            stop_code
          )
        )
      )
    `)
    .eq('is_active', true)
    .eq('buses.is_active', true);

  // Add text search if query provided
  if (query) {
    searchQuery = searchQuery.or(
      `route_number.ilike.%${query}%,route_name.ilike.%${query}%,start_location.ilike.%${query}%,end_location.ilike.%${query}%`
    );
  }

  const { data: routes, error } = await searchQuery
    .order('route_number')
    .limit(20);

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to search buses', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Transform data for frontend
  const transformedData = routes?.map(route => ({
    route: {
      id: route.id,
      route_number: route.route_number,
      route_name: route.route_name,
      start_location: route.start_location,
      end_location: route.end_location,
      estimated_duration: route.estimated_duration
    },
    buses: route.buses?.map((bus: any) => ({
      id: bus.id,
      bus_number: bus.bus_number,
      current_passengers: bus.current_passengers,
      capacity: bus.capacity,
      location: bus.bus_locations?.[0] ? {
        latitude: bus.bus_locations[0].latitude,
        longitude: bus.bus_locations[0].longitude,
        speed: bus.bus_locations[0].speed,
        status: bus.bus_locations[0].status,
        estimated_arrival: bus.bus_locations[0].estimated_arrival,
        next_stop: bus.bus_locations[0].bus_stops?.stop_name,
        last_updated: bus.bus_locations[0].recorded_at
      } : null
    })) || []
  })) || [];

  return new Response(
    JSON.stringify({ data: transformedData, count: transformedData.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getLiveLocations(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('bus_locations')
    .select(`
      *,
      buses!inner(
        id,
        bus_number,
        current_passengers,
        capacity,
        routes(route_number, route_name)
      ),
      bus_stops!bus_locations_next_stop_id_fkey(
        stop_name,
        stop_code
      )
    `)
    .gte('recorded_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Last 10 minutes
    .eq('buses.is_active', true)
    .order('recorded_at', { ascending: false });

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get live locations', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ data: data || [], count: data?.length || 0 }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getRoutes(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('routes')
    .select('*')
    .eq('is_active', true)
    .order('route_number');

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get routes', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ data: data || [], count: data?.length || 0 }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getStops(supabaseClient: any, searchParams: URLSearchParams) {
  const latitude = parseFloat(searchParams.get('latitude') || '0');
  const longitude = parseFloat(searchParams.get('longitude') || '0');
  const radius = parseFloat(searchParams.get('radius') || '2'); // Default 2km radius

  let query = supabaseClient
    .from('bus_stops')
    .select('*')
    .eq('is_active', true);

  // If coordinates provided, find nearby stops
  if (latitude && longitude) {
    // Using simple distance calculation (for more accuracy, use PostGIS functions)
    query = query.rpc('nearby_stops', {
      lat: latitude,
      lng: longitude,
      radius_km: radius
    });
  }

  const { data, error } = await query.order('stop_name').limit(50);

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get stops', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ data: data || [], count: data?.length || 0 }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getRouteDetails(supabaseClient: any, searchParams: URLSearchParams) {
  const routeId = searchParams.get('route_id');
  
  if (!routeId) {
    return new Response(
      JSON.stringify({ error: 'Route ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data, error } = await supabaseClient
    .from('routes')
    .select(`
      *,
      route_stops!inner(
        stop_sequence,
        estimated_travel_time,
        bus_stops(*)
      )
    `)
    .eq('id', routeId)
    .eq('is_active', true)
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get route details', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ data: data || null }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateBusLocation(supabaseClient: any, locationData: BusLocationUpdate) {
  const { bus_id, current_passengers, ...locationUpdate } = locationData;

  // Update bus location
  const { error: locationError } = await supabaseClient
    .from('bus_locations')
    .insert({
      bus_id,
      ...locationUpdate,
      recorded_at: new Date().toISOString()
    });

  if (locationError) {
    return new Response(
      JSON.stringify({ error: 'Failed to update location', details: locationError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Update passenger count if provided
  if (current_passengers !== undefined) {
    const { error: busError } = await supabaseClient
      .from('buses')
      .update({ current_passengers })
      .eq('id', bus_id);

    if (busError) {
      console.error('Failed to update passenger count:', busError);
    }
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Location updated successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateBusStatus(supabaseClient: any, statusData: any) {
  const { bus_id, status, ...updates } = statusData;

  const { error } = await supabaseClient
    .from('buses')
    .update({ ...updates })
    .eq('id', bus_id);

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update bus status', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Bus status updated successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function recordPassengerBoarding(supabaseClient: any, boardingData: any) {
  const { error } = await supabaseClient
    .from('passenger_tracking')
    .insert({
      ...boardingData,
      boarding_time: new Date().toISOString()
    });

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to record boarding', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Boarding recorded successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}