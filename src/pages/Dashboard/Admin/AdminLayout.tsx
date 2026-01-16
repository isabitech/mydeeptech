import AdminSidebar from './AdminSidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from './_context/SidebarContext';

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        <AdminSidebar />

        <div className="grid grid-rows-[auto_1fr] flex-1">
          {/* Header */}
          <AdminHeader />

          {/* Main Content */}
          <div className="flex-1 h-full bg-gray-100 p-6 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>

    </SidebarProvider>

  )
}

export default AdminLayout;