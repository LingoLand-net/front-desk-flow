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
    getFinancialSummary,
    refetch: paymentsQuery.refetch,
  };
}
