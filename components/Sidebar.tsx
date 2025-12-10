import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Radio, Users, Zap, Plane, X } from 'lucide-react';
import { NavItem } from '../types';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Simulator', path: '/simulator', icon: Zap },
  { label: 'Roster Optimizer', path: '/roster', icon: Users },
  { label: 'Comms', path: '/comms', icon: Radio },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-aero-800 border-r border-aero-700 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-aero-700">
          <div className="flex items-center space-x-3">
            <div className="bg-aero-accent p-2 rounded-lg">
              <Plane className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">AeroGuard</h1>
              <p className="text-xs text-aero-400 font-medium">RESILIENCE AGENT</p>
            </div>
          </div>
          {/* Close Button for Mobile */}
          <button 
            onClick={onClose}
            className="md:hidden text-aero-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()} // Close sidebar on nav click on mobile
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-aero-accent text-white shadow-lg shadow-aero-accent/20'
                    : 'text-aero-400 hover:bg-aero-700 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-aero-500 group-hover:text-white'}`} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-aero-700">
          <div className="bg-aero-900 rounded-xl p-4 border border-aero-700">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-aero-success animate-pulse"></div>
              <span className="text-xs text-aero-400 uppercase font-semibold tracking-wider">System Status</span>
            </div>
            <p className="text-sm text-white font-medium">All Systems Nominal</p>
            <p className="text-xs text-aero-500 mt-1">Latency: 24ms</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;