import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard, Users, ClipboardList, Package, BarChart2,
  Menu, X, ShoppingBag, Search, ChevronRight, Globe
} from 'lucide-react';

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/cards', icon: Users, label: 'Ration Cards' }, // Can be translated later if needed
    { to: '/distribution', icon: ClipboardList, label: t('distribution') },
    { to: '/stock', icon: Package, label: t('stock') },
    { to: '/reports', icon: BarChart2, label: t('reports') },
    { to: '/search', icon: Search, label: 'Search' },
  ];

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink to={to} end={to === '/'}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
          isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
      <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </NavLink>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl"><ShoppingBag size={20} className="text-white" /></div>
          <div>
            <p className="text-white font-bold text-sm">Ration Shop</p>
            <p className="text-gray-500 text-xs">Shop #{user?.shopNumber || '0806015'}</p>
          </div>
        </div>
      </div>
      
      {/* Language Toggle */}
      <div className="px-4 py-3 border-b border-gray-800">
        <button 
          onClick={toggleLanguage}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-gray-300">
              {language === 'en' ? 'English' : 'తెలుగు'}
            </span>
          </div>
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">Switch</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => <NavItem key={item.to} {...item} />)}
      </nav>
      {/* User */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${user?.role === 'admin' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 border border-gray-800 p-2 rounded-xl">
        <Menu size={20} className="text-white" />
      </button>
      {/* Mobile overlay */}
      {open && <div onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />}
      {/* Mobile drawer */}
      <div className={`lg:hidden fixed left-0 top-0 h-full w-72 bg-gray-950 border-r border-gray-800 z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
        <SidebarContent />
      </div>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-gray-950 border-r border-gray-800 fixed left-0 top-0 h-full z-30">
        <SidebarContent />
      </div>
    </>
  );
}
