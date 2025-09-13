// Mock API functions to replace Supabase calls
import {
  mockRoutes,
  mockBuses,
  mockBusStops,
  mockBusLocations,
  mockDrivers,
  mockPassengers,
  Route,
  Bus,
  BusStop,
  BusLocation,
  Driver,
  Passenger,
} from './mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock search results interface
interface BusTrackingData {
  route: {
    id: string;
    route_number: string;
    route_name: string;
    start_location: string;
    end_location: string;
    estimated_duration: number;
  };
  buses: Array<{
    id: string;
    bus_number: string;
    current_passengers: number;
    capacity: number;
    location: {
      latitude: number;
      longitude: number;
      speed: number;
      status: 'on-time' | 'delayed' | 'early' | 'breakdown';
      estimated_arrival: string;
      next_stop: string;
      last_updated: string;
    } | null;
  }>;
}

export const busAPI = {
  // Search buses and routes
  async searchBuses(query: string, latitude?: number, longitude?: number): Promise<{ data: BusTrackingData[] }> {
    await delay(800); // Simulate network delay

    const filteredRoutes = mockRoutes.filter(route =>
      route.route_number.toLowerCase().includes(query.toLowerCase()) ||
      route.route_name.toLowerCase().includes(query.toLowerCase()) ||
      route.start_location.toLowerCase().includes(query.toLowerCase()) ||
      route.end_location.toLowerCase().includes(query.toLowerCase())
    );

    const results: BusTrackingData[] = filteredRoutes.map(route => {
      const routeBuses = mockBuses.filter(bus => bus.route_id === route.id);
      
      return {
        route: {
          id: route.id,
          route_number: route.route_number,
          route_name: route.route_name,
          start_location: route.start_location,
          end_location: route.end_location,
          estimated_duration: route.estimated_duration,
        },
        buses: routeBuses.map(bus => {
          const location = mockBusLocations.find(loc => loc.bus_id === bus.id);
          const nextStop = location?.next_stop_id 
            ? mockBusStops.find(stop => stop.id === location.next_stop_id)
            : null;

          return {
            id: bus.id,
            bus_number: bus.bus_number,
            current_passengers: bus.current_passengers,
            capacity: bus.capacity,
            location: location ? {
              latitude: location.latitude,
              longitude: location.longitude,
              speed: location.speed,
              status: location.status,
              estimated_arrival: location.estimated_arrival || '',
              next_stop: nextStop?.stop_name || 'Unknown',
              last_updated: location.recorded_at,
            } : null,
          };
        }),
      };
    });

    return { data: results };
  },

  // Get live bus locations
  async getLiveLocations(): Promise<{ data: any[] }> {
    await delay(500);
    
    const liveData = mockBusLocations.map(location => {
      const bus = mockBuses.find(b => b.id === location.bus_id);
      const route = bus ? mockRoutes.find(r => r.id === bus.route_id) : null;
      const nextStop = location.next_stop_id 
        ? mockBusStops.find(stop => stop.id === location.next_stop_id)
        : null;

      return {
        ...location,
        bus: bus ? {
          ...bus,
          route: route ? { route_number: route.route_number, route_name: route.route_name } : null,
        } : null,
        next_stop: nextStop,
      };
    });

    return { data: liveData };
  },

  // Get all routes
  async getRoutes(): Promise<{ data: Route[] }> {
    await delay(300);
    return { data: mockRoutes };
  },

  // Get nearby stops
  async getNearbyStops(latitude: number, longitude: number, radius = 2): Promise<{ data: BusStop[] }> {
    await delay(400);
    
    // Simple distance calculation (not accurate, just for demo)
    const nearbyStops = mockBusStops.filter(stop => {
      const distance = Math.sqrt(
        Math.pow(stop.latitude - latitude, 2) + Math.pow(stop.longitude - longitude, 2)
      );
      return distance <= radius * 0.01; // Rough conversion
    });

    return { data: nearbyStops };
  },

  // Get route details with stops
  async getRouteDetails(routeId: string): Promise<{ data: any }> {
    await delay(600);
    
    const route = mockRoutes.find(r => r.id === routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    // Mock route stops data
    const routeStops = mockBusStops.slice(0, 5).map((stop, index) => ({
      stop_sequence: index + 1,
      estimated_travel_time: index * 10,
      bus_stop: stop,
    }));

    return {
      data: {
        ...route,
        route_stops: routeStops,
      },
    };
  },

  // Update bus location (for drivers)
  async updateBusLocation(locationData: any): Promise<{ success: boolean }> {
    await delay(200);
    console.log('Mock: Updated bus location', locationData);
    return { success: true };
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
  }): Promise<{ success: boolean; user: any }> {
    await delay(1000);
    
    // Check if email already exists
    const existingUser = mockPassengers.find(p => p.email === signupData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: Date.now().toString(),
      email: signupData.email,
      full_name: signupData.full_name,
      phone_number: signupData.phone_number,
      preferred_language: signupData.preferred_language || 'en',
    };

    mockPassengers.push(newUser);
    
    return {
      success: true,
      user: newUser,
    };
  },

  // Passenger login
  async passengerLogin(email: string, password: string): Promise<{ success: boolean; user: any; session: any }> {
    await delay(800);
    
    const user = mockPassengers.find(p => p.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Mock session
    const session = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_at: Date.now() + 3600000, // 1 hour
    };

    return {
      success: true,
      user,
      session,
    };
  },

  // Driver signup
  async driverSignup(signupData: {
    employee_id: string;
    full_name: string;
    phone_number: string;
    license_number: string;
  }): Promise<{ success: boolean; message: string }> {
    await delay(1200);
    
    const existingDriver = mockDrivers.find(d => d.employee_id === signupData.employee_id);
    if (existingDriver) {
      throw new Error('Employee ID already registered');
    }

    const newDriver = {
      id: Date.now().toString(),
      employee_id: signupData.employee_id,
      full_name: signupData.full_name,
      phone_number: signupData.phone_number,
      license_number: signupData.license_number,
      is_verified: false,
      is_active: false,
    };

    mockDrivers.push(newDriver);

    return {
      success: true,
      message: 'Driver registration submitted. Awaiting admin verification.',
    };
  },

  // Send driver OTP
  async sendDriverOTP(employee_id: string): Promise<{ success: boolean; debug_otp?: string }> {
    await delay(500);
    
    const driver = mockDrivers.find(d => d.employee_id === employee_id);
    if (!driver) {
      throw new Error('Employee ID not found');
    }

    if (!driver.is_verified || !driver.is_active) {
      throw new Error('Driver account not verified or inactive');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    return {
      success: true,
      debug_otp: otp, // For demo purposes
    };
  },

  // Driver login
  async driverLogin(employee_id: string, otp: string): Promise<{ success: boolean; driver: any }> {
    await delay(600);
    
    if (!otp || otp.length !== 6) {
      throw new Error('Invalid OTP format');
    }

    const driver = mockDrivers.find(d => 
      d.employee_id === employee_id && d.is_verified && d.is_active
    );

    if (!driver) {
      throw new Error('Driver not found or not verified');
    }

    return {
      success: true,
      driver,
    };
  },

  // Get driver status
  async getDriverStatus(employee_id: string): Promise<{ data: any }> {
    await delay(300);
    
    const driver = mockDrivers.find(d => d.employee_id === employee_id);
    if (!driver) {
      throw new Error('Driver not found');
    }

    return {
      data: {
        employee_id: driver.employee_id,
        full_name: driver.full_name,
        is_verified: driver.is_verified,
        is_active: driver.is_active,
      },
    };
  },
};

// Mock real-time subscriptions
export const subscriptions = {
  // Subscribe to bus location updates
  subscribeToBusLocations(callback: (payload: any) => void) {
    // Simulate real-time updates every 10 seconds
    const interval = setInterval(() => {
      // Update random bus location
      const randomBus = mockBusLocations[Math.floor(Math.random() * mockBusLocations.length)];
      const updatedLocation = {
        ...randomBus,
        latitude: randomBus.latitude + (Math.random() - 0.5) * 0.001,
        longitude: randomBus.longitude + (Math.random() - 0.5) * 0.001,
        speed: Math.max(0, randomBus.speed + (Math.random() - 0.5) * 10),
        recorded_at: new Date().toISOString(),
      };
      
      callback({
        eventType: 'INSERT',
        new: updatedLocation,
        old: null,
      });
    }, 10000);

    return {
      unsubscribe: () => clearInterval(interval),
    };
  },

  // Subscribe to specific bus updates
  subscribeToBus(busId: string, callback: (payload: any) => void) {
    const interval = setInterval(() => {
      const busLocation = mockBusLocations.find(loc => loc.bus_id === busId);
      if (busLocation) {
        const updatedLocation = {
          ...busLocation,
          latitude: busLocation.latitude + (Math.random() - 0.5) * 0.001,
          longitude: busLocation.longitude + (Math.random() - 0.5) * 0.001,
          recorded_at: new Date().toISOString(),
        };
        
        callback({
          eventType: 'UPDATE',
          new: updatedLocation,
          old: busLocation,
        });
      }
    }, 5000);

    return {
      unsubscribe: () => clearInterval(interval),
    };
  },

  // Subscribe to route updates
  subscribeToRoute(routeId: string, callback: (payload: any) => void) {
    const interval = setInterval(() => {
      const routeBuses = mockBuses.filter(bus => bus.route_id === routeId);
      const randomBus = routeBuses[Math.floor(Math.random() * routeBuses.length)];
      
      if (randomBus) {
        callback({
          eventType: 'UPDATE',
          new: {
            ...randomBus,
            current_passengers: Math.max(0, Math.min(randomBus.capacity, 
              randomBus.current_passengers + Math.floor((Math.random() - 0.5) * 5)
            )),
          },
          old: randomBus,
        });
      }
    }, 15000);

    return {
      unsubscribe: () => clearInterval(interval),
    };
  },
};