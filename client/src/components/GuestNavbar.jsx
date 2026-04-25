import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function GuestNavbar() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/50 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <ShoppingBag size={20} />
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">Ration CRM</span>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isLogin ? 'text-blue-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                !isLogin 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
                  : 'bg-gray-800 text-gray-100 hover:bg-gray-700'
              }`}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
