import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, Mail, MessageSquare, LogOut } from 'lucide-react';

const EmployeeSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r h-screen fixed left-0 top-0 pt-20">
      <nav className="space-y-1 px-2">
        <NavLink to="/employee/dashboard" className={({isActive}) => `flex items-center px-4 py-2 rounded ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Home className="mr-3 h-5 w-5" /> Dashboard
        </NavLink>
        <NavLink to="/employee/profile" className={({isActive}) => `flex items-center px-4 py-2 rounded ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <User className="mr-3 h-5 w-5" /> My Profile
        </NavLink>
        <NavLink to="/employee/email" className={({isActive}) => `flex items-center px-4 py-2 rounded ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Mail className="mr-3 h-5 w-5" /> Email
        </NavLink>
        <NavLink to="/employee/complaints" className={({isActive}) => `flex items-center px-4 py-2 rounded ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <MessageSquare className="mr-3 h-5 w-5" /> Complaints
        </NavLink>
        <NavLink to="/employee/resign" className={({isActive}) => `flex items-center px-4 py-2 rounded ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <LogOut className="mr-3 h-5 w-5" /> Resignation
        </NavLink>
      </nav>
    </aside>
  );
};
export default EmployeeSidebar;