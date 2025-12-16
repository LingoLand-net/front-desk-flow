import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useGroups } from '@/hooks/useGroups';
import { EventType } from '@/types/database';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';

const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: 'holiday', label: 'Holiday', color: 'bg-green-500/50 text-destructive' },
  { value: 'extra_class', label: 'Extra Class', color: 'bg-secondary/70 text-secondary-foreground' },
  { value: 'rescheduled', label: 'Rescheduled', color: 'bg-primary/35 text-primary' },
  { value: 'workshop', label: 'Workshop', color: 'bg-accent/70 text-accent-foreground' },
  { value: 'exam', label: 'Exam', color: 'bg-red-500/50 text-foreground/85' },
  { value: 'open_day', label: 'Open Day', color: 'bg-blue-200 text-chart-1' },
];

export function EventsPanel() {
  const { events, createEvent, updateEvent, deleteEvent } = useEvents();
  const { groups } = useGroups();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    event_type: 'holiday' as EventType,
    event_date: '',
    start_time: '',
    end_time: '',
    group_id: 'all',
    is_paid: false,
    fee_amount: 0,
    affects_sessions: false,
    notes: '',
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (date: Date) => {
    return events.filter((event: any) => isSameDay(new Date(event.event_date), date));
  };

  const getGroupsForDay = (date: Date) => {
    const dayName = format(date, 'EEEE');
    return groups.filter((g: any) => g.is_active !== false && !g.is_paused && Array.isArray(g.schedule_days) && g.schedule_days.includes(dayName));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setFormData(prev => ({ ...prev, event_date: format(date, 'yyyy-MM-dd') }));
    setEditingEvent(null);
    setShowAddDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.event_date) return;

    const payload = {
      title: formData.title,
      event_type: formData.event_type,
      event_date: formData.event_date,
      start_time: formData.start_time || undefined,
      end_time: formData.end_time || undefined,
      group_id: !formData.group_id || formData.group_id === 'all' ? undefined : formData.group_id,
      is_paid: formData.is_paid,
      fee_amount: formData.fee_amount,
      affects_sessions: formData.affects_sessions,
      notes: formData.notes || undefined,
    };

    if (editingEvent) {
      await updateEvent.mutateAsync({ id: editingEvent.id, ...payload });
    } else {
      await createEvent.mutateAsync(payload);
    }

    setFormData({
      title: '',
      event_type: 'holiday',
      event_date: '',
      start_time: '',
      end_time: '',
      group_id: 'all',
      is_paid: false,
      fee_amount: 0,
      affects_sessions: false,
      notes: '',
    });
    setShowAddDialog(false);
    setEditingEvent(null);
  };

  const getEventColor = (type: EventType) => {
    return EVENT_TYPES.find(t => t.value === type)?.color || 'bg-muted';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Events & Calendar</h2>
        <Button onClick={() => { setSelectedDate(format(new Date(), 'yyyy-MM-dd')); setFormData(prev => ({ ...prev, event_date: format(new Date(), 'yyyy-MM-dd') })); setShowAddDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {format(currentMonth, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              Prev
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              Next
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-foreground/70">
                {day}
              </div>
            ))}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}
            {daysInMonth.map(date => {
              const dayEvents = getEventsForDay(date);
              return (
                <div
                  key={date.toISOString()}
                  onClick={() => handleDayClick(date)}
                  className={`
                    min-h-24 p-2 border rounded-lg cursor-pointer transition-colors
                    bg-muted/40 hover:bg-muted/70 border-border/60
                    ${isToday(date) ? 'bg-primary/20 border-primary/60' : ''}
                    ${!isSameMonth(date, currentMonth) ? 'opacity-50' : ''}
                  `}
                >
                  <div className={`text-sm font-medium ${isToday(date) ? 'text-primary' : 'text-foreground/80'}`}>
                    {format(date, 'd')}
                  </div>
                  <div className="space-y-1 mt-1">
                    {dayEvents.slice(0, 2).map((event: any) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded truncate ${getEventColor(event.event_type)} cursor-pointer ring-1 ring-border/40`}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open edit dialog prefilled
                          setEditingEvent(event);
                          setFormData({
                            title: event.title || '',
                            event_type: event.event_type,
                            event_date: format(new Date(event.event_date), 'yyyy-MM-dd'),
                            start_time: event.start_time || '',
                            end_time: event.end_time || '',
                            group_id: event.group_id || 'all',
                            is_paid: !!event.is_paid,
                            fee_amount: Number(event.fee_amount || 0),
                            affects_sessions: !!event.affects_sessions,
                            notes: event.notes || '',
                          });
                          setShowAddDialog(true);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {/* Active group schedules */}
                    {getGroupsForDay(date).slice(0, 2).map((g: any) => (
                      <div
                        key={`g-${g.id}`}
                        className="text-[11px] px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground truncate ring-1 ring-border/40"
                      >
                        {g.name}{g.schedule_time ? ` @ ${g.schedule_time}` : ''}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-foreground/70">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.filter((e: any) => new Date(e.event_date) >= new Date()).length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming events</p>
          ) : (
            <div className="space-y-2">
              {events
                .filter((e: any) => new Date(e.event_date) >= new Date())
                .slice(0, 10)
                .map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/60 border border-border/60">
                    <div className="flex items-center gap-3">
                      <Badge className={getEventColor(event.event_type)}>
                        {EVENT_TYPES.find(t => t.value === event.event_type)?.label}
                      </Badge>
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-foreground/75">
                          {format(new Date(event.event_date), 'PP')}
                          {event.start_time && ` at ${event.start_time}`}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteEvent.mutate(event.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Event title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select 
                  value={formData.event_type} 
                  onValueChange={(value: EventType) => setFormData({ ...formData, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Group (optional)</Label>
              <Select 
                value={formData.group_id} 
                onValueChange={(value) => setFormData({ ...formData, group_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All groups</SelectItem>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is_paid"
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_paid: !!checked })}
                />
                <Label htmlFor="is_paid">Paid Event</Label>
              </div>
              {formData.is_paid && (
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.fee_amount}
                  onChange={(e) => setFormData({ ...formData, fee_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="Fee amount"
                  className="w-32"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox 
                id="affects_sessions"
                checked={formData.affects_sessions}
                onCheckedChange={(checked) => setFormData({ ...formData, affects_sessions: !!checked })}
              />
              <Label htmlFor="affects_sessions">Counts as a session</Label>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
                {editingEvent ? (updateEvent.isPending ? 'Saving...' : 'Save Changes') : (createEvent.isPending ? 'Adding...' : 'Add Event')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
