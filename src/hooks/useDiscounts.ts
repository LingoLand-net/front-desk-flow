import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DiscountType } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useDiscounts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addDiscount = useMutation({
    mutationFn: async (data: {
      student_id: string;
      discount_type: DiscountType;
      is_percentage: boolean;
      discount_value: number;
      linked_student_id?: string;
      notes?: string;
    }) => {
      const { data: discount, error } = await supabase
        .from('discounts')
        .insert(data)
        .select()
        .single();
      if (error) throw error;

      await supabase.from('activity_logs').insert({
        action: 'Discount added',
        entity_type: 'discount',
        entity_id: discount.id,
        new_value: data as any,
      });

      return discount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Discount added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error adding discount', description: error.message, variant: 'destructive' });
    },
  });

  const removeDiscount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('discounts')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;

      await supabase.from('activity_logs').insert({
        action: 'Discount removed',
        entity_type: 'discount',
        entity_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Discount removed successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error removing discount', description: error.message, variant: 'destructive' });
    },
  });

  const calculateDiscount = (
    originalAmount: number,
    discounts: { is_percentage: boolean; discount_value: number; is_active: boolean }[]
  ) => {
    const activeDiscounts = discounts.filter(d => d.is_active);
    let totalDiscount = 0;

    for (const discount of activeDiscounts) {
      if (discount.is_percentage) {
        totalDiscount += (originalAmount * discount.discount_value) / 100;
      } else {
        totalDiscount += discount.discount_value;
      }
    }

    return {
      originalAmount,
      discountAmount: Math.min(totalDiscount, originalAmount),
      finalAmount: Math.max(0, originalAmount - totalDiscount),
    };
  };

  return {
    addDiscount,
    removeDiscount,
    calculateDiscount,
  };
}
