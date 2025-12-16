import { useState } from 'react';
import { AlertWidgets } from '@/components/dashboard/AlertWidgets';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { FinancialOverview } from '@/components/dashboard/FinancialOverview';
import { AddStudentDialog } from '@/components/students/AddStudentDialog';
import { RecordPaymentDialog } from '@/components/payments/RecordPaymentDialog';
import { useStudents } from '@/hooks/useStudents';
import { usePayments } from '@/hooks/usePayments';
import { useAttendance } from '@/hooks/useAttendance';
import { useSearch } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface DashboardProps {
  searchQuery?: string;
}

export function Dashboard({ searchQuery: _searchQuery }: DashboardProps) {
  const { searchQuery } = useSearch();
  const { students, isLoading: studentsLoading, error: studentsError } = useStudents();
  const { payments, isLoading: paymentsLoading, error: paymentsError } = usePayments();
  const { attendance, isLoading: attendanceLoading, error: attendanceError } = useAttendance();
  const navigate = useNavigate();
  
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

  // Calculate alert metrics
  const overdueCount = students?.filter(s => (s.remainingSessions ?? 0) < 0).length || 0;
  const lowSessionsCount = students?.filter(s => (s.remainingSessions ?? 0) <= 2 && (s.remainingSessions ?? 0) >= 0).length || 0;
  
  // Missing attendance: count students who should have recorded attendance today
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const recordedToday = new Set(
    (attendance || [])
      .filter(a => a.session_date === todayString)
      .map(a => a.student_id)
  );
  
  // Simple count: active students not yet in today's attendance
  const missingAttendanceCount = (students || [])
    .filter(s => s.status === 'active' && !recordedToday.has(s.id))
    .length;

  // Financial data - this month
  const thisMonth = new Date();
  const monthPayments = (payments || []).filter(p => {
    const pDate = new Date(p.created_at || '');
    return pDate.getMonth() === thisMonth.getMonth() && pDate.getFullYear() === thisMonth.getFullYear();
  });
  
  const totalCollected = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalDiscounts = monthPayments.reduce((sum, p) => sum + (p.discount_applied || 0), 0);
  const paymentCount = monthPayments.length;

  // Show loading or error states
  const isLoading = studentsLoading || paymentsLoading || attendanceLoading;
  const hasError = studentsError || paymentsError || attendanceError;
  const noData = !students || students.length === 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's your overview for today.</p>
        </div>
      </div>

      {/* Error alerts */}
      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load data. {studentsError && `Students: ${(studentsError as Error).message}`}
            {paymentsError && `Payments: ${(paymentsError as Error).message}`}
            {attendanceError && `Attendance: ${(attendanceError as Error).message}`}
          </AlertDescription>
        </Alert>
      )}

      {/* No data alert */}
      {!isLoading && noData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No data loaded yet. Please add students to get started.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <QuickActions 
          onAddStudent={() => setIsAddStudentOpen(true)}
          onRecordPayment={() => setIsRecordPaymentOpen(true)}
          onRecordAttendance={() => navigate('/ops')}
          onAddEvent={() => navigate('/ops')}
        />
      </Card>

      {/* Alerts */}
      <Card className="p-6">
        <AlertWidgets 
          overduePayments={overdueCount}
          lowSessions={lowSessionsCount}
          missingAttendance={missingAttendanceCount}
        />
      </Card>

      {/* Financial Overview */}
      <Card className="p-6">
        <FinancialOverview 
          totalCollected={totalCollected}
          pendingPayments={0}
          totalDiscounts={totalDiscounts}
          paymentCount={paymentCount}
        />
      </Card>

      {/* Dialogs */}
      <AddStudentDialog 
        open={isAddStudentOpen}
        onOpenChange={setIsAddStudentOpen}
      />
      
      <RecordPaymentDialog
        open={isRecordPaymentOpen}
        onOpenChange={setIsRecordPaymentOpen}
      />
    </div>
  );
}

export default Dashboard;
