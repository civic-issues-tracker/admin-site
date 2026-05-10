import React from "react";
import { Outlet } from "react-router-dom";
import SidebarAdmin from "../../components/layout/SidebarAdmin"; 
import AdminHeader from "../../components/layout/AdminHeader";   

const AdminDashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#FDFBF7] font-body">
      <div className="sticky top-0 h-screen">
        <SidebarAdmin />
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <AdminHeader />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-400 mx-auto pb-12">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;