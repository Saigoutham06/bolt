// Mock data for the BusWhere+ application
export interface Route {
  id: string;
  route_number: string;
  route_name: string;
  start_location: string;
  end_location: string;
  total_stops: number;
  estimated_duration: number;
  is_active: boolean;
}

export interface BusStop {
  id: string;
  stop_name: string;
  stop_code: string;
  latitude: number;
  longitude: number;
  address: string;
  is_active: boolean;
}

export interface Bus {
  id: string;
  bus_number: string;
  route_id: string;
  capacity: number;
  current_passengers: number;
  is_active: boolean;
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
}

export interface Passenger {
  id: string;
  full_name?: string;
  phone_number?: string;
  preferred_language: string;
  email?: string;
}

// Mock Routes
export const mockRoutes: Route[] = [
  {
    id: '1',
    route_number: '45A',
    route_name: 'Secunderabad to Gachibowli',
    start_location: 'Secunderabad Railway Station',
    end_location: 'Gachibowli DLF',
    total_stops: 25,
    estimated_duration: 90,
    is_active: true,
  },
  {
    id: '2',
    route_number: '12B',
    route_name: 'KPHB to Ameerpet',
    start_location: 'KPHB Colony',
    end_location: 'Ameerpet Metro Station',
    total_stops: 18,
    estimated_duration: 45,
    is_active: true,
  },
  {
    id: '3',
    route_number: '78C',
    route_name: 'Kukatpally to Begumpet',
    start_location: 'Kukatpally Housing Board',
    end_location: 'Begumpet Airport',
    total_stops: 22,
    estimated_duration: 60,
    is_active: true,
  },
  {
    id: '4',
    route_number: '156',
    route_name: 'Mehdipatnam to Uppal',
    start_location: 'Mehdipatnam Bus Station',
    end_location: 'Uppal Depot',
    total_stops: 30,
    estimated_duration: 75,
    is_active: true,
  },
  {
    id: '5',
    route_number: '290U',
    route_name: 'JBS to Hitec City',
    start_location: 'Jubilee Bus Station',
    end_location: 'Hitec City',
    total_stops: 28,
    estimated_duration: 85,
    is_active: true,
  },
];

// Mock Bus Stops
export const mockBusStops: BusStop[] = [
  {
    id: '1',
    stop_name: 'Secunderabad Railway Station',
    stop_code: 'SEC001',
    latitude: 17.4399,
    longitude: 78.5017,
    address: 'Secunderabad Railway Station, Hyderabad',
    is_active: true,
  },
  {
    id: '2',
    stop_name: 'Paradise Circle',
    stop_code: 'PAR002',
    latitude: 17.4326,
    longitude: 78.4926,
    address: 'Paradise Circle, Secunderabad',
    is_active: true,
  },
  {
    id: '3',
    stop_name: 'Ameerpet Metro',
    stop_code: 'AME003',
    latitude: 17.4374,
    longitude: 78.4482,
    address: 'Ameerpet Metro Station, Hyderabad',
    is_active: true,
  },
  {
    id: '4',
    stop_name: 'Punjagutta',
    stop_code: 'PUN004',
    latitude: 17.4239,
    longitude: 78.4738,
    address: 'Punjagutta, Hyderabad',
    is_active: true,
  },
  {
    id: '5',
    stop_name: 'Banjara Hills',
    stop_code: 'BAN005',
    latitude: 17.4126,
    longitude: 78.4071,
    address: 'Banjara Hills, Hyderabad',
    is_active: true,
  },
  {
    id: '6',
    stop_name: 'Jubilee Hills',
    stop_code: 'JUB006',
    latitude: 17.4239,
    longitude: 78.4004,
    address: 'Jubilee Hills, Hyderabad',
    is_active: true,
  },
  {
    id: '7',
    stop_name: 'Madhapur',
    stop_code: 'MAD007',
    latitude: 17.4483,
    longitude: 78.3915,
    address: 'Madhapur, Hyderabad',
    is_active: true,
  },
  {
    id: '8',
    stop_name: 'Gachibowli DLF',
    stop_code: 'GAC008',
    latitude: 17.4435,
    longitude: 78.3479,
    address: 'Gachibowli DLF Cyber City',
    is_active: true,
  },
  {
    id: '9',
    stop_name: 'KPHB Colony',
    stop_code: 'KPH009',
    latitude: 17.4851,
    longitude: 78.3912,
    address: 'KPHB Colony, Hyderabad',
    is_active: true,
  },
  {
    id: '10',
    stop_name: 'Kukatpally',
    stop_code: 'KUK010',
    latitude: 17.4847,
    longitude: 78.4138,
    address: 'Kukatpally Housing Board',
    is_active: true,
  },
];

// Mock Buses
export const mockBuses: Bus[] = [
  {
    id: '1',
    bus_number: 'TS09AB1234',
    route_id: '1',
    capacity: 45,
    current_passengers: 23,
    is_active: true,
  },
  {
    id: '2',
    bus_number: 'TS09CD5678',
    route_id: '2',
    capacity: 40,
    current_passengers: 18,
    is_active: true,
  },
  {
    id: '3',
    bus_number: 'TS09EF9012',
    route_id: '3',
    capacity: 50,
    current_passengers: 31,
    is_active: true,
  },
  {
    id: '4',
    bus_number: 'TS09GH3456',
    route_id: '4',
    capacity: 45,
    current_passengers: 12,
    is_active: true,
  },
  {
    id: '5',
    bus_number: 'TS09IJ7890',
    route_id: '5',
    capacity: 50,
    current_passengers: 28,
    is_active: true,
  },
];

// Mock Bus Locations
export const mockBusLocations: BusLocation[] = [
  {
    id: '1',
    bus_id: '1',
    latitude: 17.4326,
    longitude: 78.4926,
    speed: 35.5,
    heading: 180.0,
    next_stop_id: '3',
    estimated_arrival: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    status: 'on-time',
    recorded_at: new Date().toISOString(),
  },
  {
    id: '2',
    bus_id: '2',
    latitude: 17.4851,
    longitude: 78.3912,
    speed: 28.2,
    heading: 90.0,
    next_stop_id: '10',
    estimated_arrival: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
    status: 'delayed',
    recorded_at: new Date().toISOString(),
  },
  {
    id: '3',
    bus_id: '3',
    latitude: 17.4847,
    longitude: 78.4138,
    speed: 42.1,
    heading: 45.0,
    next_stop_id: '3',
    estimated_arrival: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    status: 'early',
    recorded_at: new Date().toISOString(),
  },
  {
    id: '4',
    bus_id: '4',
    latitude: 17.3969,
    longitude: 78.4378,
    speed: 31.8,
    heading: 270.0,
    estimated_arrival: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
    status: 'on-time',
    recorded_at: new Date().toISOString(),
  },
  {
    id: '5',
    bus_id: '5',
    latitude: 17.4504,
    longitude: 78.3808,
    speed: 25.4,
    heading: 120.0,
    estimated_arrival: new Date(Date.now() + 6 * 60 * 1000).toISOString(),
    status: 'on-time',
    recorded_at: new Date().toISOString(),
  },
];

// Mock Drivers
export const mockDrivers: Driver[] = [
  {
    id: '1',
    employee_id: 'DRV001',
    full_name: 'Rajesh Kumar',
    phone_number: '+91 9876543210',
    license_number: 'TS1234567890',
    is_verified: true,
    is_active: true,
  },
  {
    id: '2',
    employee_id: 'DRV002',
    full_name: 'Suresh Reddy',
    phone_number: '+91 9876543211',
    license_number: 'TS1234567891',
    is_verified: true,
    is_active: true,
  },
];

// Mock Passengers
export const mockPassengers: Passenger[] = [
  {
    id: '1',
    full_name: 'John Doe',
    phone_number: '+91 9876543212',
    preferred_language: 'en',
    email: 'john.doe@example.com',
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    phone_number: '+91 9876543213',
    preferred_language: 'en',
    email: 'jane.smith@example.com',
  },
];