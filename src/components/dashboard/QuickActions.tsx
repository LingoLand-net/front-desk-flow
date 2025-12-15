import { UserPlus, CreditCard, UserCheck, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onAddStudent: () => void;
  onRecordPayment: () => void;
  onRecordAttendance: () => void;
  onAddEvent: () => void;
}

export function QuickActions({ 
  onAddStudent, 
  onRecordPayment, 
  onRecordAttendance, 
  onAddEvent 
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Button
        size="lg"
        className="h-20 flex-col gap-2 bg-primary hover:bg-primary/90"
        onClick={onAddStudent}
      >
        <UserPlus className="h-6 w-6" />
        <span>Add Student</span>
      </Button>
      
      <Button
        size="lg"
        variant="secondary"
        className="h-20 flex-col gap-2"
        onClick={onRecordPayment}
      >
        <CreditCard className="h-6 w-6" />
        <span>Record Payment</span>
      </Button>
      
      <Button
        size="lg"
        variant="outline"
        className="h-20 flex-col gap-2 border-primary/50 hover:bg-primary/10"
        onClick={onRecordAttendance}
      >
        <UserCheck className="h-6 w-6" />
        <span>Take Attendance</span>
      </Button>
      
      <Button
        size="lg"
        variant="outline"
        className="h-20 flex-col gap-2"
        onClick={onAddEvent}
      >
        <CalendarPlus className="h-6 w-6" />
        <span>Add Event</span>
      </Button>
    </div>
  );
}
