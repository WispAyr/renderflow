import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Settings, Moon, Sun } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/clients': 'Clients',
  '/content': 'Content Library',
  '/templates': 'Templates',
  '/render': 'Render Queue',
  '/screens': 'Screens',
  '/playlists': 'Playlists',
};

export default function Header() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const title = pageTitles[location.pathname] || 'RenderFlow';

  return (
    <header className="h-16 bg-dark-300 border-b border-dark-50 flex items-center justify-between px-6">
      {/* Left: Page Title */}
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          {searchOpen ? (
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search..."
                className="input w-64 pr-10"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
              <Search className="absolute right-3 w-4 h-4 text-gray-500" />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="btn-ghost p-2 rounded-lg"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <button className="btn-ghost p-2 rounded-lg relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full" />
        </button>

        {/* Theme Toggle (visual only for now) */}
        <button className="btn-ghost p-2 rounded-lg">
          <Moon className="w-5 h-5" />
        </button>

        {/* Settings */}
        <button className="btn-ghost p-2 rounded-lg">
          <Settings className="w-5 h-5" />
        </button>

        {/* User Avatar */}
        <div className="ml-2 w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-400 text-sm font-bold cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
}
