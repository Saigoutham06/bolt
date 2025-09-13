/*
  # Seed Sample Data for BusWhere+

  1. Sample Data
    - Insert sample routes
    - Insert sample bus stops
    - Connect routes with stops
    - Insert sample buses and drivers
    - Insert sample real-time location data

  2. Test Data
    - Realistic route information for Hyderabad/Indian cities
    - Sample bus stops with coordinates
    - Active buses with current locations
*/

-- Insert sample routes
INSERT INTO routes (route_number, route_name, start_location, end_location, total_stops, estimated_duration, is_active) VALUES
('45A', 'Secunderabad to Gachibowli', 'Secunderabad Railway Station', 'Gachibowli DLF', 25, 90, true),
('12B', 'KPHB to Ameerpet', 'KPHB Colony', 'Ameerpet Metro Station', 18, 45, true),
('78C', 'Kukatpally to Begumpet', 'Kukatpally Housing Board', 'Begumpet Airport', 22, 60, true),
('156', 'Mehdipatnam to Uppal', 'Mehdipatnam Bus Station', 'Uppal Depot', 30, 75, true),
('290U', 'JBS to Hitec City', 'Jubilee Bus Station', 'Hitec City', 28, 85, true);

-- Insert sample bus stops
INSERT INTO bus_stops (stop_name, stop_code, latitude, longitude, address, is_active) VALUES
('Secunderabad Railway Station', 'SEC001', 17.4399, 78.5017, 'Secunderabad Railway Station, Hyderabad', true),
('Paradise Circle', 'PAR002', 17.4326, 78.4926, 'Paradise Circle, Secunderabad', true),
('Ameerpet Metro', 'AME003', 17.4374, 78.4482, 'Ameerpet Metro Station, Hyderabad', true),
('Punjagutta', 'PUN004', 17.4239, 78.4738, 'Punjagutta, Hyderabad', true),
('Banjara Hills', 'BAN005', 17.4126, 78.4071, 'Banjara Hills, Hyderabad', true),
('Jubilee Hills', 'JUB006', 17.4239, 78.4004, 'Jubilee Hills, Hyderabad', true),
('Madhapur', 'MAD007', 17.4483, 78.3915, 'Madhapur, Hyderabad', true),
('Gachibowli DLF', 'GAC008', 17.4435, 78.3479, 'Gachibowli DLF Cyber City', true),
('KPHB Colony', 'KPH009', 17.4851, 78.3912, 'KPHB Colony, Hyderabad', true),
('Kukatpally', 'KUK010', 17.4847, 78.4138, 'Kukatpally Housing Board', true),
('Begumpet Airport', 'BEG011', 17.4532, 78.4713, 'Begumpet Airport, Hyderabad', true),
('Mehdipatnam', 'MEH012', 17.3969, 78.4378, 'Mehdipatnam Bus Station', true),
('Uppal Depot', 'UPP013', 17.4067, 78.5591, 'Uppal Bus Depot', true),
('Hitec City', 'HIT014', 17.4504, 78.3808, 'Hitec City, Hyderabad', true),
('JBS', 'JBS015', 17.3850, 78.4867, 'Jubilee Bus Station', true);

-- Connect routes with stops (Route 45A: Secunderabad to Gachibowli)
INSERT INTO route_stops (route_id, stop_id, stop_sequence, estimated_travel_time) VALUES
((SELECT id FROM routes WHERE route_number = '45A'), (SELECT id FROM bus_stops WHERE stop_code = 'SEC001'), 1, 0),
((SELECT id FROM routes WHERE route_number = '45A'), (SELECT id FROM bus_stops WHERE stop_code = 'PAR002'), 2, 8),
((SELECT id FROM routes WHERE route_number = '45A'), (SELECT id FROM bus_stops WHERE stop_code = 'AME003'), 3, 15),
((SELECT id FROM routes WHERE route_number = '45A'), (SELECT id FROM bus_stops WHERE stop_code = 'PUN004'), 4, 12),
((SELECT id FROM routes WHERE route_number = '45A'), (SELECT id FROM bus_stops WHERE stop_code = 'BAN005'), 5, 18),
((SELECT id FROM routes WHERE route_number = '45A'), (SELECT id FROM bus_stops WHERE stop_code = 'JUB006'), 6, 10),
((SELECT id FROM routes WHERE route_number = '45A'), (SELECT id FROM bus_stops WHERE stop_code = 'MAD007'), 7, 15),
((SELECT id FROM routes WHERE route_number = '45A'), (SELECT id FROM bus_stops WHERE stop_code = 'GAC008'), 8, 12);

-- Connect Route 12B: KPHB to Ameerpet
INSERT INTO route_stops (route_id, stop_id, stop_sequence, estimated_travel_time) VALUES
((SELECT id FROM routes WHERE route_number = '12B'), (SELECT id FROM bus_stops WHERE stop_code = 'KPH009'), 1, 0),
((SELECT id FROM routes WHERE route_number = '12B'), (SELECT id FROM bus_stops WHERE stop_code = 'KUK010'), 2, 10),
((SELECT id FROM routes WHERE route_number = '12B'), (SELECT id FROM bus_stops WHERE stop_code = 'AME003'), 3, 35);

-- Connect Route 78C: Kukatpally to Begumpet
INSERT INTO route_stops (route_id, stop_id, stop_sequence, estimated_travel_time) VALUES
((SELECT id FROM routes WHERE route_number = '78C'), (SELECT id FROM bus_stops WHERE stop_code = 'KUK010'), 1, 0),
((SELECT id FROM routes WHERE route_number = '78C'), (SELECT id FROM bus_stops WHERE stop_code = 'AME003'), 2, 25),
((SELECT id FROM routes WHERE route_number = '78C'), (SELECT id FROM bus_stops WHERE stop_code = 'BEG011'), 3, 35);

-- Insert sample drivers (these will need to be created through auth first)
-- Note: In a real application, these would be created through the authentication system
-- For demo purposes, we'll create placeholder UUIDs

-- Insert sample buses
INSERT INTO buses (bus_number, route_id, capacity, current_passengers, is_active) VALUES
('TS09AB1234', (SELECT id FROM routes WHERE route_number = '45A'), 45, 23, true),
('TS09CD5678', (SELECT id FROM routes WHERE route_number = '12B'), 40, 18, true),
('TS09EF9012', (SELECT id FROM routes WHERE route_number = '78C'), 50, 31, true),
('TS09GH3456', (SELECT id FROM routes WHERE route_number = '156'), 45, 12, true),
('TS09IJ7890', (SELECT id FROM routes WHERE route_number = '290U'), 50, 28, true);

-- Insert sample real-time bus locations
INSERT INTO bus_locations (bus_id, latitude, longitude, speed, heading, next_stop_id, estimated_arrival, status) VALUES
(
  (SELECT id FROM buses WHERE bus_number = 'TS09AB1234'),
  17.4326, 78.4926, 35.5, 180.0,
  (SELECT id FROM bus_stops WHERE stop_code = 'AME003'),
  now() + interval '5 minutes',
  'on-time'
),
(
  (SELECT id FROM buses WHERE bus_number = 'TS09CD5678'),
  17.4851, 78.3912, 28.2, 90.0,
  (SELECT id FROM bus_stops WHERE stop_code = 'KUK010'),
  now() + interval '12 minutes',
  'delayed'
),
(
  (SELECT id FROM buses WHERE bus_number = 'TS09EF9012'),
  17.4847, 78.4138, 42.1, 45.0,
  (SELECT id FROM bus_stops WHERE stop_code = 'AME003'),
  now() + interval '3 minutes',
  'early'
),
(
  (SELECT id FROM buses WHERE bus_number = 'TS09GH3456'),
  17.3969, 78.4378, 31.8, 270.0,
  (SELECT id FROM bus_stops WHERE stop_code = 'UPP013'),
  now() + interval '8 minutes',
  'on-time'
),
(
  (SELECT id FROM buses WHERE bus_number = 'TS09IJ7890'),
  17.4504, 78.3808, 25.4, 120.0,
  (SELECT id FROM bus_stops WHERE stop_code = 'HIT014'),
  now() + interval '6 minutes',
  'on-time'
);

-- Insert sample trip schedules for today
INSERT INTO trip_schedules (route_id, bus_id, scheduled_start_time, scheduled_end_time, trip_date, status) VALUES
(
  (SELECT id FROM routes WHERE route_number = '45A'),
  (SELECT id FROM buses WHERE bus_number = 'TS09AB1234'),
  '06:00:00', '07:30:00', CURRENT_DATE, 'completed'
),
(
  (SELECT id FROM routes WHERE route_number = '45A'),
  (SELECT id FROM buses WHERE bus_number = 'TS09AB1234'),
  '08:00:00', '09:30:00', CURRENT_DATE, 'in-progress'
),
(
  (SELECT id FROM routes WHERE route_number = '12B'),
  (SELECT id FROM buses WHERE bus_number = 'TS09CD5678'),
  '07:30:00', '08:15:00', CURRENT_DATE, 'in-progress'
),
(
  (SELECT id FROM routes WHERE route_number = '78C'),
  (SELECT id FROM buses WHERE bus_number = 'TS09EF9012'),
  '09:00:00', '10:00:00', CURRENT_DATE, 'in-progress'
);