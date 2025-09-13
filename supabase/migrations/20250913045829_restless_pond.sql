/*
  # Initial BusWhere+ Database Schema

  1. New Tables
    - `routes` - Bus route information
      - `id` (uuid, primary key)
      - `route_number` (text, unique)
      - `route_name` (text)
      - `start_location` (text)
      - `end_location` (text)
      - `total_stops` (integer)
      - `estimated_duration` (integer in minutes)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `bus_stops` - Bus stop information
      - `id` (uuid, primary key)
      - `stop_name` (text)
      - `stop_code` (text, unique)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `address` (text)
      - `amenities` (jsonb)
      - `is_active` (boolean)
      - `created_at` (timestamp)

    - `route_stops` - Junction table for routes and stops
      - `id` (uuid, primary key)
      - `route_id` (uuid, foreign key)
      - `stop_id` (uuid, foreign key)
      - `stop_sequence` (integer)
      - `estimated_travel_time` (integer in minutes)

    - `buses` - Bus vehicle information
      - `id` (uuid, primary key)
      - `bus_number` (text, unique)
      - `route_id` (uuid, foreign key)
      - `driver_id` (uuid, foreign key)
      - `capacity` (integer)
      - `current_passengers` (integer, default 0)
      - `is_active` (boolean, default true)
      - `last_maintenance` (date)
      - `created_at` (timestamp)

    - `drivers` - Driver information
      - `id` (uuid, primary key, references auth.users)
      - `employee_id` (text, unique)
      - `full_name` (text)
      - `phone_number` (text)
      - `license_number` (text)
      - `is_verified` (boolean, default false)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)

    - `passengers` - Passenger profiles
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `phone_number` (text)
      - `preferred_language` (text, default 'en')
      - `notification_preferences` (jsonb)
      - `created_at` (timestamp)

    - `bus_locations` - Real-time bus location tracking
      - `id` (uuid, primary key)
      - `bus_id` (uuid, foreign key)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `speed` (decimal)
      - `heading` (decimal)
      - `next_stop_id` (uuid, foreign key)
      - `estimated_arrival` (timestamp)
      - `status` (text) -- 'on-time', 'delayed', 'early', 'breakdown'
      - `recorded_at` (timestamp, default now())

    - `trip_schedules` - Scheduled trips
      - `id` (uuid, primary key)
      - `route_id` (uuid, foreign key)
      - `bus_id` (uuid, foreign key)
      - `scheduled_start_time` (time)
      - `scheduled_end_time` (time)
      - `actual_start_time` (timestamp)
      - `actual_end_time` (timestamp)
      - `trip_date` (date)
      - `status` (text) -- 'scheduled', 'in-progress', 'completed', 'cancelled'

    - `passenger_tracking` - Passenger journey tracking
      - `id` (uuid, primary key)
      - `passenger_id` (uuid, foreign key)
      - `bus_id` (uuid, foreign key)
      - `boarding_stop_id` (uuid, foreign key)
      - `destination_stop_id` (uuid, foreign key)
      - `boarding_time` (timestamp)
      - `alighting_time` (timestamp)
      - `fare_paid` (decimal)
      - `payment_method` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Separate policies for drivers and passengers
    - Public read access for routes and stops
    - Real-time subscriptions for location updates

  3. Indexes
    - Performance indexes on frequently queried columns
    - Spatial indexes for location-based queries
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_number text UNIQUE NOT NULL,
  route_name text NOT NULL,
  start_location text NOT NULL,
  end_location text NOT NULL,
  total_stops integer DEFAULT 0,
  estimated_duration integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bus stops table
CREATE TABLE IF NOT EXISTS bus_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_name text NOT NULL,
  stop_code text UNIQUE NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  address text,
  amenities jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Route stops junction table
CREATE TABLE IF NOT EXISTS route_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE,
  stop_id uuid REFERENCES bus_stops(id) ON DELETE CASCADE,
  stop_sequence integer NOT NULL,
  estimated_travel_time integer DEFAULT 0,
  UNIQUE(route_id, stop_sequence),
  UNIQUE(route_id, stop_id)
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone_number text,
  license_number text,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Buses table
CREATE TABLE IF NOT EXISTS buses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_number text UNIQUE NOT NULL,
  route_id uuid REFERENCES routes(id),
  driver_id uuid REFERENCES drivers(id),
  capacity integer DEFAULT 50,
  current_passengers integer DEFAULT 0,
  is_active boolean DEFAULT true,
  last_maintenance date,
  created_at timestamptz DEFAULT now()
);

-- Passengers table
CREATE TABLE IF NOT EXISTS passengers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone_number text,
  preferred_language text DEFAULT 'en',
  notification_preferences jsonb DEFAULT '{"push": true, "sms": false, "email": true}',
  created_at timestamptz DEFAULT now()
);

-- Bus locations table for real-time tracking
CREATE TABLE IF NOT EXISTS bus_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id uuid REFERENCES buses(id) ON DELETE CASCADE,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  speed decimal(5, 2) DEFAULT 0,
  heading decimal(5, 2) DEFAULT 0,
  next_stop_id uuid REFERENCES bus_stops(id),
  estimated_arrival timestamptz,
  status text DEFAULT 'on-time' CHECK (status IN ('on-time', 'delayed', 'early', 'breakdown')),
  recorded_at timestamptz DEFAULT now()
);

-- Trip schedules table
CREATE TABLE IF NOT EXISTS trip_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE,
  bus_id uuid REFERENCES buses(id) ON DELETE CASCADE,
  scheduled_start_time time NOT NULL,
  scheduled_end_time time NOT NULL,
  actual_start_time timestamptz,
  actual_end_time timestamptz,
  trip_date date NOT NULL DEFAULT CURRENT_DATE,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled'))
);

-- Passenger tracking table
CREATE TABLE IF NOT EXISTS passenger_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id uuid REFERENCES passengers(id) ON DELETE CASCADE,
  bus_id uuid REFERENCES buses(id) ON DELETE CASCADE,
  boarding_stop_id uuid REFERENCES bus_stops(id),
  destination_stop_id uuid REFERENCES bus_stops(id),
  boarding_time timestamptz,
  alighting_time timestamptz,
  fare_paid decimal(10, 2),
  payment_method text DEFAULT 'cash'
);

-- Enable Row Level Security
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE passenger_tracking ENABLE ROW LEVEL SECURITY;

-- Public read access for routes and stops (needed for search functionality)
CREATE POLICY "Public can read routes" ON routes FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public can read bus stops" ON bus_stops FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public can read route stops" ON route_stops FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read bus locations" ON bus_locations FOR SELECT TO anon, authenticated USING (true);

-- Driver policies
CREATE POLICY "Drivers can read their own data" ON drivers FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Drivers can update their own data" ON drivers FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Bus policies
CREATE POLICY "Authenticated users can read buses" ON buses FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Drivers can update their assigned bus" ON buses FOR UPDATE TO authenticated USING (
  driver_id = auth.uid() AND is_active = true
);

-- Passenger policies
CREATE POLICY "Passengers can read their own data" ON passengers FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Passengers can update their own data" ON passengers FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Passengers can insert their own data" ON passengers FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Trip schedules policies
CREATE POLICY "Authenticated users can read trip schedules" ON trip_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Drivers can update their trip schedules" ON trip_schedules FOR UPDATE TO authenticated USING (
  bus_id IN (SELECT id FROM buses WHERE driver_id = auth.uid())
);

-- Passenger tracking policies
CREATE POLICY "Passengers can read their own tracking data" ON passenger_tracking FOR SELECT TO authenticated USING (passenger_id = auth.uid());
CREATE POLICY "Passengers can insert their own tracking data" ON passenger_tracking FOR INSERT TO authenticated WITH CHECK (passenger_id = auth.uid());

-- Bus location policies (drivers can insert/update, everyone can read)
CREATE POLICY "Drivers can insert bus locations" ON bus_locations FOR INSERT TO authenticated WITH CHECK (
  bus_id IN (SELECT id FROM buses WHERE driver_id = auth.uid())
);
CREATE POLICY "Drivers can update bus locations" ON bus_locations FOR UPDATE TO authenticated USING (
  bus_id IN (SELECT id FROM buses WHERE driver_id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_routes_active ON routes(is_active);
CREATE INDEX IF NOT EXISTS idx_routes_number ON routes(route_number);
CREATE INDEX IF NOT EXISTS idx_bus_stops_active ON bus_stops(is_active);
CREATE INDEX IF NOT EXISTS idx_bus_stops_code ON bus_stops(stop_code);
CREATE INDEX IF NOT EXISTS idx_bus_stops_location ON bus_stops USING GIST (ST_Point(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_sequence ON route_stops(route_id, stop_sequence);
CREATE INDEX IF NOT EXISTS idx_buses_route ON buses(route_id);
CREATE INDEX IF NOT EXISTS idx_buses_driver ON buses(driver_id);
CREATE INDEX IF NOT EXISTS idx_buses_active ON buses(is_active);
CREATE INDEX IF NOT EXISTS idx_bus_locations_bus ON bus_locations(bus_id);
CREATE INDEX IF NOT EXISTS idx_bus_locations_time ON bus_locations(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_bus_locations_location ON bus_locations USING GIST (ST_Point(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_trip_schedules_date ON trip_schedules(trip_date);
CREATE INDEX IF NOT EXISTS idx_trip_schedules_route ON trip_schedules(route_id);
CREATE INDEX IF NOT EXISTS idx_passenger_tracking_passenger ON passenger_tracking(passenger_id);
CREATE INDEX IF NOT EXISTS idx_passenger_tracking_bus ON passenger_tracking(bus_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to routes table
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();