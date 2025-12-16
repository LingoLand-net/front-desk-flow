import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Clock, Pause, Play, Pencil, Trash2 } from 'lucide-react';
import { useGroups } from '@/hooks/useGroups';
import { useTeachers } from '@/hooks/useTeachers';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function GroupsPanel() {
  const { groups, createGroup, updateGroup, deleteGroup, hardDeleteGroup } = useGroups();
  const { teachers } = useTeachers();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [groupToDelete, setGroupToDelete] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    language: '',
    teacher_id: 'none',
    schedule_days: [] as string[],
    schedule_time: '',
    sessions_per_cycle: 8,
    session_fee: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      language: '',
      teacher_id: 'none',
      schedule_days: [],
      schedule_time: '',
      sessions_per_cycle: 8,
      session_fee: 0,
    });
    setEditingGroup(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.language) return;

    if (editingGroup) {
      await updateGroup.mutateAsync({
        id: editingGroup.id,
        ...formData,
        teacher_id: formData.teacher_id === 'none' ? undefined : formData.teacher_id,
      });
    } else {
      await createGroup.mutateAsync({
        ...formData,
        teacher_id: formData.teacher_id === 'none' ? undefined : formData.teacher_id,
      });
    }

    resetForm();
    setShowAddDialog(false);
  };

  const openEditDialog = (group: any) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      language: group.language,
      teacher_id: group.teacher_id || 'none',
      schedule_days: group.schedule_days || [],
      schedule_time: group.schedule_time || '',
      sessions_per_cycle: group.sessions_per_cycle,
      session_fee: group.session_fee,
    });
    setShowAddDialog(true);
  };

  const togglePause = async (group: any) => {
    await updateGroup.mutateAsync({
      id: group.id,
      is_paused: !group.is_paused,
    });
  };

  const handleDeleteConfirmed = async () => {
    if (!groupToDelete) return;
    await deleteGroup.mutateAsync(groupToDelete.id);
    setGroupToDelete(null);
  };

  const handleHardDelete = async () => {
    if (!groupToDelete) return;
    await hardDeleteGroup.mutateAsync(groupToDelete.id);
    setGroupToDelete(null);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      schedule_days: prev.schedule_days.includes(day)
        ? prev.schedule_days.filter(d => d !== day)
        : [...prev.schedule_days, day],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Groups</h2>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(group => (
          <Card key={group.id} className={group.is_paused ? 'opacity-60' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(group)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={() => togglePause(group)}
                  >
                    {group.is_paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={() => setGroupToDelete(group)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{group.language}</Badge>
                {group.is_paused && <Badge variant="secondary">Paused</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.teacher && (
                <div className="text-sm text-muted-foreground">
                  Teacher: <span className="text-foreground">{group.teacher.name}</span>
                </div>
              )}
              {group.schedule_days && group.schedule_days.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {group.schedule_days.join(', ')} {group.schedule_time && `@ ${group.schedule_time}`}
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4" />
                  {group.studentCount || 0} students
                </div>
                <div className="text-sm text-muted-foreground">
                  {group.sessions_per_cycle} sessions/cycle
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {groups.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              No groups yet. Create your first group to get started.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGroup ? 'Edit Group' : 'Add New Group'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Group A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Language *</Label>
                <Input
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  placeholder="English"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select 
                value={formData.teacher_id} 
                onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No teacher assigned</SelectItem>
                  {teachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Schedule Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <Badge
                    key={day}
                    variant={formData.schedule_days.includes(day) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleDay(day)}
                  >
                    {day.slice(0, 3)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  value={formData.schedule_time}
                  onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                  placeholder="10:00 AM"
                />
              </div>
              <div className="space-y-2">
                <Label>Sessions/Cycle</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.sessions_per_cycle}
                  onChange={(e) => setFormData({ ...formData, sessions_per_cycle: parseInt(e.target.value) || 8 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Session Fee</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.session_fee}
                onChange={(e) => setFormData({ ...formData, session_fee: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createGroup.isPending || updateGroup.isPending}>
                {editingGroup ? 'Save Changes' : 'Create Group'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              {groupToDelete ? (
                <>
                  Choose how you want to remove "{groupToDelete.name}":
                  <br />
                  This group currently has <b>{groupToDelete.studentCount || 0}</b> active students.
                  <br />
                  <b>Deactivate</b>: Hides the group and disables enrollments (keeps data).
                  <br />
                  <b>Delete Permanently</b>: Removes the group row. Database cascades will delete enrollments and attendance; payments will remain but unlink from the group.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setGroupToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed} className="bg-muted text-foreground hover:bg-muted/80">Deactivate</AlertDialogAction>
            <AlertDialogAction onClick={handleHardDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Permanently</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
