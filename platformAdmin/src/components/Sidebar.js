import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Shield,
  Activity,
  CheckCircle
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const { adminUser, signOut } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      current: location.pathname === '/',
    },
    {
      name: 'Hospital Management',
      href: '/hospitals',
      icon: Building2,
      current: location.pathname === '/hospitals',
    },
    {
      name: 'Hospital Approvals',
      href: '/hospital-approvals',
      icon: CheckCircle,
      current: location.pathname === '/hospital-approvals',
    },
    {
      name: 'Subscription Management',
      href: '/subscriptions',
      icon: CreditCard,
      current: location.pathname === '/subscriptions',
    },
    {
      name: 'Patient Management',
      href: '/patients',
      icon: Users,
      current: location.pathname === '/patients',
    },
    {
      name: 'Transaction History',
      href: '/transactions',
      icon: DollarSign,
      current: location.pathname === '/transactions',
    },
    {
      name: 'System Settings',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
    },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Wopital</h1>
            <p className="text-xs text-gray-500">Platform Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                item.current
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 ${
                  item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {adminUser?.first_name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {adminUser?.first_name} {adminUser?.last_name}
            </p>
            <p className="text-xs text-gray-500 truncate">{adminUser?.email}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
} 