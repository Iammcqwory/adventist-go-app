import React, { useState } from 'react';
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
  Trophy,
  ChevronDown,
  Menu,
  X,
  Compass,
  HeartHandshake,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '../contexts/ThemeContext';

interface NavGroup {
  label: string;
  icon: any;
  items: {
    path: string;
    label: string;
    description: string;
    icon: any;
    badge?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Prepare',
    icon: CheckSquare,
    items: [
      { path: '/prep', label: 'Prep Checklist', description: 'Weekly Sabbath preparation tasks', icon: CheckSquare },
      { path: '/detox', label: 'Digital Detox', description: 'Mindful screen time & Sabbath pause', icon: Smartphone },
    ],
  },
  {
    label: 'Study',
    icon: BookOpen,
    items: [
      { path: '/bible', label: 'Bible Lookup', description: 'Full-text scripture search & study', icon: BookOpen },
      { path: '/verse-master', label: 'Verse Master', description: 'Voice recitation memory game', icon: Trophy, badge: 'New' },
      { path: '/sabbath-school', label: 'SS Lessons', description: 'Quarterly daily study guides', icon: GraduationCap },
      { path: '/devotionals', label: 'Devotionals', description: 'Morning & evening reflections', icon: Book },
      { path: '/hymns', label: 'Hymnal', description: 'Audio & lyrics for 695 hymns', icon: Music },
    ],
  },
  {
    label: 'Community',
    icon: Users,
    items: [
      { path: '/family', label: 'Family Worship', description: 'Interactive ideas & templates', icon: Users },
      { path: '/churches', label: 'Church Finder', description: 'Locate Seventh-day Adventist churches', icon: MapPin },
      { path: '/journal', label: 'Spiritual Journal', description: 'Private Sabbath reflections', icon: PenTool },
    ],
  },
];

export function Navigation() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => item.path === location.pathname);
  };

  return (
    <>
      {/* Top Header */}
      <header className="bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-slate-200 dark:border-gray-800 sticky top-0 z-40 transition-colors w-full">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2.5 flex-shrink-0 group"
              aria-label="Adventist Go Home"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Adventist<span className="text-blue-600 dark:text-blue-400">Go</span>
                </span>
              </div>
            </Link>

            {/* Desktop Intent-Led Grouped Navigation */}
            <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
              {/* 1. Countdown / Home */}
              <Link
                to="/"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  location.pathname === '/'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Countdown</span>
              </Link>

              {/* 2. Watch (Reels) - Top-level priority */}
              <Link
                to="/reels"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  location.pathname === '/reels'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    : 'text-slate-600 dark:text-gray-300 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-gray-800'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Reels</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </Link>

              {/* 3. Grouped Dropdowns: Prepare, Study, Community */}
              {NAV_GROUPS.map((group) => {
                const isActive = isGroupActive(group);
                const isOpen = activeDropdown === group.label;

                return (
                  <div 
                    key={group.label} 
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(group.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800'
                      }`}
                      aria-expanded={isOpen}
                      aria-label={`${group.label} menu`}
                    >
                      <group.icon className="w-4 h-4" />
                      <span>{group.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Card */}
                    {isOpen && (
                      <div className="absolute left-0 top-full pt-1.5 w-64 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl p-2 space-y-1">
                          {group.items.map((item) => {
                            const isItemActive = location.pathname === item.path;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setActiveDropdown(null)}
                                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                                  isItemActive
                                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                    : 'hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200'
                                }`}
                              >
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 mt-0.5">
                                  <item.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold truncate">{item.label}</p>
                                    {item.badge && (
                                      <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0">
                                        {item.badge}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-400 dark:text-gray-400 line-clamp-1">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Utility Right Actions */}
            <div className="flex items-center space-x-2">
              <Link to="/settings" aria-label="Open Settings">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Settings"
                  className="h-9 w-9 p-0 rounded-xl text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                className="h-9 w-9 p-0 rounded-xl text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>

              {/* Mobile Hamburger Trigger */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                className="lg:hidden h-9 w-9 p-0 rounded-xl text-slate-600 dark:text-gray-300"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Full Navigation Sheet Modal */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-gray-800 bg-white/95 dark:bg-black/95 backdrop-blur-xl p-4 max-h-[80vh] overflow-y-auto space-y-6 animate-in slide-in-from-top duration-200">
            {/* Quick Links Row */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl flex items-center gap-2 text-sm font-bold ${
                  location.pathname === '/'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Countdown</span>
              </Link>
              <Link
                to="/reels"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl flex items-center gap-2 text-sm font-bold ${
                  location.pathname === '/reels'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Advent Reels</span>
              </Link>
            </div>

            {/* Categorized Links */}
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {group.label}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        location.pathname === item.path
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold'
                          : 'border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-200'
                      }`}
                    >
                      <item.icon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm">{item.label}</span>
                      {item.badge && (
                        <Badge className="ml-auto bg-amber-500 text-white text-[9px]">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Mobile Sticky Bottom Tab Bar (Fast switching on phones) */}
      <nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-lg border-t border-slate-200 dark:border-gray-800 px-3 py-1.5"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="flex items-center justify-around">
          <Link
            to="/"
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-all ${
              location.pathname === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
            }`}
            aria-label="Countdown Tab"
          >
            <Clock className="w-5 h-5" />
            <span className="mt-0.5">Countdown</span>
          </Link>

          <Link
            to="/reels"
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-all ${
              location.pathname === '/reels' ? 'text-amber-500' : 'text-slate-400'
            }`}
            aria-label="Reels Tab"
          >
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="mt-0.5">Reels</span>
          </Link>

          <Link
            to="/bible"
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-all ${
              location.pathname === '/bible' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
            }`}
            aria-label="Bible Tab"
          >
            <BookOpen className="w-5 h-5" />
            <span className="mt-0.5">Bible</span>
          </Link>

          <Link
            to="/family"
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-all ${
              location.pathname === '/family' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
            }`}
            aria-label="Family Tab"
          >
            <Users className="w-5 h-5" />
            <span className="mt-0.5">Family</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-semibold text-slate-400"
            aria-label="More Menu"
          >
            <Menu className="w-5 h-5" />
            <span className="mt-0.5">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
