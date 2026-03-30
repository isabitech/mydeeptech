import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom";


const MaintenanceLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        navigate("/maintenance");
    }, [navigate, location.pathname]);
  return <Outlet />
}

export default MaintenanceLayout