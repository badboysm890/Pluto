import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Compass, Star, BookOpen, Users, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Star, label: 'Featured', path: '/featured' },
    { icon: BookOpen, label: 'Learn', path: '/learn' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-16 backdrop-blur-md bg-black/30 border-r border-gray-800 z-20">
      <div className="flex flex-col items-center py-4 space-y-8">
        {menuItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={label}
              to={path}
              className={`p-3 rounded-lg hover:bg-gray-800 transition-colors group relative ${
                isActive ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="absolute left-14 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60]">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;