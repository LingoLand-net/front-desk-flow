import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useStudentGroups() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const enrollStudent = useMutation({
    mutationFn: async (data: {
      student_id: string;
      group_id: string;
      sessions_total?: number;
    }) => {
      const { data: enrollment, error } = await supabase
        .from('student_groups')
        .insert({
          student_id: data.student_id,
          group_id: data.group_id,
          sessions_total: data.sessions_total || 0,
          sessions_used: 0,
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from('activity_logs').insert({
        action: 'Student enrolled in group',
        entity_type: 'student_group',
        entity_id: enrollment.id,
        new_value: data as any,
      });

      return enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({ title: 'Student enrolled successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error enrolling student', description: error.message, variant: 'destructive' });
    },
  });

  const unenrollStudent = useMutation({
    mutationFn: async ({ studentId, groupId }: { studentId: string; groupId: string }) => {
      const { error } = await supabase
        .from('student_groups')
        .update({ is_active: false })
        .eq('student_id', studentId)
        .eq('group_id', groupId);
      if (error) throw error;

      await supabase.from('activity_logs').insert({
        action: 'Student unenrolled from group',
        entity_type: 'student_group',
        new_value: { student_id: studentId, group_id: groupId } as any,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({ title: 'Student unenrolled successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error unenrolling student', description: error.message, variant: 'destructive' });
    },
  });

  const moveStudent = useMutation({
    mutationFn: async ({ 
      studentId, 
      fromGroupId, 
      toGroupId 
    }: { 
      studentId: string; 
      fromGroupId: string; 
      toGroupId: string;
    }) => {
      // Get current enrollment data
      const { data: currentEnrollment } = await supabase
        .from('student_groups')
        .select('sessions_total, sessions_used')
        .eq('student_id', studentId)
        .eq('group_id', fromGroupId)
        .single();

      // Deactivate old enrollment
      await supabase
        .from('student_groups')
        .update({ is_active: false })
        .eq('student_id', studentId)
        .eq('group_id', fromGroupId);

      // Create new enrollment with remaining sessions
      const remainingSessions = currentEnrollment 
        ? currentEnrollment.sessions_total - currentEnrollment.sessions_used 
        : 0;

      const { error } = await supabase
        .from('student_groups')
        .insert({
          student_id: studentId,
          group_id: toGroupId,
          sessions_total: remainingSessions,
          sessions_used: 0,
        });
      if (error) throw error;

      await supabase.from('activity_logs').insert({
        action: 'Student moved between groups',
        entity_type: 'student_group',
        new_value: { student_id: studentId, from_group: fromGroupId, to_group: toGroupId } as any,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({ title: 'Student moved successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error moving student', description: error.message, variant: 'destructive' });
    },
  });

  return {
    enrollStudent,
    unenrollStudent,
    moveStudent,
  };
}
