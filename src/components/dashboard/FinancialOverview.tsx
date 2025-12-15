import { DollarSign, TrendingUp, Percent, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FinancialOverviewProps {
  totalCollected: number;
  pendingPayments: number;
  totalDiscounts: number;
  paymentCount: number;
}

export function FinancialOverview({ 
  totalCollected, 
  pendingPayments, 
  totalDiscounts,
  paymentCount 
}: FinancialOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Financial Overview (This Month)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-secondary/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              Total Collected
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${totalCollected.toFixed(2)}
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-primary/10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              Pending
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${pendingPayments.toFixed(2)}
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-accent">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Percent className="h-4 w-4" />
              Discounts Given
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${totalDiscounts.toFixed(2)}
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Receipt className="h-4 w-4" />
              Transactions
            </div>
            <div className="text-2xl font-bold text-foreground">
              {paymentCount}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
