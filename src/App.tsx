import { BrowserRouter as Router } from "react-router-dom";
import CustomerService from "./components/CustomerService";
import { Toaster } from 'sonner';
import AnimatedRoutes from "./AnimatedRoutes";

const AppRoutes = () => {

  return (
    <Router>
      <CustomerService />
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={true}
        duration={4000}
      />
      <AnimatedRoutes />
    </Router>
  );
};

export default AppRoutes;
