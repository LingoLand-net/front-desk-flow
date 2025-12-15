import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList } from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { format } from 'date-fns';

const ACTION_COLORS: Record<string, string> = {
  'Student created': 'bg-secondary',
  'Student updated': 'bg-primary/20 text-primary',
  'Student archived': 'bg-destructive/20 text-destructive',
  'Payment recorded': 'bg-chart-1/20 text-chart-1',
  'Attendance recorded': 'bg-chart-2/20 text-chart-2',
  'Attendance edited': 'bg-chart-3/20 text-chart-3',
  'Group created': 'bg-secondary',
  'Group updated': 'bg-primary/20 text-primary',
  'Discount added': 'bg-accent text-accent-foreground',
  'Discount removed': 'bg-muted text-muted-foreground',
  'Event created': 'bg-chart-4/20 text-chart-4',
};

export function ActivityPanel() {
  const { logs, isLoading } = useActivityLogs(100);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Activity Log
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No activity recorded yet</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                  <Badge className={ACTION_COLORS[log.action] || 'bg-muted'}>
                    {log.action}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="text-muted-foreground capitalize">{log.entity_type}</span>
                    </div>
                    {log.new_value && typeof log.new_value === 'object' && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {Object.entries(log.new_value as Record<string, unknown>).slice(0, 3).map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.created_at), 'PP p')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
