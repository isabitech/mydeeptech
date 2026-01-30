import AdminSidebar from './AdminSidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from './_context/SidebarContext';

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="grid grid-rows-[auto_1fr] w-full">
          <AdminHeader />
          {/* Main Content */}
          <div className="grid bg-gray-100 p-6 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default AdminLayout;