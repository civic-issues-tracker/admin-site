import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import SidebarOrganizationAdmin from '../../components/layout/SidebarOrganizationAdmin';

const OrganizationAdminDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F2EA]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarOrganizationAdmin onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header with Hamburger */}
        <header className="md:hidden flex items-center justify-between bg-white px-4 py-3 shadow-sm z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1 text-gray-700 hover:bg-gray-100 rounded"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-[#6E4B33]">CivicWorks</h1>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default OrganizationAdminDashboardLayout;
