import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu, Plane } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import RosterOptimizer from './pages/RosterOptimizer';
import Comms from './pages/Comms';

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen bg-aero-900 text-slate-100 font-sans selection:bg-aero-accent selection:text-white">
        
        {/* Sidebar Component */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col transition-all duration-300 md:ml-64">
          
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-aero-800 border-b border-aero-700 sticky top-0 z-20 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="bg-aero-accent p-1.5 rounded-lg">
                <Plane className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-white text-lg">AeroGuard</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="text-white p-2 hover:bg-aero-700 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/roster" element={<RosterOptimizer />} />
              <Route path="/comms" element={<Comms />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;