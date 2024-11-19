import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Signup from "./pages/Auth/Signup";
import LandingPage from "./pages/Auth/LandingPage";
import Overview from "./pages/Dashboard/components/Overview";
import Tasks from "./pages/Dashboard/components/tasks/Tasks";
import Payment from "./pages/Dashboard/components/payment/Payment";
import Jobs from "./pages/Dashboard/components/jobs/Jobs";
import Projects from "./pages/Dashboard/components/projects/Projects";
import Profile from "./pages/Dashboard/components/profile/Profile";
import Settings from "./pages/Dashboard/components/settings/Settings";
import Dashboard from "./pages/Dashboard/Dashboard";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard  />}>
          <Route path="/dashboard/overview" element={<Overview />} />
          <Route path="/dashboard/projects" element={<Projects />} />
          <Route path="/dashboard/jobs" element={<Jobs />} />
          <Route path="/dashboard/tasks" element={<Tasks />} />
          <Route path="/dashboard/payment" element={<Payment />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          {/* Redirect to Overview if no route is matched */}
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
