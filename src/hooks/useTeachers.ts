import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Teacher } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useTeachers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const teachersQuery = useQuery({
    queryKey: ['teachers'],
    queryFn: async (): Promise<Teacher[]> => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });

  const createTeacher = useMutation({
    mutationFn: async (data: { name: string; phone?: string; email?: string }) => {
      const { data: teacher, error } = await supabase
        .from('teachers')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return teacher;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({ title: 'Teacher added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error adding teacher', description: error.message, variant: 'destructive' });
    },
  });

  const updateTeacher = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Teacher> & { id: string }) => {
      const { data: teacher, error } = await supabase
        .from('teachers')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return teacher;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({ title: 'Teacher updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating teacher', description: error.message, variant: 'destructive' });
    },
  });

  return {
    teachers: teachersQuery.data || [],
    isLoading: teachersQuery.isLoading,
    error: teachersQuery.error,
    createTeacher,
    updateTeacher,
    refetch: teachersQuery.refetch,
  };
}
