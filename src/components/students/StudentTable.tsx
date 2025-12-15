import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Check, X, Trash2, Eye } from 'lucide-react';
import { StudentWithDetails, StudentStatus } from '@/types/database';
import { useStudents } from '@/hooks/useStudents';

interface StudentTableProps {
  students: StudentWithDetails[];
  searchQuery: string;
  onSelectStudent: (student: StudentWithDetails) => void;
}

const statusColors: Record<StudentStatus, string> = {
  active: 'bg-secondary text-secondary-foreground',
  paused: 'bg-primary/20 text-primary',
  dropped: 'bg-destructive/20 text-destructive',
};

export function StudentTable({ students, searchQuery, onSelectStudent }: StudentTableProps) {
  const { updateStudent } = useStudents();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<StudentWithDetails>>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone?.includes(searchQuery) ||
      student.whatsapp?.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    const matchesPayment = paymentFilter === 'all' || 
      (paymentFilter === 'overdue' && (student.remainingSessions || 0) < 0) ||
      (paymentFilter === 'low' && (student.remainingSessions || 0) <= 2 && (student.remainingSessions || 0) >= 0) ||
      (paymentFilter === 'entrance_unpaid' && !student.entrance_fee_paid);

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const startEdit = (student: StudentWithDetails) => {
    setEditingId(student.id);
    setEditData({ name: student.name, phone: student.phone, status: student.status });
  };

  const saveEdit = async () => {
    if (editingId && editData) {
      await updateStudent.mutateAsync({ id: editingId, ...editData });
      setEditingId(null);
      setEditData({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const getPaymentStatus = (student: StudentWithDetails) => {
    if (!student.entrance_fee_paid) return 'entrance_due';
    if ((student.remainingSessions || 0) < 0) return 'overdue';
    if ((student.remainingSessions || 0) <= 2) return 'low';
    return 'ok';
  };

  const paymentStatusBadge = (status: string) => {
    switch (status) {
      case 'entrance_due':
        return <Badge variant="destructive">Entrance Due</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'low':
        return <Badge className="bg-primary/20 text-primary">Low Sessions</Badge>;
      default:
        return <Badge variant="secondary">Paid</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="low">Low Sessions</SelectItem>
            <SelectItem value="entrance_unpaid">Entrance Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead className="text-center">Sessions</TableHead>
              <TableHead className="text-center">Attendance</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total Paid</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow 
                  key={student.id} 
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => onSelectStudent(student)}
                >
                  <TableCell className="font-medium">
                    {editingId === student.id ? (
                      <Input
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="h-8"
                      />
                    ) : (
                      student.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === student.id ? (
                      <Input
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="h-8"
                      />
                    ) : (
                      student.phone || '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === student.id ? (
                      <Select
                        value={editData.status}
                        onValueChange={(value: StudentStatus) => setEditData({ ...editData, status: value })}
                      >
                        <SelectTrigger className="h-8" onClick={(e) => e.stopPropagation()}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="dropped">Dropped</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={statusColors[student.status]}>
                        {student.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {student.groups?.filter(g => g.is_active).map(sg => (
                        <Badge key={sg.id} variant="outline" className="text-xs">
                          {sg.group.name}
                        </Badge>
                      ))}
                      {(!student.groups || student.groups.filter(g => g.is_active).length === 0) && (
                        <span className="text-muted-foreground text-sm">No groups</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={student.remainingSessions !== undefined && student.remainingSessions <= 2 ? 'text-destructive font-medium' : ''}>
                      {student.remainingSessions ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {student.attendancePercentage ?? 0}%
                  </TableCell>
                  <TableCell>
                    {paymentStatusBadge(getPaymentStatus(student))}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${(student.totalPaid || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {editingId === student.id ? (
                        <>
                          <Button size="icon" variant="ghost" onClick={saveEdit} className="h-8 w-8">
                            <Check className="h-4 w-4 text-secondary" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8">
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => startEdit(student)} className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => onSelectStudent(student)} className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
