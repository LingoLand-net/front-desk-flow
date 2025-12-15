import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event, EventType } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useEvents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          group:groups (id, name)
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const createEvent = useMutation({
    mutationFn: async (data: {
      title: string;
      event_type: EventType;
      event_date: string;
      start_time?: string;
      end_time?: string;
      group_id?: string;
      is_paid?: boolean;
      fee_amount?: number;
      affects_sessions?: boolean;
      notes?: string;
    }) => {
      const { data: event, error } = await supabase
        .from('events')
        .insert(data)
        .select()
        .single();
      if (error) throw error;

      await supabase.from('activity_logs').insert({
        action: 'Event created',
        entity_type: 'event',
        entity_id: event.id,
        new_value: data as any,
      });

      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating event', description: error.message, variant: 'destructive' });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Event> & { id: string }) => {
      const { data: event, error } = await supabase
        .from('events')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating event', description: error.message, variant: 'destructive' });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting event', description: error.message, variant: 'destructive' });
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: eventsQuery.refetch,
  };
}
