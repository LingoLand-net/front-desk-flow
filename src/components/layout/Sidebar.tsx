import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Zap,
  GraduationCap,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  currentPath: string;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'students', label: 'Students', icon: Users, path: '/students' },
  { id: 'operations', label: 'Operations', icon: Zap, path: '/ops' },
];

export function Sidebar({ activeTab, currentPath }: SidebarProps) {
  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-white/20 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center shrink-0">
        <img src="/logo.png" alt="LingoVille logo" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
        <h1 className="text-lg md:text-2xl font-bold text-sidebar-foreground leading-tight truncate">LingoVille</h1>
        <p className="text-xs md:text-sm text-accent truncate">Admin Dashboard</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors h-11',
              currentPath.startsWith(item.path)
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/20">
        <p className="text-xs text-white/70 text-center">
          © 2024 Language Center
        </p>
      </div>
    </aside>
  );
}
