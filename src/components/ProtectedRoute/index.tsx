// import useAuth from "@/hooks/ui/useAuth";
import { Spin } from "antd";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin />
      </div>
    ); // or a loading spinner
  }

  if (!isAuthenticated) {
    return null; // or a redirect to the login page
  }

  return <>{children}</>;
};

export default ProtectedRoute;
