import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Payment, PaymentType } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function usePayments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          student:students (id, name),
          group:groups (id, name)
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createPayment = useMutation({
    mutationFn: async (data: {
      student_id: string;
      group_id?: string;
      payment_type: PaymentType;
      amount: number;
      original_amount?: number;
      discount_applied?: number;
      sessions_purchased?: number;
      notes?: string;
    }) => {
      const { data: payment, error } = await supabase
        .from('payments')
        .insert(data)
        .select()
        .single();
      if (error) throw error;

      // If tuition payment, update sessions_total
      if (data.payment_type === 'tuition' && data.group_id && data.sessions_purchased) {
        const { data: existingSG } = await supabase
          .from('student_groups')
          .select('sessions_total')
          .eq('student_id', data.student_id)
          .eq('group_id', data.group_id)
          .single();

        if (existingSG) {
          await supabase
            .from('student_groups')
            .update({ sessions_total: existingSG.sessions_total + data.sessions_purchased })
            .eq('student_id', data.student_id)
            .eq('group_id', data.group_id);
        }
      }

      // If entrance fee, update student
      if (data.payment_type === 'entrance_fee') {
        await supabase
          .from('students')
          .update({ 
            entrance_fee_paid: true, 
            entrance_fee_paid_date: new Date().toISOString().split('T')[0] 
          })
          .eq('id', data.student_id);
      }

      await supabase.from('activity_logs').insert({
        action: 'Payment recorded',
        entity_type: 'payment',
        entity_id: payment.id,
        new_value: data as any,
      });

      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Payment recorded successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error recording payment', description: error.message, variant: 'destructive' });
    },
  });

  const updatePayment = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Payment> & { id: string }) => {
      // Fetch existing payment
      const { data: oldPayment } = await supabase
        .from('payments')
        .select()
        .eq('id', id)
        .single();

      const { data: payment, error } = await supabase
        .from('payments')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      // Adjust sessions if tuition payment changed
      try {
        if (oldPayment?.payment_type === 'tuition' && oldPayment.group_id && oldPayment.student_id && oldPayment.sessions_purchased > 0) {
          const { data: existingSG } = await supabase
            .from('student_groups')
            .select('sessions_total')
            .eq('student_id', oldPayment.student_id)
            .eq('group_id', oldPayment.group_id)
            .single();
          if (existingSG) {
            await supabase
              .from('student_groups')
              .update({ sessions_total: Math.max(0, existingSG.sessions_total - oldPayment.sessions_purchased) })
              .eq('student_id', oldPayment.student_id)
              .eq('group_id', oldPayment.group_id);
          }
        }

        if (payment?.payment_type === 'tuition' && payment.group_id && payment.student_id && payment.sessions_purchased > 0) {
          const { data: existingSG2 } = await supabase
            .from('student_groups')
            .select('sessions_total')
            .eq('student_id', payment.student_id)
            .eq('group_id', payment.group_id)
            .single();
          if (existingSG2) {
            await supabase
              .from('student_groups')
              .update({ sessions_total: existingSG2.sessions_total + payment.sessions_purchased })
              .eq('student_id', payment.student_id)
              .eq('group_id', payment.group_id);
          }
        }
      } catch (e) {
        // Best-effort session adjustment; continue even if not found
      }

      await supabase.from('activity_logs').insert({
        action: 'Payment updated',
        entity_type: 'payment',
        entity_id: payment.id,
        old_value: oldPayment as any,
        new_value: data as any,
      });

      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Payment updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating payment', description: error.message, variant: 'destructive' });
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      // Fetch existing payment for side effects and logging
      const { data: oldPayment } = await supabase
        .from('payments')
        .select()
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);
      if (error) throw error;

      // Reverse sessions if tuition
      try {
        if (oldPayment?.payment_type === 'tuition' && oldPayment.group_id && oldPayment.student_id && oldPayment.sessions_purchased > 0) {
          const { data: existingSG } = await supabase
            .from('student_groups')
            .select('sessions_total')
            .eq('student_id', oldPayment.student_id)
            .eq('group_id', oldPayment.group_id)
            .single();
          if (existingSG) {
            await supabase
              .from('student_groups')
              .update({ sessions_total: Math.max(0, existingSG.sessions_total - oldPayment.sessions_purchased) })
              .eq('student_id', oldPayment.student_id)
              .eq('group_id', oldPayment.group_id);
          }
        }
      } catch (e) {}

      await supabase.from('activity_logs').insert({
        action: 'Payment deleted',
        entity_type: 'payment',
        old_value: oldPayment as any,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Payment deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting payment', description: error.message, variant: 'destructive' });
    },
  });

  const getFinancialSummary = () => {
    const payments = paymentsQuery.data || [];
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const thisMonthPayments = payments.filter((p: any) => {
      const date = new Date(p.payment_date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    return {
      totalCollected: thisMonthPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0),
      totalDiscounts: thisMonthPayments.reduce((sum: number, p: any) => sum + Number(p.discount_applied || 0), 0),
      paymentCount: thisMonthPayments.length,
    };
  };

  return {
    payments: paymentsQuery.data || [],
    isLoading: paymentsQuery.isLoading,
    error: paymentsQuery.error,
    createPayment,
    updatePayment,
    deletePayment,
    getFinancialSummary,
    refetch: paymentsQuery.refetch,
  };
}
