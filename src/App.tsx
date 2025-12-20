import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import LandingPage from "./pages/Auth/LandingPage";
// import Overview from "./pages/Dashboard/User/Overview";
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
import ProjectManagement from "./pages/Dashboard/Admin/projectmgt/NewProjectManagement";
import ApplicationManagement from "./pages/Dashboard/Admin/projectmgt/ApplicationManagement";
import JobManagement from "./pages/Dashboard/Admin/jobmgt/JobManagement";
import TaskManagement from "./pages/Dashboard/Admin/taskmgt/TaskManagement";
import PaymentManagement from "./pages/Dashboard/Admin/paymentmgt/PaymentManagement";
import SettingsMgt from "./pages/Dashboard/Admin/settingsmgt/SettingsMgt";
import Annotators from "./pages/Dashboard/Admin/annotatorsmgt/Annotators";
import PageRoute from "./pages/routes/PageRoute";
import AboutUs from "./pages/AboutUs/AboutUs";
import NewProjects from "./pages/Projects/NewProjects";
// import Survey from "./pages/Projects/SurveyProjects/Survey";
import Hiring from "./pages/Careers/Hiring";
import UploadEmail from "./pages/Projects/SurveyProjects/UploadEmail";
import MathTalent from "./pages/Careers/Talents/MathTalent";
import Welcome from "./pages/Dashboard/User/Welcome";
import Assessment from "./pages/Auth/Assessment";
import AssessmentHistory from "./pages/Dashboard/User/AssessmentHistory";
import SupportCenter from "./pages/Dashboard/User/SupportCenter";
import AssessmentManagement from "./pages/Dashboard/Admin/AssessmentManagement";
import AdsLandingPage from "./pages/Ads/AdsLandingPage";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import SignupPage from "./pages/Auth/SignupPage";
import AdminSignup from "./pages/Auth/Admin/AdminSignup";
import AdminLogin from "./pages/Auth/Admin/AdminLogin";
import InvoiceManagement from "./pages/Dashboard/Admin/invoicemgt/InvoiceManagement";
import { NotificationManagement } from "./pages/Dashboard/Admin/notifications";
import ChatManagement from "./pages/Dashboard/Admin/chat/ChatManagement";
import ResetPassword from "./pages/Auth/ResetPassword";
import EnhancedUserChatWidget from "./components/Chat/EnhancedUserChatWidget";
import CustomerService from "./components/CustomerService";
import { PrivacyPolicy, TermsOfService } from "./pages/Legal";
import MultimediaAssessmentDemo from "./components/Assessment/MultimediaAssessmentDemo";
import { AssessmentSession } from "./components/Assessment/AssessmentSession";
import { AdminAssessmentManager } from "./components/Assessment/AdminAssessmentManager";
import { QAReviewDashboard } from "./components/Assessment/QAReviewDashboard";
// import AssessmentSession from "./components/Assessment/AssessmentSession";
// import QAReviewDashboard from "./components/Assessment/QAReviewDashboard";
// import AdminAssessmentManager from "./components/Assessment/AdminAssessmentManager";

const AppRoutes = () => {
  return (
    <Router>
      <CustomerService />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email/:id" element={<VerifyEmail />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/new-projects" element={<NewProjects />} />
        {/* <Route path="/new-projects/survey" element={<Survey/>} /> */}
        <Route path="/careers" element={<Hiring/>} />
        <Route path="/careers/math-ai-trainer" element={<MathTalent/>} />
        <Route path="/demo/multimedia-assessment" element={<MultimediaAssessmentDemo />} />

        <Route path="/uploadEmail" element={<UploadEmail />} />
        <Route path="/apply" element={<AdsLandingPage />} />


        <Route path="/route" element={<PageRoute />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          {/* User Dashboard */}
          <Route path="overview" index element={<Welcome />} />
          <Route path="projects" element={<Projects />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="payment" element={<Payment />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="support" element={<SupportCenter />} />
          <Route path="assessment" element={<Assessment />} />
          <Route path="assessment/multimedia" element={<AssessmentSession assessmentId="" />} />
          <Route path="assessment/qa-review" element={<QAReviewDashboard />} />
          <Route path="assessments" element={<AdminAssessmentManager />} />
          <Route path="assessment-history" element={<AssessmentHistory />} />


        </Route>

        {/* Admin auth */}

        <Route path="/auth/admin-signup" element={<AdminSignup />} />
        <Route path="/auth/admin-login" element={<AdminLogin />} />

          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="overview" index element={<AdminOverview />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="annotators" element={<Annotators />} />
            <Route path="assessments" element={<AssessmentManagement />} />
            <Route path="assessments/multimedia" element={<AdminAssessmentManager />} />
            <Route path="assessments/qa-review" element={<QAReviewDashboard />} />
            <Route path="projects" element={<ProjectManagement />} />
            <Route path="applications" element={<ApplicationManagement />} />
            <Route path="jobs" element={<JobManagement />} />
            <Route path="tasks" element={<TaskManagement />} />
            <Route path="invoices" element={<InvoiceManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="notifications" element={<NotificationManagement />} />
            <Route path="chat" element={<ChatManagement />} />
            <Route path="settings" element={<SettingsMgt />} />
          </Route>

        {/* Redirect unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
