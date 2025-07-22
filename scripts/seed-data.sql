INSERT INTO airlines (name, code, country) VALUES
('American Airlines', 'AA', 'United States'),
('Delta Airlines', 'DL', 'United States'),
('United Airlines', 'UA', 'United States'),
('British Airways', 'BA', 'United Kingdom'),
('Lufthansa', 'LH', 'Germany'),
('Emirates', 'EK', 'United Arab Emirates'),
('Qatar Airways', 'QR', 'Qatar'),
('Singapore Airlines', 'SQ', 'Singapore'),
('Air France', 'AF', 'France'),
('KLM', 'KL', 'Netherlands');

INSERT INTO airports (code, name, city, country, timezone) VALUES
('JFK', 'John F. Kennedy International Airport', 'New York', 'United States', 'America/New_York'),
('LGA', 'LaGuardia Airport', 'New York', 'United States', 'America/New_York'),
('EWR', 'Newark Liberty International Airport', 'Newark', 'United States', 'America/New_York'),
('LHR', 'Heathrow Airport', 'London', 'United Kingdom', 'Europe/London'),
('LGW', 'Gatwick Airport', 'London', 'United Kingdom', 'Europe/London'),
('CDG', 'Charles de Gaulle Airport', 'Paris', 'France', 'Europe/Paris'),
('ORY', 'Orly Airport', 'Paris', 'France', 'Europe/Paris'),
('FRA', 'Frankfurt Airport', 'Frankfurt', 'Germany', 'Europe/Berlin'),
('AMS', 'Amsterdam Airport Schiphol', 'Amsterdam', 'Netherlands', 'Europe/Amsterdam'),
('DXB', 'Dubai International Airport', 'Dubai', 'United Arab Emirates', 'Asia/Dubai'),
('DOH', 'Hamad International Airport', 'Doha', 'Qatar', 'Asia/Qatar'),
('SIN', 'Singapore Changi Airport', 'Singapore', 'Singapore', 'Asia/Singapore'),
('NRT', 'Narita International Airport', 'Tokyo', 'Japan', 'Asia/Tokyo'),
('HND', 'Haneda Airport', 'Tokyo', 'Japan', 'Asia/Tokyo'),
('LAX', 'Los Angeles International Airport', 'Los Angeles', 'United States', 'America/Los_Angeles'),
('ORD', 'O\'Hare International Airport', 'Chicago', 'United States', 'America/Chicago'),
('MIA', 'Miami International Airport', 'Miami', 'United States', 'America/New_York');

INSERT INTO flights (flight_number, airline_id, departure_airport_id, arrival_airport_id, departure_time, arrival_time, duration, aircraft_type, status) VALUES
('AA1234', 1, 1, 4, '2024-12-25 08:30:00', '2024-12-25 20:45:00', 435, 'Boeing 777-300ER', 'Scheduled'),
('BA2156', 4, 1, 4, '2024-12-25 10:15:00', '2024-12-25 22:30:00', 435, 'Airbus A350-1000', 'Scheduled'),
('DL5678', 2, 1, 4, '2024-12-25 14:45:00', '2024-12-26 03:00:00', 495, 'Boeing 767-400ER', 'Scheduled'),
('UA9876', 3, 1, 4, '2024-12-25 16:20:00', '2024-12-26 04:35:00', 435, 'Boeing 787-9', 'Scheduled'),
('LH4321', 5, 1, 8, '2024-12-25 11:00:00', '2024-12-26 01:15:00', 495, 'Airbus A340-600', 'Scheduled'),
('AF7890', 9, 1, 6, '2024-12-25 13:30:00', '2024-12-26 02:45:00', 435, 'Boeing 777-200ER', 'Scheduled'),
('EK2468', 6, 1, 10, '2024-12-25 15:45:00', '2024-12-26 14:30:00', 825, 'Airbus A380-800', 'Scheduled'),
('QR1357', 7, 1, 11, '2024-12-25 17:10:00', '2024-12-26 16:45:00', 795, 'Boeing 777-300ER', 'Scheduled'),
('SQ9753', 8, 1, 12, '2024-12-25 19:25:00', '2024-12-27 02:40:00', 1095, 'Airbus A350-900ULR', 'Scheduled'),
('AA5432', 1, 15, 1, '2024-12-26 09:15:00', '2024-12-26 17:30:00', 315, 'Boeing 737-800', 'Scheduled');

INSERT INTO flight_classes (flight_id, class_type, price, available_seats, total_seats) VALUES
(1, 'Economy', 899.00, 180, 200),
(1, 'Business', 2899.00, 28, 30),
(1, 'First', 5899.00, 8, 10),
(2, 'Economy', 1099.00, 220, 250),
(2, 'Business', 3299.00, 35, 40),
(2, 'First', 6599.00, 10, 12),
(3, 'Economy', 759.00, 160, 180),
(3, 'Business', 2259.00, 25, 30),
(4, 'Economy', 949.00, 190, 210),
(4, 'Business', 2849.00, 32, 35),
(5, 'Economy', 1199.00, 200, 220),
(5, 'Business', 3599.00, 38, 42),
(6, 'Economy', 1049.00, 170, 190),
(6, 'Business', 3149.00, 30, 35),
(7, 'Economy', 1899.00, 350, 380),
(7, 'Business', 5699.00, 65, 70),
(7, 'First', 11399.00, 12, 14),
(8, 'Economy', 1799.00, 280, 300),
(8, 'Business', 5399.00, 55, 60),
(8, 'First', 10799.00, 10, 12),
(9, 'Economy', 2299.00, 220, 240),
(9, 'Business', 6899.00, 40, 45),
(9, 'First', 13799.00, 8, 10),
(10, 'Economy', 459.00, 140, 160),
(10, 'Business', 1379.00, 18, 20);

INSERT INTO passengers (first_name, last_name, email, phone, passport_number, nationality, date_of_birth) VALUES
('John', 'Doe', 'john.doe@email.com', '+1-555-0123', 'US123456789', 'American', '1985-03-15'),
('Jane', 'Smith', 'jane.smith@email.com', '+1-555-0124', 'US987654321', 'American', '1990-07-22'),
('Michael', 'Johnson', 'michael.j@email.com', '+44-20-7946-0958', 'GB456789123', 'British', '1982-11-08'),
('Emily', 'Brown', 'emily.brown@email.com', '+1-555-0125', 'US555666777', 'American', '1988-05-30'),
('David', 'Wilson', 'david.wilson@email.com', '+49-30-12345678', 'DE789123456', 'German', '1975-09-12');

INSERT INTO bookings (booking_reference, passenger_id, flight_id, class_id, booking_status, total_price, payment_status) VALUES
('BK12345678', 1, 1, 1, 'Confirmed', 899.00, 'Completed'),
('BK23456789', 2, 2, 4, 'Confirmed', 1099.00, 'Completed'),
('BK34567890', 3, 3, 7, 'Confirmed', 759.00, 'Completed'),
('BK45678901', 4, 4, 9, 'Pending', 949.00, 'Pending'),
('BK56789012', 5, 5, 11, 'Confirmed', 1199.00, 'Completed');

INSERT INTO chat_sessions (session_id, user_id) VALUES
('sess_001', 'user_001'),
('sess_002', 'user_002'),
('sess_003', 'user_003');

INSERT INTO chat_messages (session_id, message_type, message_text, intent) VALUES
('sess_001', 'user', 'I want to book a flight from New York to London', 'flight_search'),
('sess_001', 'bot', 'I can help you find flights from New York to London. What date would you like to travel?', 'request_date'),
('sess_001', 'user', 'December 25th', 'provide_date'),
('sess_001', 'bot', 'Great! Here are available flights for December 25th from New York to London.', 'show_results'),
('sess_002', 'user', 'What is the status of flight AA1234?', 'flight_status'),
('sess_002', 'bot', 'Flight AA1234 is currently on time and scheduled to depart at 8:30 AM.', 'status_info');

INSERT INTO user_preferences (user_id, preferred_class, preferred_airlines, max_stops, preferred_departure_time, language, currency) VALUES
('user_001', 'Economy', '["American Airlines", "Delta Airlines"]', 1, '09:00:00', 'en', 'USD'),
('user_002', 'Business', '["British Airways", "Lufthansa"]', 0, '10:00:00', 'en', 'USD'),
('user_003', 'Economy', '["Emirates", "Qatar Airways"]', 2, '14:00:00', 'en', 'USD');
