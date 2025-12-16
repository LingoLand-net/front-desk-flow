import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList } from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { format } from 'date-fns';

const ACTION_COLORS: Record<string, string> = {
  'Student created': 'bg-green-500 text-green-900',
  'Student updated': 'bg-blue-500 text-blue-900',
  'Student archived': 'bg-red-500 text-red-900',
  'Payment recorded': 'bg-emerald-500 text-emerald-900',
  'Attendance recorded': 'bg-purple-500 text-purple-900',
  'Attendance edited': 'bg-amber-500 text-amber-900',
  'Group created': 'bg-red-500 text-cyan-900',
  'Group updated': 'bg-indigo-500 text-indigo-900',
  'Discount added': 'bg-pink-500 text-pink-900',
  'Discount removed': 'bg-orange-500 text-orange-900',
  'Event created': 'bg-violet-500 text-violet-900',
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
                  <Badge className={ACTION_COLORS[log.action] || 'bg-purple-100 text-purple-900'}>
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
