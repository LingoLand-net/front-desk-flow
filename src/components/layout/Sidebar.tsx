import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  CreditCard, 
  UsersRound, 
  Calendar, 
  ClipboardList,
  GraduationCap,
  FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: UserCheck },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'groups', label: 'Groups', icon: UsersRound },
  { id: 'teachers', label: 'Teachers', icon: GraduationCap },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'activity', label: 'Activity Log', icon: ClipboardList },
  { id: 'exports', label: 'Exports', icon: FileDown },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Language Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Front Desk Dashboard</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3 h-11',
              activeTab === item.id && 'bg-primary/10 text-primary hover:bg-primary/20'
            )}
            onClick={() => onTabChange(item.id)}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          © 2024 Language Center
        </p>
      </div>
    </aside>
  );
}
