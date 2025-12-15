import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Attendance, AttendanceStatus } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useAttendance(groupId?: string, date?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const attendanceQuery = useQuery({
    queryKey: ['attendance', groupId, date],
    queryFn: async () => {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          student:students (id, name),
          group:groups (id, name)
        `)
        .order('session_date', { ascending: false });

      if (groupId) {
        query = query.eq('group_id', groupId);
      }
      if (date) {
        query = query.eq('session_date', date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: true,
  });

  const recordAttendance = useMutation({
    mutationFn: async (data: {
      student_id: string;
      group_id: string;
      session_date: string;
      status: AttendanceStatus;
      reason?: string;
    }) => {
      // Check if attendance already exists
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', data.student_id)
        .eq('group_id', data.group_id)
        .eq('session_date', data.session_date)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing
        const { data: attendance, error } = await supabase
          .from('attendance')
          .update({ status: data.status, reason: data.reason })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        result = attendance;
      } else {
        // Insert new
        const { data: attendance, error } = await supabase
          .from('attendance')
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        result = attendance;

        // Update sessions_used if present
        if (data.status === 'present') {
          const { data: sg } = await supabase
            .from('student_groups')
            .select('sessions_used')
            .eq('student_id', data.student_id)
            .eq('group_id', data.group_id)
            .single();

          if (sg) {
            await supabase
              .from('student_groups')
              .update({ sessions_used: sg.sessions_used + 1 })
              .eq('student_id', data.student_id)
              .eq('group_id', data.group_id);
          }
        }
      }

      await supabase.from('activity_logs').insert({
        action: 'Attendance recorded',
        entity_type: 'attendance',
        entity_id: result.id,
        new_value: data as any,
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Attendance recorded' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error recording attendance', description: error.message, variant: 'destructive' });
    },
  });

  const updateAttendance = useMutation({
    mutationFn: async ({ id, status, reason, edit_reason }: {
      id: string;
      status: AttendanceStatus;
      reason?: string;
      edit_reason: string;
    }) => {
      const { data: oldAttendance } = await supabase.from('attendance').select().eq('id', id).single();

      const { data: attendance, error } = await supabase
        .from('attendance')
        .update({ 
          status, 
          reason, 
          edited_at: new Date().toISOString(),
          edit_reason 
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      await supabase.from('activity_logs').insert({
        action: 'Attendance edited',
        entity_type: 'attendance',
        entity_id: id,
        old_value: oldAttendance as any,
        new_value: { status, reason, edit_reason } as any,
      });

      return attendance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Attendance updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating attendance', description: error.message, variant: 'destructive' });
    },
  });

  return {
    attendance: attendanceQuery.data || [],
    isLoading: attendanceQuery.isLoading,
    error: attendanceQuery.error,
    recordAttendance,
    updateAttendance,
    refetch: attendanceQuery.refetch,
  };
}
