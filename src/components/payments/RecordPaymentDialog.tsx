import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStudents } from '@/hooks/useStudents';
import { useGroups } from '@/hooks/useGroups';
import { usePayments } from '@/hooks/usePayments';
import { useDiscounts } from '@/hooks/useDiscounts';
import { PaymentType } from '@/types/database';

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedStudentId?: string;
}

export function RecordPaymentDialog({ open, onOpenChange, preSelectedStudentId }: RecordPaymentDialogProps) {
  const { students } = useStudents();
  const { groups } = useGroups();
  const { createPayment } = usePayments();
  const { calculateDiscount } = useDiscounts();

  const [formData, setFormData] = useState({
    student_id: '',
    group_id: '',
    payment_type: 'tuition' as PaymentType,
    amount: 0,
    sessions_purchased: 0,
    notes: '',
  });

  const [calculatedAmount, setCalculatedAmount] = useState({ 
    originalAmount: 0, 
    discountAmount: 0, 
    finalAmount: 0 
  });

  useEffect(() => {
    if (preSelectedStudentId) {
      setFormData(prev => ({ ...prev, student_id: preSelectedStudentId }));
    }
  }, [preSelectedStudentId]);

  useEffect(() => {
    if (formData.student_id && formData.amount > 0) {
      const student = students.find(s => s.id === formData.student_id);
      if (student?.discounts) {
        const result = calculateDiscount(formData.amount, student.discounts);
        setCalculatedAmount(result);
      } else {
        setCalculatedAmount({ 
          originalAmount: formData.amount, 
          discountAmount: 0, 
          finalAmount: formData.amount 
        });
      }
    }
  }, [formData.student_id, formData.amount, students, calculateDiscount]);

  const selectedStudent = students.find(s => s.id === formData.student_id);
  const studentGroups = selectedStudent?.groups?.filter(g => g.is_active).map(sg => sg.group) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id || formData.amount <= 0) return;

    // Guard: prevent charging entrance fee twice
    if (formData.payment_type === 'entrance_fee' && selectedStudent?.entrance_fee_paid) {
      alert(`⚠️ Student "${selectedStudent.name}" has already paid the entrance fee. This charge is not allowed.`);
      return;
    }

    await createPayment.mutateAsync({
      student_id: formData.student_id,
      group_id: formData.payment_type === 'tuition' ? formData.group_id || undefined : undefined,
      payment_type: formData.payment_type,
      amount: calculatedAmount.finalAmount,
      original_amount: calculatedAmount.originalAmount,
      discount_applied: calculatedAmount.discountAmount,
      sessions_purchased: formData.payment_type === 'tuition' ? formData.sessions_purchased : 0,
      notes: formData.notes || undefined,
    });

    setFormData({
      student_id: '',
      group_id: '',
      payment_type: 'tuition',
      amount: 0,
      sessions_purchased: 0,
      notes: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Student *</Label>
            <Select 
              value={formData.student_id} 
              onValueChange={(value) => setFormData({ ...formData, student_id: value, group_id: '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.filter(s => s.status === 'active').map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Payment Type *</Label>
            <Select 
              value={formData.payment_type} 
              onValueChange={(value: PaymentType) => setFormData({ ...formData, payment_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tuition">Tuition</SelectItem>
                <SelectItem value="partial">Partial Payment</SelectItem>
                <SelectItem value="entrance_fee">Entrance Fee</SelectItem>
                <SelectItem value="event">Event / Workshop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.payment_type === 'tuition' && studentGroups.length > 0 && (
            <>
              <div className="space-y-2">
                <Label>Group</Label>
                <Select 
                  value={formData.group_id} 
                  onValueChange={(value) => setFormData({ ...formData, group_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sessions Purchased</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.sessions_purchased}
                  onChange={(e) => setFormData({ ...formData, sessions_purchased: parseInt(e.target.value) || 0 })}
                />
              </div>
            </>
          )}

          {formData.payment_type === 'entrance_fee' && selectedStudent?.entrance_fee_paid && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              ✗ {selectedStudent.name} has already paid the entrance fee.
            </div>
          )}

          <div className="space-y-2">
            <Label>Amount *</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {calculatedAmount.discountAmount > 0 && (
            <div className="p-3 rounded-lg bg-secondary/20 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Original Amount:</span>
                <span>${calculatedAmount.originalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-primary">
                <span>Discount Applied:</span>
                <span>-${calculatedAmount.discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Final Amount:</span>
                <span>${calculatedAmount.finalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Payment notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPayment.isPending || !formData.student_id || formData.amount <= 0}>
              {createPayment.isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
