A summary of what we're building:

- **Small center, single user** - No complex authentication needed, just a simple system
- **Soft & Friendly design** - Warm colors, approachable UI for non-technical user
- **Full System at Once** - Complete feature set as specified
- **Desktop focused, English UI** - Optimized for front desk computer use

Based on your detailed requirements, here's my proposed plan:

## 🎓 Language Center Front Desk Dashboard

### Overview
A complete digital management system replacing paper forms, designed specifically for a non-technical desk lady with a warm, friendly interface and minimal learning curve.

---

### Phase 1: Core Foundation

#### 🏠 Main Dashboard
- **Smart Search Bar** - Search students by name, phone, or group with instant results
- **Quick Action Buttons** - Large, colorful buttons for daily tasks (Add Student, Record Payment, Take Attendance)
- **Alert Widgets** - Visual cards showing:
  - 🔴 Overdue payments count
  - 🟡 Students with low remaining sessions
  - ⚪ Today's attendance not yet recorded

---

### Phase 2: Student Management

#### 📋 Student Table (Main View)
- Inline editable fields (click to edit)
- Color-coded status badges (Active/Paused/Dropped)
- Auto-calculated: Remaining sessions, Attendance %, Payment status
- Quick filters sidebar (by status, payment, group, sessions)
- Soft delete only (archive, never lose data)

#### 👤 Student Profile Drawer (Slide-in Panel)
Opens from the right when clicking a student row:
- **Personal Info Tab** - Name, contact, enrollment date
- **Discounts Tab** - Checkboxes for discount types, percentage/fixed amount input
- **Groups Tab** - Enrolled groups with session usage, ability to move between groups
- **Attendance Tab** - Session history with Present/Absent/Excused, searchable by date
- **Payments Tab** - Full payment history including entrance fee, tuition, events
- **Entrance Fee Section** - One-time fee tracking with paid/unpaid status

---

### Phase 3: Attendance System

#### ✅ Attendance Recording
- Group-based attendance view
- One-click buttons: ✓ Present | ✗ Absent | ⚠ Excused
- Auto-updates remaining sessions and attendance %
- Past attendance editable with mandatory reason field
- All changes logged in activity history

---

### Phase 4: Payments & Financials

#### 💳 Payment System
- Support for: Tuition, Partial payments, Entrance fees, Event payments
- Automatic discount application
- Entrance fee charged once only (system prevents duplicates)
- Overdue status triggers based on configurable rules

#### 📊 Financial Overview Widget
- Total collected this month
- Pending payments
- Overdue amounts
- Discounts given summary

---

### Phase 5: Groups & Events

#### 👥 Group Management
- Group cards showing: Name, Language, Teacher, Schedule, Student count
- Add/Edit groups with session cycle settings
- Move students between groups easily
- Pause group feature (for holidays)

#### 📅 Events & Calendar
- Event types: Holiday, Extra class, Rescheduled session, Paid events
- Weekly/Monthly calendar view
- Events automatically affect attendance and payments

---

### Phase 6: Admin Features

#### 📝 Activity Log
- Complete audit trail of all actions
- Tracks: Who, What, When for every change
- Searchable and filterable

#### 📤 Exports & Reports
- Student list export
- Attendance reports
- Payment/Finance reports
- Excel and PDF formats

---

### Database Design (Supabase)
Clean, normalized schema:
- `students` - Core student data
- `groups` - Group definitions with schedule
- `student_groups` - Many-to-many enrollment
- `attendance` - Session attendance records
- `payments` - All payment transactions
- `discounts` - Applied discounts
- `events` - Calendar events
- `teachers` - Teacher info
- `activity_logs` - Complete audit trail

---

### Design Highlights
- 🎨 **Soft & Friendly Theme** - Warm peach/coral accents, rounded corners, gentle shadows
- 📱 **Large Click Targets** - Big buttons for fast daily operations
- 🔔 **Visual Feedback** - Toast notifications for all actions
- 💾 **Auto-save** - No "Save" buttons needed, changes apply immediately
- ⚡ **Inline Editing** - Click any field to edit directly in the table

This plan covers all your requirements in a logical build order. The system will use **Supabase** for the backend (database, real-time updates, and data persistence) to ensure no data is ever lost.

Does this plan align with your vision? Would you like me to adjust any priorities, add more detail to any section, or modify the approach?

Implement the plan
Explain database schema in detail
Describe screen layouts