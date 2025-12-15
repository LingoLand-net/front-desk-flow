import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import { usePayments } from '@/hooks/usePayments';
import { useAttendance } from '@/hooks/useAttendance';
import { format } from 'date-fns';

type ExportType = 'students' | 'payments' | 'attendance';
type ExportFormat = 'csv' | 'json';

export function ExportsPanel() {
  const [exportType, setExportType] = useState<ExportType>('students');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');

  const { students } = useStudents();
  const { payments } = usePayments();
  const { attendance } = useAttendance();

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).filter(key => 
      !['groups', 'discounts', 'payments', 'attendance', 'student', 'group', 'teacher'].includes(key)
    );
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
          return value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = (data: any[], filename: string) => {
    const cleanData = data.map(item => {
      const clean: any = { ...item };
      delete clean.groups;
      delete clean.discounts;
      delete clean.payments;
      delete clean.attendance;
      delete clean.student;
      delete clean.group;
      delete clean.teacher;
      return clean;
    });
    
    const blob = new Blob([JSON.stringify(cleanData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    let data: any[] = [];
    let filename = '';

    switch (exportType) {
      case 'students':
        data = students.map(s => ({
          name: s.name,
          phone: s.phone,
          whatsapp: s.whatsapp,
          status: s.status,
          enrollment_date: s.enrollment_date,
          entrance_fee_paid: s.entrance_fee_paid,
          remaining_sessions: s.remainingSessions,
          attendance_percentage: s.attendancePercentage,
          total_paid: s.totalPaid,
        }));
        filename = 'students';
        break;
      case 'payments':
        data = payments.map((p: any) => ({
          student_name: p.student?.name,
          group_name: p.group?.name,
          payment_type: p.payment_type,
          amount: p.amount,
          original_amount: p.original_amount,
          discount_applied: p.discount_applied,
          sessions_purchased: p.sessions_purchased,
          payment_date: p.payment_date,
          notes: p.notes,
        }));
        filename = 'payments';
        break;
      case 'attendance':
        data = attendance.map((a: any) => ({
          student_name: a.student?.name,
          group_name: a.group?.name,
          session_date: a.session_date,
          status: a.status,
          reason: a.reason,
        }));
        filename = 'attendance';
        break;
    }

    if (exportFormat === 'csv') {
      exportToCSV(data, filename);
    } else {
      exportToJSON(data, filename);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Export Data
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={exportType} onValueChange={(value: ExportType) => setExportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="students">Students List</SelectItem>
                <SelectItem value="payments">Payments Report</SelectItem>
                <SelectItem value="attendance">Attendance Records</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Format
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={exportFormat} onValueChange={(value: ExportFormat) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Excel compatible)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {exportType === 'students' && `${students.length} students`}
              {exportType === 'payments' && `${payments.length} payments`}
              {exportType === 'attendance' && `${attendance.length} records`}
            </div>
            <Button onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download {exportFormat.toUpperCase()}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 text-center">
              <div className="text-2xl font-bold">{students.length}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 text-center">
              <div className="text-2xl font-bold">{students.filter(s => s.status === 'active').length}</div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 text-center">
              <div className="text-2xl font-bold">{payments.length}</div>
              <div className="text-sm text-muted-foreground">Total Payments</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 text-center">
              <div className="text-2xl font-bold">{attendance.length}</div>
              <div className="text-sm text-muted-foreground">Attendance Records</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
