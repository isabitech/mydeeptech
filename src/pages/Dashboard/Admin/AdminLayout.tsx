import AdminSidebar from './AdminSidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';
import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import { SidebarProvider } from './_context/SidebarContext';
import AppLoadingFallback from '../../../components/AppLoadingFallback';
import { ErrorBoundary } from '../../../components';

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="grid grid-rows-[auto_1fr] w-full">
          <AdminHeader />
          {/* Main Content */}
          <main className="bg-white p-6 overflow-y-auto w-full flex flex-col flex-1">
            <ErrorBoundary>
              <Suspense fallback={<AppLoadingFallback message="Loading data..." />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default AdminLayout;