import AdminSidebar from './AdminSidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <AdminHeader />
        
        {/* Main Content */}
        <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout;