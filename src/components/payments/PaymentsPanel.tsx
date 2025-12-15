import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, CreditCard, TrendingUp } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { RecordPaymentDialog } from './RecordPaymentDialog';
import { format } from 'date-fns';

const PAYMENT_TYPE_COLORS: Record<string, string> = {
  tuition: 'bg-secondary',
  partial: 'bg-primary/20 text-primary',
  entrance_fee: 'bg-chart-1/20 text-chart-1',
  event: 'bg-accent text-accent-foreground',
};

export function PaymentsPanel() {
  const { payments, isLoading, getFinancialSummary } = usePayments();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const summary = getFinancialSummary();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Payments
        </h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-secondary" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalCollected.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">{summary.paymentCount} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Discounts Given</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalDiscounts.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">All Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">{payments.length} total payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Discount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No payments recorded yet
                  </TableCell>
                </TableRow>
              ) : (
                payments.slice(0, 50).map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(new Date(payment.payment_date), 'PP')}</TableCell>
                    <TableCell className="font-medium">{payment.student?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge className={PAYMENT_TYPE_COLORS[payment.payment_type] || 'bg-muted'}>
                        {payment.payment_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.group?.name || '-'}</TableCell>
                    <TableCell className="text-right font-medium">${Number(payment.amount).toFixed(2)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {payment.discount_applied > 0 ? `-$${Number(payment.discount_applied).toFixed(2)}` : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RecordPaymentDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}
