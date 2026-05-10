import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SidebarAdmin from '../components/layout/SidebarAdmin';
import SidebarOrganizationAdmin from '../components/layout/SidebarOrganizationAdmin';
import { normalizeRole } from '../lib/roleUtils';

const DashboardLayout = () => {
  const { user } = useAuth();

  const renderSidebar = () => {
    switch (normalizeRole(user?.role_name)) {
      case 'system_admin':
        return <SidebarAdmin />;
      case 'organization_admin':
        return <SidebarOrganizationAdmin />;
      default:
        return <SidebarAdmin />;
    }
  };

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      {renderSidebar()}

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