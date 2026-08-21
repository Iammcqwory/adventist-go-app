import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Clock, 
  CheckSquare, 
  Book, 
  Users, 
  Smartphone, 
  MapPin, 
  PenTool, 
  Settings,
  Sun,
  Moon,
  Music,
  GraduationCap,
  BookOpen,
  Flame,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../contexts/ThemeContext';

const navItems = [
  { path: '/', icon: Clock, label: 'Countdown' },
  { path: '/reels', icon: Flame, label: 'Reels' },
  { path: '/verse-master', icon: Trophy, label: 'Verse Master' },
  { path: '/prep', icon: CheckSquare, label: 'Prep' },
  { path: '/devotionals', icon: Book, label: 'Study' },
  { path: '/sabbath-school', icon: GraduationCap, label: 'SS Lessons' },
  { path: '/bible', icon: BookOpen, label: 'Bible' },
  { path: '/hymns', icon: Music, label: 'Hymns' },
  { path: '/family', icon: Users, label: 'Family' },
  { path: '/detox', icon: Smartphone, label: 'Detox' },
  { path: '/churches', icon: MapPin, label: 'Churches' },
  { path: '/journal', icon: PenTool, label: 'Journal' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Navigation() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-slate-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-800 dark:text-white">Adventist Go</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="ml-2 text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-slate-600 dark:text-gray-300"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            <select
              value={location.pathname}
              onChange={(e) => window.location.href = e.target.value}
              className="bg-transparent border-none text-slate-600 dark:text-gray-300 font-medium"
            >
              {navItems.map(({ path, label }) => (
                <option key={path} value={path}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}
