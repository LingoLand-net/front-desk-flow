import { useState } from 'react';
import { AddStudentDialog } from '@/components/students/AddStudentDialog';
import { StudentTable } from '@/components/students/StudentTable';
import { StudentDrawer } from '@/components/students/StudentDrawer';
import { useStudents } from '@/hooks/useStudents';
import { useSearch } from '@/components/layout/AppLayout';
import { StudentWithDetails } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Plus } from 'lucide-react';

interface StudentsProps {
  searchQuery?: string;
}

export function Students({ searchQuery: _searchQuery }: StudentsProps) {
  const { searchQuery } = useSearch();
  const { students, isLoading, error } = useStudents();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDetails | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  // Filter students based on search and filters
  let filteredStudents = students || [];

  if (searchQuery) {
    filteredStudents = filteredStudents.filter(s =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone?.includes(searchQuery) ||
      s.whatsapp?.includes(searchQuery)
    );
  }

  if (filterStatus !== 'all') {
    filteredStudents = filteredStudents.filter(s => s.status === filterStatus);
  }

  if (filterPayment === 'overdue') {
    filteredStudents = filteredStudents.filter(s => (s.remainingSessions ?? 0) < 0);
  } else if (filterPayment === 'pending') {
    filteredStudents = filteredStudents.filter(s => !s.entrance_fee_paid);
  } else if (filterPayment === 'low-sessions') {
    filteredStudents = filteredStudents.filter(s => (s.remainingSessions ?? 0) <= 2 && (s.remainingSessions ?? 0) >= 0);
  }

  const noData = !students || students.length === 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage students, groups, and enrollment.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load students: {(error as Error).message}
          </AlertDescription>
        </Alert>
      )}

      {/* No data alert */}
      {!isLoading && noData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No students found. Click "Add Student" to get started.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Payment / Sessions</label>
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="pending">Entrance Unpaid</SelectItem>
                <SelectItem value="low-sessions">Low Sessions (≤ 2)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Student Table */}
      <Card className="p-6">
        <StudentTable 
          students={filteredStudents} 
          onSelectStudent={setSelectedStudent}
          searchQuery={searchQuery}
        />
      </Card>

      {/* Dialogs */}
      <AddStudentDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {/* Student Drawer */}
      <StudentDrawer 
        student={selectedStudent}
        open={selectedStudent !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedStudent(null);
        }}
      />
    </div>
  );
}

export default Students;
