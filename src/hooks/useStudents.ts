import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Student, StudentWithDetails, StudentStatus } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useStudents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const studentsQuery = useQuery({
    queryKey: ['students'],
    queryFn: async (): Promise<StudentWithDetails[]> => {
      const { data: students, error } = await supabase
        .from('students')
        .select(`
          *,
          student_groups (
            *,
            group:groups (*)
          ),
          discounts!student_id (*),
          payments (*),
          attendance (*)
        `)
        .eq('is_deleted', false)
        .order('name');

      if (error) throw error;

      return (students || []).map((student: any) => {
        const totalPaid = student.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
        const sessionsTotal = student.student_groups?.reduce((sum: number, sg: any) => sum + sg.sessions_total, 0) || 0;
        const sessionsUsed = student.student_groups?.reduce((sum: number, sg: any) => sum + sg.sessions_used, 0) || 0;
        const remainingSessions = sessionsTotal - sessionsUsed;
        
        const totalAttendance = student.attendance?.length || 0;
        const presentCount = student.attendance?.filter((a: any) => a.status === 'present').length || 0;
        const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

        return {
          ...student,
          groups: student.student_groups,
          totalPaid,
          remainingSessions,
          attendancePercentage,
        };
      });
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    const channel = supabase.channel('realtime-students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        queryClient.invalidateQueries({ queryKey: ['students'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_groups' }, () => {
        queryClient.invalidateQueries({ queryKey: ['students'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['students'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'discounts' }, () => {
        queryClient.invalidateQueries({ queryKey: ['students'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        queryClient.invalidateQueries({ queryKey: ['students'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createStudent = useMutation({
    mutationFn: async (data: { name: string; phone?: string; whatsapp?: string; notes?: string; entrance_fee_amount?: number }) => {
      const { data: student, error } = await supabase
        .from('students')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      
      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'Student created',
        entity_type: 'student',
        entity_id: student.id,
        new_value: data as any,
      });
      
      return student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Student added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error adding student', description: error.message, variant: 'destructive' });
    },
  });

  const updateStudent = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Student> & { id: string }) => {
      const { data: oldStudent } = await supabase.from('students').select().eq('id', id).single();
      
      const { data: student, error } = await supabase
        .from('students')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      
      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'Student updated',
        entity_type: 'student',
        entity_id: id,
        old_value: oldStudent as any,
        new_value: data as any,
      });
      
      return student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Student updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating student', description: error.message, variant: 'destructive' });
    },
  });

  const deleteStudent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .update({ is_deleted: true })
        .eq('id', id);
      if (error) throw error;
      
      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'Student archived',
        entity_type: 'student',
        entity_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Student archived successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error archiving student', description: error.message, variant: 'destructive' });
    },
  });

  return {
    students: studentsQuery.data || [],
    isLoading: studentsQuery.isLoading,
    error: studentsQuery.error,
    createStudent,
    updateStudent,
    deleteStudent,
    refetch: studentsQuery.refetch,
  };
}
