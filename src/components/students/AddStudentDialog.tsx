import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useStudents } from '@/hooks/useStudents';
import { useGroups } from '@/hooks/useGroups';
import { useStudentGroups } from '@/hooks/useStudentGroups';
import { usePayments } from '@/hooks/usePayments';

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStudentDialog({ open, onOpenChange }: AddStudentDialogProps) {
  const { createStudent } = useStudents();
  const { groups } = useGroups();
  const { enrollStudent } = useStudentGroups();
  const { createPayment } = usePayments();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    entrance_fee_amount: 0,
    notes: '',
  });
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [paidGroups, setPaidGroups] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSubmitting(true);
      const student = await createStudent.mutateAsync({
        name: formData.name.trim(),
        phone: formData.phone || undefined,
        whatsapp: formData.whatsapp || undefined,
        entrance_fee_amount: formData.entrance_fee_amount,
        notes: formData.notes || undefined,
      });

      if (student?.id && selectedGroupIds.length > 0) {
        // Enroll student in selected groups first
        await Promise.all(
          selectedGroupIds.map((gid) =>
            enrollStudent.mutateAsync({ student_id: student.id, group_id: gid })
          )
        );

        // Create payments for groups marked as paid
        const selectedGroups = groups.filter((g) => selectedGroupIds.includes(g.id));
        const paymentsToCreate = selectedGroups
          .filter((g) => paidGroups[g.id])
          .map((g) => ({
            student_id: student.id,
            group_id: g.id,
            payment_type: 'tuition' as const,
            amount: Number((g.sessions_per_cycle || 0) * (g.session_fee || 0)),
            sessions_purchased: g.sessions_per_cycle || 0,
          }))
          .filter((p) => p.amount > 0 && p.sessions_purchased > 0);

        if (paymentsToCreate.length > 0) {
          await Promise.all(paymentsToCreate.map((p) => createPayment.mutateAsync(p)));
        }
      }

      setFormData({ name: '', phone: '', whatsapp: '', entrance_fee_amount: 0, notes: '' });
      setSelectedGroupIds([]);
      setPaidGroups({});
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:min-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Student name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Enroll in Groups (optional)</Label>
            <div className="max-h-40 overflow-y-auto rounded-md border p-2 space-y-1 bg-muted/30">
              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground px-1">No active groups available</p>
              ) : (
                groups.map((g) => {
                  const checked = selectedGroupIds.includes(g.id);
                  return (
                    <label key={g.id} className="flex items-center gap-2 text-sm p-1 rounded hover:bg-muted/50 cursor-pointer">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) => {
                          setSelectedGroupIds((prev) => {
                            const next = c ? [...prev, g.id] : prev.filter((id) => id !== g.id);
                            // If group is deselected, also clear its paid state
                            if (!c && paidGroups[g.id]) {
                              setPaidGroups((pg) => {
                                const { [g.id]: _, ...rest } = pg;
                                return rest;
                              });
                            }
                            return next;
                          });
                        }}
                      />
                      <span className="flex-1 truncate">{g.name}{g.language ? ` - ${g.language}` : ''}</span>
                      {Array.isArray(g.schedule_days) && g.schedule_days.length > 0 && (
                        <span className="text-xs text-muted-foreground">{g.schedule_days.join(', ')}{g.schedule_time ? ` @ ${g.schedule_time}` : ''}</span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {selectedGroupIds.length > 0 && (
            <div className="space-y-2">
              <Label>Group Tuition</Label>
              <div className="rounded-md border bg-muted/20 divide-y">
                {groups.filter(g => selectedGroupIds.includes(g.id)).map((g) => {
                  const amount = Number((g.sessions_per_cycle || 0) * (g.session_fee || 0));
                  const sessions = g.sessions_per_cycle || 0;
                  const isPaid = !!paidGroups[g.id];
                  return (
                    <div key={`fee-${g.id}`} className="flex items-center justify-between p-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{g.name}</div>
                        <div className="text-xs text-muted-foreground">{sessions} sessions × ${Number(g.session_fee || 0).toFixed(2)}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium whitespace-nowrap">${amount.toFixed(2)}</div>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={isPaid}
                            onCheckedChange={(c) => setPaidGroups((pg) => ({ ...pg, [g.id]: !!c }))}
                          />
                          <span>Mark paid</span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end text-sm">
                <span className="text-muted-foreground mr-2">Total selected tuition:</span>
                <span className="font-medium">$
                  {groups.filter(g => selectedGroupIds.includes(g.id))
                    .reduce((sum, g) => sum + Number((g.sessions_per_cycle || 0) * (g.session_fee || 0)), 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Parent</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="WhatsApp number"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="entrance_fee">Entrance Fee Amount</Label>
            <Input
              id="entrance_fee"
              type="number"
              min="0"
              step="0.01"
              value={formData.entrance_fee_amount}
              onChange={(e) => setFormData({ ...formData, entrance_fee_amount: parseFloat(e.target.value) || 0 })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createStudent.isPending || submitting}>
              {createStudent.isPending || submitting ? 'Adding...' : 'Add Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
