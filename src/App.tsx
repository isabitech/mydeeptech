import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Signup from "./pages/Auth/Signup";
import LandingPage from "./pages/Auth/LandingPage";
import Overview from "./pages/Dashboard/User/Overview";
import Tasks from "./pages/Dashboard/User/tasks/Tasks";
import Payment from "./pages/Dashboard/User/payment/Payment";
import Jobs from "./pages/Dashboard/User/jobs/Jobs";
import Projects from "./pages/Dashboard/User/projects/Projects";
import Profile from "./pages/Dashboard/User/profile/Profile";
import Settings from "./pages/Dashboard/User/settings/Settings";
import Dashboard from "./pages/Dashboard/User/Dashboard";
import AdminLayout from "./pages/Dashboard/Admin/AdminLayout";
import AdminOverview from "./pages/Dashboard/Admin/adminoverview/AdminOverview";
import UserManagement from "./pages/Dashboard/Admin/usermgt/UserManagement";
import ProjectManagement from "./pages/Dashboard/Admin/projectmgt/ProjectManagement";
import JobManagement from "./pages/Dashboard/Admin/jobmgt/JobManagement";
import TaskManagement from "./pages/Dashboard/Admin/taskmgt/TaskManagement";
import PaymentManagement from "./pages/Dashboard/Admin/paymentmgt/PaymentManagement";
import SettingsMgt from "./pages/Dashboard/Admin/settingsmgt/SettingsMgt";
import PageRoute from "./pages/routes/PageRoute";
import AboutUs from "./pages/AboutUs/AboutUs";
import NewProjects from "./pages/Projects/NewProjects";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/new-projects" element={<NewProjects />} />

        <Route path="/route" element={<PageRoute />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          {/* User Dashboard */}
          <Route path="overview" index element={<Overview />} />
          <Route path="projects" element={<Projects />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="payment" element={<Payment />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />

        </Route>
          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="overview" index element={<AdminOverview />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="projects" element={<ProjectManagement />} />
            <Route path="jobs" element={<JobManagement />} />
            <Route path="tasks" element={<TaskManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="settings" element={<SettingsMgt />} />
          </Route>

        {/* Redirect unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
