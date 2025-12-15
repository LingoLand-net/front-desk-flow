import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, BookOpen, CreditCard, UserCheck, Percent, DollarSign, Plus, Trash2 } from 'lucide-react';
import { StudentWithDetails, DiscountType, AttendanceStatus } from '@/types/database';
import { useStudents } from '@/hooks/useStudents';
import { useGroups } from '@/hooks/useGroups';
import { useDiscounts } from '@/hooks/useDiscounts';
import { useStudentGroups } from '@/hooks/useStudentGroups';
import { format } from 'date-fns';

interface StudentDrawerProps {
  student: StudentWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDrawer({ student, open, onOpenChange }: StudentDrawerProps) {
  const { updateStudent } = useStudents();
  const { groups } = useGroups();
  const { addDiscount, removeDiscount } = useDiscounts();
  const { enrollStudent, unenrollStudent } = useStudentGroups();
  
  const [newDiscount, setNewDiscount] = useState({
    type: 'special' as DiscountType,
    isPercentage: true,
    value: 0,
    notes: '',
  });
  const [selectedGroupToEnroll, setSelectedGroupToEnroll] = useState<string>('');

  if (!student) return null;

  const activeGroups = student.groups?.filter(g => g.is_active) || [];
  const activeDiscounts = student.discounts?.filter(d => d.is_active) || [];
  const enrolledGroupIds = activeGroups.map(g => g.group_id);
  const availableGroups = groups.filter(g => !enrolledGroupIds.includes(g.id));

  const handleEnrollStudent = async () => {
    if (!selectedGroupToEnroll) return;
    await enrollStudent.mutateAsync({
      student_id: student.id,
      group_id: selectedGroupToEnroll,
    });
    setSelectedGroupToEnroll('');
  };

  const handleAddDiscount = async () => {
    if (newDiscount.value <= 0) return;
    await addDiscount.mutateAsync({
      student_id: student.id,
      discount_type: newDiscount.type,
      is_percentage: newDiscount.isPercentage,
      discount_value: newDiscount.value,
      notes: newDiscount.notes || undefined,
    });
    setNewDiscount({ type: 'special', isPercentage: true, value: 0, notes: '' });
  };

  const handlePayEntranceFee = async () => {
    await updateStudent.mutateAsync({
      id: student.id,
      entrance_fee_paid: true,
      entrance_fee_paid_date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {student.name}
          </SheetTitle>
          <div className="flex gap-2">
            <Badge className={student.status === 'active' ? 'bg-secondary' : student.status === 'paused' ? 'bg-primary/20' : 'bg-destructive/20'}>
              {student.status}
            </Badge>
            {!student.entrance_fee_paid && (
              <Badge variant="destructive">Entrance Fee Due</Badge>
            )}
          </div>
        </SheetHeader>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="info" className="text-xs"><User className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="groups" className="text-xs"><BookOpen className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="discounts" className="text-xs"><Percent className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="attendance" className="text-xs"><UserCheck className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="payments" className="text-xs"><CreditCard className="h-4 w-4" /></TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{student.phone || '-'}</span>
                  <span className="text-muted-foreground">WhatsApp:</span>
                  <span>{student.whatsapp || '-'}</span>
                  <span className="text-muted-foreground">Enrolled:</span>
                  <span>{student.enrollment_date ? format(new Date(student.enrollment_date), 'PP') : '-'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Entrance Fee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span>${student.entrance_fee_amount?.toFixed(2) || '0.00'}</span>
                  <span className="text-muted-foreground">Status:</span>
                  <span className={student.entrance_fee_paid ? 'text-secondary' : 'text-destructive'}>
                    {student.entrance_fee_paid ? 'Paid' : 'Unpaid'}
                  </span>
                  {student.entrance_fee_paid && (
                    <>
                      <span className="text-muted-foreground">Paid on:</span>
                      <span>{student.entrance_fee_paid_date ? format(new Date(student.entrance_fee_paid_date), 'PP') : '-'}</span>
                    </>
                  )}
                </div>
                {!student.entrance_fee_paid && student.entrance_fee_amount && student.entrance_fee_amount > 0 && (
                  <Button size="sm" onClick={handlePayEntranceFee} className="w-full mt-2">
                    Mark Entrance Fee as Paid
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-secondary/20">
                    <div className="text-2xl font-bold">{student.remainingSessions ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Sessions Left</div>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <div className="text-2xl font-bold">{student.attendancePercentage ?? 0}%</div>
                    <div className="text-xs text-muted-foreground">Attendance</div>
                  </div>
                  <div className="p-3 rounded-lg bg-accent">
                    <div className="text-2xl font-bold">${(student.totalPaid || 0).toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">Total Paid</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Enrolled Groups</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {activeGroups.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Not enrolled in any groups</p>
                ) : (
                  activeGroups.map(sg => (
                    <div key={sg.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">{sg.group.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {sg.sessions_used} / {sg.sessions_total} sessions used
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => unenrollStudent.mutate({ studentId: student.id, groupId: sg.group_id })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {availableGroups.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Enroll in Group</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Select value={selectedGroupToEnroll} onValueChange={setSelectedGroupToEnroll}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGroups.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} - {group.language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleEnrollStudent} disabled={!selectedGroupToEnroll}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Discounts Tab */}
          <TabsContent value="discounts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active Discounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {activeDiscounts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No active discounts</p>
                ) : (
                  activeDiscounts.map(discount => (
                    <div key={discount.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium capitalize">{discount.discount_type.replace('_', ' ')}</div>
                        <div className="text-sm text-muted-foreground">
                          {discount.is_percentage ? `${discount.discount_value}%` : `$${discount.discount_value}`}
                          {discount.notes && ` - ${discount.notes}`}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => removeDiscount.mutate(discount.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Add Discount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={newDiscount.type} 
                    onValueChange={(value: DiscountType) => setNewDiscount({ ...newDiscount, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="two_groups">Two Groups Enrollment</SelectItem>
                      <SelectItem value="family">Family Discount</SelectItem>
                      <SelectItem value="special">Special Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newDiscount.value}
                      onChange={(e) => setNewDiscount({ ...newDiscount, value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pb-2">
                    <Checkbox 
                      id="isPercentage"
                      checked={newDiscount.isPercentage}
                      onCheckedChange={(checked) => setNewDiscount({ ...newDiscount, isPercentage: !!checked })}
                    />
                    <Label htmlFor="isPercentage">%</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={newDiscount.notes}
                    onChange={(e) => setNewDiscount({ ...newDiscount, notes: e.target.value })}
                    placeholder="Optional notes..."
                  />
                </div>
                
                <Button onClick={handleAddDiscount} className="w-full" disabled={newDiscount.value <= 0}>
                  Add Discount
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Attendance History</CardTitle>
              </CardHeader>
              <CardContent>
                {!student.attendance || student.attendance.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No attendance records</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.attendance.slice(0, 20).map(record => (
                        <TableRow key={record.id}>
                          <TableCell>{format(new Date(record.session_date), 'PP')}</TableCell>
                          <TableCell>
                            <Badge className={
                              record.status === 'present' ? 'bg-secondary' : 
                              record.status === 'absent' ? 'bg-destructive/20 text-destructive' : 
                              'bg-primary/20 text-primary'
                            }>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{record.reason || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {!student.payments || student.payments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No payment records</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.payments.map(payment => (
                        <TableRow key={payment.id}>
                          <TableCell>{format(new Date(payment.payment_date), 'PP')}</TableCell>
                          <TableCell className="capitalize">{payment.payment_type.replace('_', ' ')}</TableCell>
                          <TableCell className="text-right font-medium">${Number(payment.amount).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
