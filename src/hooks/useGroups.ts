import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Group, GroupWithDetails } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useGroups() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: async (): Promise<GroupWithDetails[]> => {
      const { data: groups, error } = await supabase
        .from('groups')
        .select(`
          *,
          teacher:teachers (*),
          student_groups (
            *,
            student:students (*)
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return (groups || []).map((group: any) => ({
        ...group,
        students: group.student_groups,
        studentCount: group.student_groups?.filter((sg: any) => sg.is_active && sg.student && !sg.student.is_deleted).length || 0,
      }));
    },
  });

  const createGroup = useMutation({
    mutationFn: async (data: { name: string; language: string; teacher_id?: string; schedule_days?: string[]; schedule_time?: string; sessions_per_cycle?: number; session_fee?: number }) => {
      const { data: group, error } = await supabase
        .from('groups')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      
      await supabase.from('activity_logs').insert({
        action: 'Group created',
        entity_type: 'group',
        entity_id: group.id,
        new_value: data as any,
      });
      
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({ title: 'Group created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating group', description: error.message, variant: 'destructive' });
    },
  });

  const updateGroup = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Group> & { id: string }) => {
      const { data: oldGroup } = await supabase.from('groups').select().eq('id', id).single();
      
      const { data: group, error } = await supabase
        .from('groups')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      
      await supabase.from('activity_logs').insert({
        action: 'Group updated',
        entity_type: 'group',
        entity_id: id,
        old_value: oldGroup as any,
        new_value: data as any,
      });
      
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({ title: 'Group updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating group', description: error.message, variant: 'destructive' });
    },
  });

  const deleteGroup = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete: mark group inactive and deactivate enrollments
      const { error } = await supabase
        .from('groups')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;

      // Deactivate all student enrollments in this group
      await supabase
        .from('student_groups')
        .update({ is_active: false })
        .eq('group_id', id);
      
      await supabase.from('activity_logs').insert({
        action: 'Group deactivated',
        entity_type: 'group',
        entity_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Group deactivated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deactivating group', description: error.message, variant: 'destructive' });
    },
  });

  const hardDeleteGroup = useMutation({
    mutationFn: async (id: string) => {
      // Hard delete: actually delete row to trigger DB cascades
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);
      if (error) throw error;

      await supabase.from('activity_logs').insert({
        action: 'Group deleted',
        entity_type: 'group',
        entity_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Group deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting group', description: error.message, variant: 'destructive' });
    },
  });

  return {
    groups: groupsQuery.data || [],
    isLoading: groupsQuery.isLoading,
    error: groupsQuery.error,
    createGroup,
    updateGroup,
    deleteGroup,
    hardDeleteGroup,
    refetch: groupsQuery.refetch,
  };
}
