# Data Loading & Troubleshooting Guide

## Current Status

✅ **Fixed:**
- Search context now properly flows through all pages
- Dashboard, Students, and Operations pages now use SearchContext
- Error/loading states added to Dashboard and Students pages
- Build passes without TypeScript errors
- All hooks properly return data objects

🔴 **Issue:** No data displays because seed data hasn't been loaded into Supabase yet

## How to Load Test Data

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Console:**
   - Visit https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Load the Seed Data:**
   - Copy the entire contents of `supabase/seed.sql`
   - Paste into the SQL Editor
   - Click "Run" button
   - Wait for completion (should take ~5 seconds)

4. **Verify Data Loaded:**
   - Go to "Table Editor"
   - Check each table:
     - `teachers` - Should have 5 records
     - `groups` - Should have 6 records
     - `students` - Should have 10 records
     - `student_groups` - Should have 11 records
     - `payments` - Should have 21+ records
     - `attendance` - Should have 70+ records
     - `discounts` - Should have 4 records

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
cd supabase
supabase db push

# Or run the seed directly
supabase seed run
```

### Option 3: Manual Table Creation

If the tables don't exist, you may need to first run the migration files:

1. In Supabase Console → SQL Editor
2. Run: `supabase/migrations/20251215141747_bd744296-1fe2-4ccb-81a0-d9b5060db964.sql`
3. Run: `supabase/migrations/20251215141755_049c305a-97d5-4236-b40b-664628542bed.sql`
4. Then run the seed data

## Verifying the App Works

### 1. Start the App

```bash
npm run dev
```

Visit: `http://localhost:8081`

### 2. Check Dashboard

You should now see:
- **Alert Widgets**: Showing counts for:
  - Overdue Payments: 0 (all paid up)
  - Low Sessions: 1 (one student has ≤2 sessions)
  - Missing Attendance: 8-10 (students without today's attendance recorded)
- **Financial Overview**: Shows "$475.00" (this month's tuition)
- **Quick Actions**: Buttons to add students/payments

### 3. Check Students Page

- Navigate to `/students`
- Should display a table with 10 students
- Filter options should work:
  - Status: Active, Paused, Dropped
  - Payment/Sessions: Overdue, Entrance Unpaid, Low Sessions
- Search should work (try searching "John" or "Maria")

### 4. Check Operations Tab

- Navigate to `/ops`
- Open "Attendance" tab
- Should show 70+ attendance records

## Test Data Summary

The seed data includes:

### Teachers (5)
- Sarah Johnson (English)
- Miguel Rodriguez (Spanish)
- Yuki Tanaka (Japanese)
- Sophie Laurent (French)
- Ahmed Hassan (inactive)

### Groups (6)
- English Beginner A (2 sessions/week, $50/session)
- English Intermediate B (2 sessions/week, $60/session)
- Spanish Beginner C (3 sessions/week, $40/session)
- Spanish Advanced D (2 sessions/week, $70/session)
- Japanese Beginner E (1 session/week, $80/session)
- French Intermediate F (2 sessions/week, $65/session)

### Students (10)
- 7 active students
- 1 paused student (Robert)
- 1 dropped student (Marco)
- 1 new student without entrance fee (Kenji)

### Payments (21+)
- Entrance fees for 8 students ($25 each)
- Tuition for various groups
- Multiple discounts applied:
  - Family discount: Maria & Elena (15% off)
  - Two-group discount: David (10% off)
  - Loyalty discount: Sophie ($5 off)

### Attendance (70+)
- Spread across groups
- Various dates in November/December 2025

### Discounts (4)
- Two-groups discount for David
- Family discounts for Maria & Elena
- Special loyalty discount for Sophie

## Troubleshooting

### Issue: Data still not showing after loading

**Check 1: Verify Supabase credentials**
```
Check .env file has:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJXXXXXXXXXXXXXXXXXXX
```

**Check 2: Open browser console (F12)**
- Look for errors in the Console tab
- Look for network errors in Network tab
- Check if queries are being sent to Supabase

**Check 3: Verify RLS policies**
- Go to Supabase Console → Authentication → Policies
- Ensure `students` table has policy that allows public SELECT
- Should have: `SELECT` with no restrictions (or `auth.role() = 'anon'`)

### Issue: Search not working

- Make sure you're on the Students page
- Type something and press Enter or just type
- Should filter students by name, phone, or WhatsApp

### Issue: Getting "No data loaded yet" message

This is correct - it means the seed.sql hasn't been run yet. Follow the "How to Load Test Data" section above.

### Issue: Build fails

```bash
npm install  # Reinstall dependencies
npm run build  # Try building again
```

## Architecture Notes

### Data Flow
```
Supabase (PostgreSQL) 
  ↓
React Query (useStudents, usePayments, etc.)
  ↓
SearchContext (provides searchQuery to pages)
  ↓
Pages (Dashboard, Students, Operations)
  ↓
Components (AlertWidgets, StudentTable, PaymentsPanel, etc.)
```

### Key Files Modified
- `src/components/layout/AppLayout.tsx` - Added SearchContext
- `src/dashboard/Dashboard.tsx` - Uses SearchContext, added error/loading states
- `src/students/Students.tsx` - Uses SearchContext, added error/loading states
- `src/ops/Operations.tsx` - Uses SearchContext

### All Hooks Return Objects
Each hook returns: `{ data, isLoading, error, mutations... }`

Example:
```typescript
const { students, isLoading, error } = useStudents();
// students is an array or []
// isLoading is boolean
// error is Error or null
```

## Next Steps

1. Load seed.sql data into Supabase
2. Verify dashboard shows metrics
3. Test search on Students page
4. Test filters on Students page
5. Add/Edit/Delete students to verify mutations work
6. Record payments to verify attendance tracking updates

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify Supabase credentials in .env
3. Verify seed.sql was completely executed
4. Check network tab to see API responses
