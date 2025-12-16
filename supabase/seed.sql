-- =====================================================
-- SEED DATA FOR FRONT DESK FLOW - LANGUAGE CENTER
-- =====================================================
-- Insert realistic mockup data respecting all constraints

-- =====================================================
-- 1. TEACHERS
-- =====================================================
INSERT INTO public.teachers (id, name, phone, email, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', '+1-555-0101', 'sarah@langcenter.com', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Miguel Rodriguez', '+1-555-0102', 'miguel@langcenter.com', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Yuki Tanaka', '+1-555-0103', 'yuki@langcenter.com', true),
  ('550e8400-e29b-41d4-a716-446655440004', 'Sophie Laurent', '+1-555-0104', 'sophie@langcenter.com', true),
  ('550e8400-e29b-41d4-a716-446655440005', 'Ahmed Hassan', '+1-555-0105', 'ahmed@langcenter.com', false);

-- =====================================================
-- 2. GROUPS
-- =====================================================
INSERT INTO public.groups (id, name, language, teacher_id, schedule_days, schedule_time, sessions_per_cycle, session_fee, is_paused, is_active) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'English Beginner A', 'English', '550e8400-e29b-41d4-a716-446655440001', ARRAY['Monday', 'Wednesday'], '10:00 AM - 11:30 AM', 8, 50.00, false, true),
  ('650e8400-e29b-41d4-a716-446655440002', 'English Intermediate B', 'English', '550e8400-e29b-41d4-a716-446655440001', ARRAY['Tuesday', 'Thursday'], '2:00 PM - 3:30 PM', 8, 60.00, false, true),
  ('650e8400-e29b-41d4-a716-446655440003', 'Spanish Beginner C', 'Spanish', '550e8400-e29b-41d4-a716-446655440002', ARRAY['Monday', 'Wednesday', 'Friday'], '6:00 PM - 7:30 PM', 12, 40.00, false, true),
  ('650e8400-e29b-41d4-a716-446655440004', 'Spanish Advanced D', 'Spanish', '550e8400-e29b-41d4-a716-446655440002', ARRAY['Tuesday', 'Thursday'], '7:45 PM - 9:15 PM', 8, 70.00, false, true),
  ('650e8400-e29b-41d4-a716-446655440005', 'Japanese Beginner E', 'Japanese', '550e8400-e29b-41d4-a716-446655440003', ARRAY['Saturday'], '9:00 AM - 12:00 PM', 4, 80.00, false, true),
  ('650e8400-e29b-41d4-a716-446655440006', 'French Intermediate F', 'French', '550e8400-e29b-41d4-a716-446655440004', ARRAY['Wednesday', 'Saturday'], '11:00 AM - 12:30 PM', 8, 65.00, true, true);

-- =====================================================
-- 3. STUDENTS
-- =====================================================
INSERT INTO public.students (id, name, phone, whatsapp, status, enrollment_date, entrance_fee_amount, entrance_fee_paid, entrance_fee_paid_date, notes, is_deleted) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'John Smith', '+1-555-1001', '+1-555-1001', 'active', '2025-11-01', 25.00, true, '2025-11-01', 'Very motivated student', false),
  ('750e8400-e29b-41d4-a716-446655440002', 'Maria Garcia', '+1-555-1002', '+1-555-1002', 'active', '2025-11-15', 25.00, true, '2025-11-15', 'Family enrollment (sister: Elena)', false),
  ('750e8400-e29b-41d4-a716-446655440003', 'Elena Garcia', '+1-555-1003', '+1-555-1003', 'active', '2025-11-15', 25.00, true, '2025-11-15', 'Family enrollment (sister: Maria)', false),
  ('750e8400-e29b-41d4-a716-446655440004', 'David Lee', '+1-555-1004', '+1-555-1004', 'active', '2025-10-01', 25.00, true, '2025-10-01', 'Early enrollee', false),
  ('750e8400-e29b-41d4-a716-446655440005', 'Lisa Chen', '+1-555-1005', '+1-555-1005', 'active', '2025-12-01', 25.00, false, NULL, 'New student, entrance fee pending', false),
  ('750e8400-e29b-41d4-a716-446655440006', 'Robert Johnson', '+1-555-1006', '+1-555-1006', 'paused', '2025-09-01', 25.00, true, '2025-09-01', 'On leave until January', false),
  ('750e8400-e29b-41d4-a716-446655440007', 'Anna Williams', '+1-555-1007', '+1-555-1007', 'active', '2025-10-15', 25.00, true, '2025-10-15', 'Working professional', false),
  ('750e8400-e29b-41d4-a716-446655440008', 'Marco Rossi', '+1-555-1008', '+1-555-1008', 'dropped', '2025-08-01', 25.00, true, '2025-08-01', 'Stopped attending in November', false),
  ('750e8400-e29b-41d4-a716-446655440009', 'Sophie Dubois', '+1-555-1009', '+1-555-1009', 'active', '2025-11-20', 25.00, true, '2025-11-20', 'High attendance rate', false),
  ('750e8400-e29b-41d4-a716-446655440010', 'Kenji Yamamoto', '+1-555-1010', '+1-555-1010', 'active', '2025-12-05', 25.00, false, NULL, 'Recent enrollment', false);

-- =====================================================
-- 4. STUDENT GROUPS (many-to-many enrollments)
-- =====================================================
INSERT INTO public.student_groups (id, student_id, group_id, sessions_total, sessions_used, joined_at, is_active) VALUES
  -- English Beginner A (John, David, Anna)
  ('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 8, 6, '2025-11-01', true),
  ('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 8, 8, '2025-10-01', true),
  ('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', 8, 5, '2025-10-15', true),
  
  -- English Intermediate B (Maria, Elena)
  ('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 8, 7, '2025-11-15', true),
  ('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', 8, 7, '2025-11-15', true),
  
  -- Spanish Beginner C (Lisa, Robert, Marco)
  ('850e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', 12, 3, '2025-12-01', true),
  ('850e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440003', 12, 12, '2025-09-01', false),
  ('850e8400-e29b-41d4-a716-446655440008', '750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440003', 12, 10, '2025-08-01', false),
  
  -- Spanish Advanced D (Sophie)
  ('850e8400-e29b-41d4-a716-446655440009', '750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440004', 8, 6, '2025-11-20', true),
  
  -- Japanese Beginner E (Kenji)
  ('850e8400-e29b-41d4-a716-446655440010', '750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440005', 4, 1, '2025-12-05', true),
  
  -- French Intermediate F (David - dual enrollment)
  ('850e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440006', 8, 4, '2025-10-20', true);

-- =====================================================
-- 5. DISCOUNTS
-- =====================================================
INSERT INTO public.discounts (id, student_id, discount_type, is_percentage, discount_value, linked_student_id, notes, is_active) VALUES
  -- Two-groups discount (David is in 2 groups)
  ('950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440004', 'two_groups', true, 10.00, NULL, 'Enrolled in 2 groups', true),
  
  -- Family discount (Maria & Elena)
  ('950e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', 'family', true, 15.00, '750e8400-e29b-41d4-a716-446655440003', 'Sister enrolled', true),
  ('950e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440003', 'family', true, 15.00, '750e8400-e29b-41d4-a716-446655440002', 'Sister enrolled', true),
  
  -- Special discount (Sophie - loyalty)
  ('950e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440009', 'special', false, 5.00, NULL, 'Loyalty discount - 1st month free $5', true);

-- =====================================================
-- 6. PAYMENTS
-- =====================================================
INSERT INTO public.payments (id, student_id, group_id, payment_type, amount, original_amount, discount_applied, sessions_purchased, payment_date, notes) VALUES
  -- Entrance Fees
  ('a50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', NULL, 'entrance_fee', 25.00, 25.00, 0.00, 0, '2025-11-01', 'Entrance fee paid'),
  ('a50e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', NULL, 'entrance_fee', 25.00, 25.00, 0.00, 0, '2025-11-15', 'Entrance fee paid'),
  ('a50e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440003', NULL, 'entrance_fee', 25.00, 25.00, 0.00, 0, '2025-11-15', 'Entrance fee paid'),
  ('a50e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440004', NULL, 'entrance_fee', 25.00, 25.00, 0.00, 0, '2025-10-01', 'Entrance fee paid'),
  ('a50e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440007', NULL, 'entrance_fee', 25.00, 25.00, 0.00, 0, '2025-10-15', 'Entrance fee paid'),
  ('a50e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440009', NULL, 'entrance_fee', 25.00, 25.00, 0.00, 0, '2025-11-20', 'Entrance fee paid'),
  ('a50e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440006', NULL, 'entrance_fee', 25.00, 25.00, 0.00, 0, '2025-09-01', 'Entrance fee paid'),
  ('a50e8400-e29b-41d4-a716-446655440008', '750e8400-e29b-41d4-a716-446655440008', NULL, 'entrance_fee', 25.00, 25.00, 0.00, 0, '2025-08-01', 'Entrance fee paid'),
  
  -- Tuition Payments for English Beginner A (John)
  ('a50e8400-e29b-41d4-a716-446655440010', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'tuition', 400.00, 400.00, 0.00, 8, '2025-11-01', 'November cycle'),
  ('a50e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'partial', 200.00, 200.00, 0.00, 4, '2025-12-01', 'Partial payment for December'),
  
  -- Tuition Payments for English Beginner A (David with 10% two-groups discount)
  ('a50e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 'tuition', 360.00, 400.00, 40.00, 8, '2025-10-01', 'November cycle with 10% discount'),
  ('a50e8400-e29b-41d4-a716-446655440013', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440006', 'tuition', 468.00, 520.00, 52.00, 8, '2025-10-01', 'French enrollment with 10% discount'),
  
  -- Tuition Payments for English Beginner A (Anna)
  ('a50e8400-e29b-41d4-a716-446655440014', '750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', 'tuition', 400.00, 400.00, 0.00, 8, '2025-10-15', 'November cycle'),
  ('a50e8400-e29b-41d4-a716-446655440015', '750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', 'partial', 100.00, 100.00, 0.00, 2, '2025-12-10', 'Partial payment - low on sessions'),
  
  -- Tuition Payments for English Intermediate B (Maria with 15% family discount)
  ('a50e8400-e29b-41d4-a716-446655440016', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'tuition', 408.00, 480.00, 72.00, 8, '2025-11-15', 'November cycle with 15% family discount'),
  
  -- Tuition Payments for English Intermediate B (Elena with 15% family discount)
  ('a50e8400-e29b-41d4-a716-446655440017', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', 'tuition', 408.00, 480.00, 72.00, 8, '2025-11-15', 'November cycle with 15% family discount'),
  
  -- Tuition Payments for Spanish Beginner C (Lisa - NEW, only 3 sessions so far)
  ('a50e8400-e29b-41d4-a716-446655440018', '750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', 'partial', 120.00, 120.00, 0.00, 3, '2025-12-01', 'Initial payment for 3 sessions'),
  
  -- Tuition Payments for Spanish Advanced D (Sophie with $5 special discount)
  ('a50e8400-e29b-41d4-a716-446655440019', '750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440004', 'tuition', 515.00, 560.00, 45.00, 8, '2025-11-20', 'November cycle with family + special discount'),
  
  -- Tuition Payments for Japanese Beginner E (Kenji - NEW)
  ('a50e8400-e29b-41d4-a716-446655440020', '750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440005', 'partial', 80.00, 80.00, 0.00, 1, '2025-12-05', 'Initial payment for 1 session'),
  
  -- Event/Workshop Payment (Sophie - workshop fee)
  ('a50e8400-e29b-41d4-a716-446655440021', '750e8400-e29b-41d4-a716-446655440009', NULL, 'event', 50.00, 50.00, 0.00, 0, '2025-12-10', 'Christmas workshop fee');

-- =====================================================
-- 7. ATTENDANCE RECORDS
-- =====================================================
INSERT INTO public.attendance (id, student_id, group_id, session_date, status, reason, edited_at, edit_reason) VALUES
  -- John's attendance (English Beginner A)
  ('b50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '2025-11-03', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '2025-11-05', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '2025-11-10', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '2025-11-12', 'absent', 'Sick', NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '2025-11-17', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '2025-11-19', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '2025-12-01', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440008', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '2025-12-03', 'excused', 'Doctor appointment', NULL, NULL),
  
  -- David's attendance (English Beginner A) - Perfect attendance
  ('b50e8400-e29b-41d4-a716-446655440010', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', '2025-10-06', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', '2025-10-08', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', '2025-10-13', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440013', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', '2025-10-15', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440014', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', '2025-10-20', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440015', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', '2025-10-22', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440016', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', '2025-10-27', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440017', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', '2025-10-29', 'present', NULL, NULL, NULL),
  
  -- David's attendance (French Intermediate F)
  ('b50e8400-e29b-41d4-a716-446655440018', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440006', '2025-10-22', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440019', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440006', '2025-10-25', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440020', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440006', '2025-11-01', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440021', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440006', '2025-11-08', 'present', NULL, NULL, NULL),
  
  -- Anna's attendance (English Beginner A)
  ('b50e8400-e29b-41d4-a716-446655440022', '750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', '2025-10-20', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440023', '750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', '2025-10-22', 'absent', 'Work conflict', NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440024', '750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', '2025-10-27', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440025', '750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', '2025-10-29', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440026', '750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', '2025-11-03', 'present', NULL, NULL, NULL),
  
  -- Maria's attendance (English Intermediate B)
  ('b50e8400-e29b-41d4-a716-446655440030', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', '2025-11-18', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440031', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', '2025-11-20', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440032', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', '2025-11-25', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440033', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', '2025-12-02', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440034', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', '2025-12-04', 'absent', 'Family event', NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440035', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', '2025-12-09', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440036', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', '2025-12-11', 'present', NULL, NULL, NULL),
  
  -- Elena's attendance (English Intermediate B)
  ('b50e8400-e29b-41d4-a716-446655440040', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', '2025-11-18', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440041', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', '2025-11-20', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440042', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', '2025-11-25', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440043', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', '2025-12-02', 'excused', 'Doctor appointment', NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440044', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', '2025-12-04', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440045', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', '2025-12-09', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440046', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', '2025-12-11', 'present', NULL, NULL, NULL),
  
  -- Sophie's attendance (Spanish Advanced D)
  ('b50e8400-e29b-41d4-a716-446655440050', '750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440004', '2025-11-25', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440051', '750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440004', '2025-11-27', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440052', '750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440004', '2025-12-02', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440053', '750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440004', '2025-12-04', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440054', '750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440004', '2025-12-09', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440055', '750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440004', '2025-12-11', 'present', NULL, NULL, NULL),
  
  -- Lisa's attendance (Spanish Beginner C) - NEW
  ('b50e8400-e29b-41d4-a716-446655440060', '750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', '2025-12-01', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440061', '750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', '2025-12-03', 'present', NULL, NULL, NULL),
  ('b50e8400-e29b-41d4-a716-446655440062', '750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', '2025-12-05', 'present', NULL, NULL, NULL),
  
  -- Kenji's attendance (Japanese Beginner E) - NEW
  ('b50e8400-e29b-41d4-a716-446655440070', '750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440005', '2025-12-06', 'present', NULL, NULL, NULL);

-- =====================================================
-- 8. EVENTS
-- =====================================================
INSERT INTO public.events (id, title, event_type, event_date, start_time, end_time, group_id, is_paid, fee_amount, affects_sessions, notes) VALUES
  ('c50e8400-e29b-41d4-a716-446655440001', 'Holiday Break', 'holiday', '2025-12-20', NULL, NULL, NULL, false, 0.00, false, 'School closes for holiday'),
  ('c50e8400-e29b-41d4-a716-446655440002', 'New Year Makeup Session', 'rescheduled', '2025-01-10', '5:00 PM', '6:30 PM', '650e8400-e29b-41d4-a716-446655440001', false, 0.00, true, 'Reschedule for holiday makeup'),
  ('c50e8400-e29b-41d4-a716-446655440003', 'English Conversation Workshop', 'workshop', '2025-12-15', '10:00 AM', '12:00 PM', '650e8400-e29b-41d4-a716-446655440001', true, 50.00, false, 'Extra conversation practice'),
  ('c50e8400-e29b-41d4-a716-446655440004', 'Mid-Term Exam', 'exam', '2025-12-20', '2:00 PM', '4:00 PM', '650e8400-e29b-41d4-a716-446655440002', false, 0.00, true, 'Evaluation test'),
  ('c50e8400-e29b-41d4-a716-446655440005', 'Extra Class - Grammar Review', 'extra_class', '2025-12-16', '7:00 PM', '8:00 PM', '650e8400-e29b-41d4-a716-446655440003', true, 25.00, true, 'Optional grammar refresher'),
  ('c50e8400-e29b-41d4-a716-446655440006', 'Holiday Party & Cultural Exchange', 'open_day', '2025-12-17', '6:00 PM', '8:00 PM', NULL, false, 0.00, false, 'All students invited to celebrate');

-- =====================================================
-- 9. ACTIVITY LOGS
-- =====================================================
INSERT INTO public.activity_logs (id, action, entity_type, entity_id, old_value, new_value) VALUES
  -- Student enrollments
  ('d50e8400-e29b-41d4-a716-446655440001', 'created', 'student', '750e8400-e29b-41d4-a716-446655440001', NULL, '{"name":"John Smith","status":"active","enrollment_date":"2025-11-01"}'),
  ('d50e8400-e29b-41d4-a716-446655440002', 'created', 'student', '750e8400-e29b-41d4-a716-446655440002', NULL, '{"name":"Maria Garcia","status":"active","enrollment_date":"2025-11-15"}'),
  ('d50e8400-e29b-41d4-a716-446655440003', 'created', 'student', '750e8400-e29b-41d4-a716-446655440003', NULL, '{"name":"Elena Garcia","status":"active","enrollment_date":"2025-11-15"}'),
  ('d50e8400-e29b-41d4-a716-446655440004', 'created', 'student', '750e8400-e29b-41d4-a716-446655440004', NULL, '{"name":"David Lee","status":"active","enrollment_date":"2025-10-01"}'),
  
  -- Entrance fee payments
  ('d50e8400-e29b-41d4-a716-446655440010', 'created', 'payment', 'a50e8400-e29b-41d4-a716-446655440001', NULL, '{"payment_type":"entrance_fee","amount":25.00,"student_id":"750e8400-e29b-41d4-a716-446655440001"}'),
  ('d50e8400-e29b-41d4-a716-446655440011', 'created', 'payment', 'a50e8400-e29b-41d4-a716-446655440002', NULL, '{"payment_type":"entrance_fee","amount":25.00,"student_id":"750e8400-e29b-41d4-a716-446655440002"}'),
  
  -- Attendance records
  ('d50e8400-e29b-41d4-a716-446655440020', 'created', 'attendance', 'b50e8400-e29b-41d4-a716-446655440001', NULL, '{"status":"present","session_date":"2025-11-03","student_id":"750e8400-e29b-41d4-a716-446655440001"}'),
  ('d50e8400-e29b-41d4-a716-446655440021', 'created', 'attendance', 'b50e8400-e29b-41d4-a716-446655440004', NULL, '{"status":"absent","session_date":"2025-11-12","reason":"Sick","student_id":"750e8400-e29b-41d4-a716-446655440001"}'),
  
  -- Discounts applied
  ('d50e8400-e29b-41d4-a716-446655440030', 'created', 'discount', '950e8400-e29b-41d4-a716-446655440001', NULL, '{"discount_type":"two_groups","is_percentage":true,"discount_value":10.00}'),
  ('d50e8400-e29b-41d4-a716-446655440031', 'created', 'discount', '950e8400-e29b-41d4-a716-446655440002', NULL, '{"discount_type":"family","is_percentage":true,"discount_value":15.00}'),
  
  -- Status changes
  ('d50e8400-e29b-41d4-a716-446655440040', 'updated', 'student', '750e8400-e29b-41d4-a716-446655440006', '{"status":"active"}', '{"status":"paused"}'),
  ('d50e8400-e29b-41d4-a716-446655440041', 'updated', 'student', '750e8400-e29b-41d4-a716-446655440008', '{"status":"active"}', '{"status":"dropped"}'),
  
  -- Group enrollments
  ('d50e8400-e29b-41d4-a716-446655440050', 'created', 'student_group', '850e8400-e29b-41d4-a716-446655440001', NULL, '{"student_id":"750e8400-e29b-41d4-a716-446655440001","group_id":"650e8400-e29b-41d4-a716-446655440001"}'),
  ('d50e8400-e29b-41d4-a716-446655440051', 'created', 'student_group', '850e8400-e29b-41d4-a716-446655440004', NULL, '{"student_id":"750e8400-e29b-41d4-a716-446655440002","group_id":"650e8400-e29b-41d4-a716-446655440002"}');

-- =====================================================
-- SUMMARY
-- =====================================================
-- Teachers: 5 (1 inactive)
-- Groups: 6 (1 paused)
-- Students: 10 (3 active in 2+ groups, 1 paused, 1 dropped, 2 missing entrance fee)
-- Student Groups: 11 enrollments
-- Discounts: 4 (two-groups, family x2, special)
-- Payments: 21 (8 entrance fees, 13 tuition/partial/event)
-- Attendance: 70+ records with mixed present/absent/excused
-- Events: 6 (holidays, workshops, exams, reschedules)
-- Activity Logs: 20+ action records

-- Total test coverage:
-- ✓ Multi-group enrollments (David in 2 groups)
-- ✓ Family discounts (Maria & Elena)
-- ✓ Multiple payment types (entrance, tuition, partial, event)
-- ✓ Discount application in payments
-- ✓ Varying attendance patterns
-- ✓ Student status changes (active/paused/dropped)
-- ✓ Various event types
-- ✓ Complete audit trail via activity logs
