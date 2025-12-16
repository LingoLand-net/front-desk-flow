import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Check, X, Clock, CalendarDays } from 'lucide-react';
import { useGroups } from '@/hooks/useGroups';
import { useAttendance } from '@/hooks/useAttendance';
import { AttendanceStatus } from '@/types/database';
import { format } from 'date-fns';

export function AttendancePanel() {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { groups } = useGroups();
  const { attendance, recordAttendance } = useAttendance(selectedGroupId, selectedDate);
  const [bulkMarking, setBulkMarking] = useState(false);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const groupStudents = selectedGroup?.students?.filter(sg => sg.is_active && !sg.student?.is_deleted) || [];

  const getAttendanceForStudent = (studentId: string) => {
    return attendance.find((a: any) => a.student_id === studentId);
  };

  const handleRecordAttendance = async (studentId: string, status: AttendanceStatus, reason?: string) => {
    if (!selectedGroupId) return;
    await recordAttendance.mutateAsync({
      student_id: studentId,
      group_id: selectedGroupId,
      session_date: selectedDate,
      status,
      reason,
    });
  };

  const handleMarkAll = async (status: AttendanceStatus) => {
    if (!selectedGroupId || groupStudents.length === 0) return;
    try {
      setBulkMarking(true);
      const tasks = groupStudents
        .filter((sg: any) => {
          const existing = getAttendanceForStudent(sg.student_id);
          return existing?.status !== status; // skip if already same
        })
        .map((sg: any) =>
          recordAttendance.mutateAsync({
            student_id: sg.student_id,
            group_id: selectedGroupId,
            session_date: selectedDate,
            status,
          })
        );
      if (tasks.length > 0) {
        await Promise.allSettled(tasks);
      }
    } finally {
      setBulkMarking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-wrap">
        <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map(group => (
              <SelectItem key={group.id} value={group.id}>
                {group.name} - {group.language}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {selectedGroupId && selectedGroup && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <span>{selectedGroup.name} - {format(new Date(selectedDate), 'PP')}</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{groupStudents.length} students</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll('present')}
                  disabled={bulkMarking || recordAttendance.isPending || groupStudents.length === 0}
                >
                  Mark all present
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll('absent')}
                  disabled={bulkMarking || recordAttendance.isPending || groupStudents.length === 0}
                >
                  Mark all absent
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {groupStudents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No students enrolled in this group</p>
            ) : (
              <div className="space-y-2">
                {groupStudents.map((sg: any) => {
                  const existingAttendance = getAttendanceForStudent(sg.student_id);
                  const currentStatus = existingAttendance?.status;

                  return (
                    <div 
                      key={sg.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium">{sg.student?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Sessions: {sg.sessions_used} / {sg.sessions_total}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="lg"
                          variant={currentStatus === 'present' ? 'default' : 'outline'}
                          className={currentStatus === 'present' ? 'bg-secondary hover:bg-secondary/90' : 'hover:bg-secondary/20 hover:border-secondary'}
                          onClick={() => handleRecordAttendance(sg.student_id, 'present')}
                          disabled={recordAttendance.isPending}
                        >
                          <Check className="h-5 w-5" />
                        </Button>
                        <Button
                          size="lg"
                          variant={currentStatus === 'absent' ? 'default' : 'outline'}
                          className={currentStatus === 'absent' ? 'bg-destructive hover:bg-destructive/90' : 'hover:bg-destructive/20 hover:border-destructive'}
                          onClick={() => handleRecordAttendance(sg.student_id, 'absent')}
                          disabled={recordAttendance.isPending}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                        <Button
                          size="lg"
                          variant={currentStatus === 'excused' ? 'default' : 'outline'}
                          className={currentStatus === 'excused' ? 'bg-primary hover:bg-primary/90' : 'hover:bg-primary/20 hover:border-primary'}
                          onClick={() => handleRecordAttendance(sg.student_id, 'excused', 'Excused absence')}
                          disabled={recordAttendance.isPending}
                        >
                          <Clock className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedGroupId && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Select a group to record attendance
          </CardContent>
        </Card>
      )}
    </div>
  );
}
