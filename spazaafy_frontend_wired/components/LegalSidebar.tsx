import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from './SidebarContext';
import { Scale, FileText, Shield, AlertTriangle, FileCheck, HelpCircle, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';

const LegalSidebar: React.FC = () => {
  const { isSidebarOpen } = useSidebar();

  const navItems = [
    { path: '/legal/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/legal/contracts', label: 'Contracts', icon: FileText },
    { path: '/legal/policies', label: 'Policies', icon: Shield },
    { path: '/legal/ip', label: 'Intellectual Property', icon: FileCheck },
    { path: '/legal/compliance', label: 'Compliance', icon: Scale },
    { path: '/legal/disputes', label: 'Disputes', icon: AlertTriangle },
    { path: '/legal/other', label: 'Advisory / Other', icon: HelpCircle },
  ];

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Spazaafy Legal</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/legal/dashboard'}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
            <div className="bg-gray-100 rounded-full p-2 mr-3">
                <Scale size={20} className="text-gray-600" />
            </div>
            <div>
                <p className="text-xs font-medium text-gray-900">Legal Dept.</p>
                <p className="text-xs text-gray-500">Authorized Access</p>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default LegalSidebar;