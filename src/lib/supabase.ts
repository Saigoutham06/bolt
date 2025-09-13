import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Route {
  id: string;
  route_number: string;
  route_name: string;
  start_location: string;
  end_location: string;
  total_stops: number;
  estimated_duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusStop {
  id: string;
  stop_name: string;
  stop_code: string;
  latitude: number;
  longitude: number;
  address: string;
  amenities: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface Bus {
  id: string;
  bus_number: string;
  route_id: string;
  driver_id?: string;
  capacity: number;
  current_passengers: number;
  is_active: boolean;
  last_maintenance?: string;
  created_at: string;
}

export interface BusLocation {
  id: string;
  bus_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  next_stop_id?: string;
  estimated_arrival?: string;
  status: 'on-time' | 'delayed' | 'early' | 'breakdown';
  recorded_at: string;
}

export interface Driver {
  id: string;
  employee_id: string;
  full_name: string;
  phone_number?: string;
  license_number?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Passenger {
  id: string;
  full_name?: string;
  phone_number?: string;
  preferred_language: string;
  notification_preferences: Record<string, any>;
  created_at: string;
}

// API functions
export const busAPI = {
  // Search buses and routes
  async searchBuses(query: string, latitude?: number, longitude?: number) {
    const params = new URLSearchParams({ query });
    if (latitude && longitude) {
      params.append('latitude', latitude.toString());
      params.append('longitude', longitude.toString());
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/bus-tracking/search?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search buses');
    }

    return response.json();
  },

  // Get live bus locations
  async getLiveLocations() {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/bus-tracking/live-locations`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get live locations');
    }

    return response.json();
  },

  // Get all routes
  async getRoutes() {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/bus-tracking/routes`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get routes');
    }

    return response.json();
  },

  // Get nearby stops
  async getNearbyStops(latitude: number, longitude: number, radius = 2) {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
    });

    const response = await fetch(
      `${supabaseUrl}/functions/v1/bus-tracking/stops?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get nearby stops');
    }

    return response.json();
  },

  // Get route details with stops
  async getRouteDetails(routeId: string) {
    const params = new URLSearchParams({ route_id: routeId });

    const response = await fetch(
      `${supabaseUrl}/functions/v1/bus-tracking/route-details?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get route details');
    }

    return response.json();
  },

  // Update bus location (for drivers)
  async updateBusLocation(locationData: {
    bus_id: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    next_stop_id?: string;
    estimated_arrival?: string;
    status?: 'on-time' | 'delayed' | 'early' | 'breakdown';
    current_passengers?: number;
  }) {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/bus-tracking/update-location`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update bus location');
    }

    return response.json();
  },
};

export const authAPI = {
  // Passenger signup
  async passengerSignup(signupData: {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
    preferred_language?: string;
  }) {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/auth-management/passenger-signup`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create account');
    }

    return response.json();
  },

  // Passenger login
  async passengerLogin(email: string, password: string) {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/auth-management/passenger-login`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  // Driver signup
  async driverSignup(signupData: {
    employee_id: string;
    full_name: string;
    phone_number: string;
    license_number: string;
  }) {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/auth-management/driver-signup`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to register driver');
    }

    return response.json();
  },

  // Send driver OTP
  async sendDriverOTP(employee_id: string) {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/auth-management/send-driver-otp`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employee_id }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send OTP');
    }

    return response.json();
  },

  // Driver login
  async driverLogin(employee_id: string, otp: string) {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/auth-management/driver-login`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employee_id, otp }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  // Get driver status
  async getDriverStatus(employee_id: string) {
    const params = new URLSearchParams({ employee_id });

    const response = await fetch(
      `${supabaseUrl}/functions/v1/auth-management/driver-status?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get driver status');
    }

    return response.json();
  },
};

// Real-time subscriptions
export const subscriptions = {
  // Subscribe to bus location updates
  subscribeToBusLocations(callback: (payload: any) => void) {
    return supabase
      .channel('bus-locations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bus_locations',
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to specific bus updates
  subscribeToBus(busId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`bus-${busId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bus_locations',
          filter: `bus_id=eq.${busId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to route updates
  subscribeToRoute(routeId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`route-${routeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'buses',
          filter: `route_id=eq.${routeId}`,
        },
        callback
      )
      .subscribe();
  },
};