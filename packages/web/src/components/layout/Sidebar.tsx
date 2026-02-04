import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Layout,
  Play,
  Monitor,
  ListVideo,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Content', href: '/content', icon: FileText },
  { name: 'Templates', href: '/templates', icon: Layout },
  { name: 'Render', href: '/render', icon: Play },
  { name: 'Screens', href: '/screens', icon: Monitor },
  { name: 'Playlists', href: '/playlists', icon: ListVideo },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-dark-300 border-r border-dark-50 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-dark-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">RenderFlow</h1>
            <p className="text-xs text-gray-500">Studio</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'sidebar-item',
                isActive && 'active'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center text-gold-500 text-sm font-semibold">
            RF
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">RenderFlow</p>
            <p className="text-xs text-gray-500">v0.1.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
