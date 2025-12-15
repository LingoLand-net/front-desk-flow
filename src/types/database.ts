// Custom types that extend the Supabase generated types
export type StudentStatus = 'active' | 'paused' | 'dropped';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type AttendanceStatus = 'present' | 'absent' | 'excused';
export type DiscountType = 'two_groups' | 'family' | 'special';
export type EventType = 'holiday' | 'extra_class' | 'rescheduled' | 'workshop' | 'exam' | 'open_day';
export type PaymentType = 'tuition' | 'partial' | 'entrance_fee' | 'event';

export interface Student {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  status: StudentStatus;
  enrollment_date: string | null;
  entrance_fee_amount: number;
  entrance_fee_paid: boolean;
  entrance_fee_paid_date: string | null;
  notes: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  language: string;
  teacher_id: string | null;
  schedule_days: string[] | null;
  schedule_time: string | null;
  sessions_per_cycle: number;
  session_fee: number;
  is_paused: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentGroup {
  id: string;
  student_id: string;
  group_id: string;
  sessions_total: number;
  sessions_used: number;
  joined_at: string;
  is_active: boolean;
}

export interface Discount {
  id: string;
  student_id: string;
  discount_type: DiscountType;
  is_percentage: boolean;
  discount_value: number;
  linked_student_id: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  group_id: string | null;
  payment_type: PaymentType;
  amount: number;
  original_amount: number | null;
  discount_applied: number;
  sessions_purchased: number;
  payment_date: string;
  notes: string | null;
  created_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  group_id: string;
  session_date: string;
  status: AttendanceStatus;
  reason: string | null;
  edited_at: string | null;
  edit_reason: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  event_type: EventType;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  group_id: string | null;
  is_paid: boolean;
  fee_amount: number;
  affects_sessions: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: unknown;
  new_value: unknown;
  created_at: string;
}

// Extended types with relations
export interface StudentWithDetails extends Student {
  groups?: (StudentGroup & { group: Group })[];
  discounts?: Discount[];
  payments?: Payment[];
  attendance?: Attendance[];
  totalPaid?: number;
  remainingSessions?: number;
  attendancePercentage?: number;
}

export interface GroupWithDetails extends Group {
  teacher?: Teacher;
  students?: (StudentGroup & { student: Student })[];
  studentCount?: number;
}
