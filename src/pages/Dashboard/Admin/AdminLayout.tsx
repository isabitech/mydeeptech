import AdminSidebar from './AdminSidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from './_context/SidebarContext';
const AdminLayout = () => {
  const location = useLocation();
  const isHvncRoute = location.pathname.startsWith('/admin/hvnc');
 
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="grid grid-rows-[auto_1fr] w-full">
          <AdminHeader />
          {/* Main Content */}
          <div className={`overflow-y-auto ${isHvncRoute ? '' : 'bg-gray-100 p-6'}`}>
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default AdminLayout;