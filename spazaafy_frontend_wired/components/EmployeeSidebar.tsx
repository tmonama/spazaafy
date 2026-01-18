import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, User, Mail, MessageSquare, LogOut, ArrowLeftCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const EmployeeSidebar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Determine where to send them back based on their department/role context
  // (You could refine this logic, but for now sending to generic admin login/dashboard is safe)
  const handleSwitchToAdmin = () => {
    navigate('/admin/dashboard'); 
    // Or if you want to be smart:
    // if (user?.email.includes('legal')) navigate('/legal/dashboard');
    // else if (user?.email.includes('hr')) navigate('/hr/hiring');
    // else navigate('/admin/dashboard');
  };

  return (
    <aside className="w-64 bg-white border-r h-screen fixed left-0 top-0 pt-20 flex flex-col">
      <nav className="space-y-1 px-2 flex-1">
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

      {/* ✅ Switcher for Admins */}
      {user?.role === 'admin' && (
        <div className="p-4 border-t">
            <button 
                onClick={handleSwitchToAdmin}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-700 transition"
            >
                <ArrowLeftCircle className="mr-2 h-4 w-4" />
                Back to Admin Portal
            </button>
        </div>
      )}
    </aside>
  );
};
export default EmployeeSidebar;