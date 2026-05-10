import React from 'react';
import SidebarAdmin from './SidebarAdmin';
import AdminHeader from './AdminHeader';
import { Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FDFBF7]"> 
      <SidebarAdmin />
      
      <main className="flex-1 flex flex-col w-full overflow-x-hidden">
        <AdminHeader />
        <div className="p-4 md:p-8">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;