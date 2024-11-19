import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

import ForgotPassword from "./pages/ForgotPassword";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";


const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
   
  );
};

export default AppRoutes;
