import { Outlet } from 'react-router-dom';
import SidebarAdmin from '../components/layout/SidebarAdmin';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <main className="flex-1 overflow-y-auto px-2 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet /> 
          </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;