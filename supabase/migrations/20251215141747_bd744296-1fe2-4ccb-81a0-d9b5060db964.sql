-- Create enum types
CREATE TYPE public.student_status AS ENUM ('active', 'paused', 'dropped');
CREATE TYPE public.payment_status AS ENUM ('paid', 'pending', 'overdue');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'excused');
CREATE TYPE public.discount_type AS ENUM ('two_groups', 'family', 'special');
CREATE TYPE public.event_type AS ENUM ('holiday', 'extra_class', 'rescheduled', 'workshop', 'exam', 'open_day');
CREATE TYPE public.payment_type AS ENUM ('tuition', 'partial', 'entrance_fee', 'event');

-- Teachers table
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Groups table
CREATE TABLE public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    language TEXT NOT NULL,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    schedule_days TEXT[], -- e.g., ['Monday', 'Wednesday']
    schedule_time TEXT, -- e.g., '10:00 AM - 11:30 AM'
    sessions_per_cycle INTEGER DEFAULT 8,
    session_fee DECIMAL(10,2) DEFAULT 0,
    is_paused BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    status student_status DEFAULT 'active',
    enrollment_date DATE DEFAULT CURRENT_DATE,
    entrance_fee_amount DECIMAL(10,2) DEFAULT 0,
    entrance_fee_paid BOOLEAN DEFAULT false,
    entrance_fee_paid_date DATE,
    notes TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Student-Groups junction table (many-to-many)
CREATE TABLE public.student_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    sessions_total INTEGER DEFAULT 0,
    sessions_used INTEGER DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(student_id, group_id)
);

-- Discounts table
CREATE TABLE public.discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    discount_type discount_type NOT NULL,
    is_percentage BOOLEAN DEFAULT true,
    discount_value DECIMAL(10,2) NOT NULL,
    linked_student_id UUID REFERENCES public.students(id) ON DELETE SET NULL, -- For family discount
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    payment_type payment_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    original_amount DECIMAL(10,2), -- Before discounts
    discount_applied DECIMAL(10,2) DEFAULT 0,
    sessions_purchased INTEGER DEFAULT 0,
    payment_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Attendance table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    status attendance_status NOT NULL,
    reason TEXT, -- For absent/excused
    edited_at TIMESTAMPTZ,
    edit_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, group_id, session_date)
);

-- Events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    event_type event_type NOT NULL,
    event_date DATE NOT NULL,
    start_time TEXT,
    end_time TEXT,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL, -- NULL means all groups
    is_paid BOOLEAN DEFAULT false,
    fee_amount DECIMAL(10,2) DEFAULT 0,
    affects_sessions BOOLEAN DEFAULT false, -- Whether it counts as a session
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activity logs table
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'student', 'payment', 'attendance', etc.
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (public access for single-user desk app)
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create public access policies (single-user system, no auth required)
CREATE POLICY "Public access" ON public.teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.student_groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.discounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_students_name ON public.students(name);
CREATE INDEX idx_student_groups_student ON public.student_groups(student_id);
CREATE INDEX idx_student_groups_group ON public.student_groups(group_id);
CREATE INDEX idx_payments_student ON public.payments(student_id);
CREATE INDEX idx_payments_date ON public.payments(payment_date);
CREATE INDEX idx_attendance_student ON public.attendance(student_id);
CREATE INDEX idx_attendance_date ON public.attendance(session_date);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);