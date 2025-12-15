import { AlertTriangle, Clock, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AlertWidgetsProps {
  overduePayments: number;
  lowSessions: number;
  missingAttendance: number;
}

export function AlertWidgets({ overduePayments, lowSessions, missingAttendance }: AlertWidgetsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className={overduePayments > 0 ? 'border-destructive/50 bg-destructive/5' : ''}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
          <AlertTriangle className={`h-5 w-5 ${overduePayments > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{overduePayments}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {overduePayments > 0 ? 'Students need attention' : 'All payments up to date'}
          </p>
        </CardContent>
      </Card>
      
      <Card className={lowSessions > 0 ? 'border-primary/50 bg-primary/5' : ''}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Low Sessions</CardTitle>
          <Clock className={`h-5 w-5 ${lowSessions > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{lowSessions}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {lowSessions > 0 ? 'Students with ≤2 sessions left' : 'All students have sessions'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Missing Attendance</CardTitle>
          <UserX className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{missingAttendance}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {missingAttendance > 0 ? 'Records not yet entered today' : 'All attendance recorded'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
