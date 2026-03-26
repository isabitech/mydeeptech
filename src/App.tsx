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
import AssessmentManagementList from "./pages/Dashboard/Admin/assessmentmgt/AssessmentManagementList";
import AdsLandingPage from "./pages/Ads/AdsLandingPage";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import SignupPage from "./pages/Auth/SignupPage";
import AdminSignup from "./pages/Auth/Admin/AdminSignup";
import AdminLogin from "./pages/Auth/Admin/AdminLogin";
import InvoiceManagement from "./pages/Dashboard/Admin/invoicemgt/InvoiceManagement";
import { NotificationManagement } from "./pages/Dashboard/Admin/notifications";
import ChatManagement from "./pages/Dashboard/Admin/chat/ChatManagement";
import ResetPassword from "./pages/Auth/ResetPassword";
import CustomerService from "./components/CustomerService";
import { PrivacyPolicy, TermsOfService } from "./pages/Legal";
import MultimediaAssessmentDemo from "./components/Assessment/MultimediaAssessmentDemo";
import AssessmentSession from "./components/Assessment/AssessmentSession";
import { QAReviewDashboard } from "./components/Assessment/QAReviewDashboard";
import { AdminReelAssessmentManager } from "./components/Assessment/AdminAssessmentManager";
import AssessmentList from "./components/Assessment/AssessmentList";
import VideoTest from "./components/VideoTest";
import { Toaster } from 'sonner';
import InvoiceRoutes from "./pages/Dashboard/Admin/___invoice/InvoiceRoutes";
import UserNotifications from "./pages/Dashboard/User/user-notifications/UserNotifications";
import ProtectUserLayout from "./components/layouts/ProtectUserLayout";
import ProtectAdminLayout from "./components/layouts/ProtectAdminLayout";
import RBACPage from "./pages/Dashboard/Admin/rbcmgt/RBACPage";
import { PageGuard } from "./components";
import ApplicationsPage from "./pages/admin/ApplicationsPage";
import UserAssessments from "./pages/Dashboard/Admin/assessmentmgt/UserAssessments";
import EmployeeMgt from "./pages/Dashboard/Admin/employeemgt/EmployeeMgt";

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
        <Route path="/careers" element={<Hiring />} />
        <Route path="/careers/math-ai-trainer" element={<MathTalent />} />
        <Route path="/demo/multimedia-assessment" element={<MultimediaAssessmentDemo />} />
        <Route path="/video-test" element={<VideoTest />} />

        <Route path="/uploadEmail" element={<UploadEmail />} />
        <Route path="/apply" element={<AdsLandingPage />} />

        <Route path="/route" element={<PageRoute />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectUserLayout />}>
          <Route path="/dashboard" element={<Dashboard />}>
            {/* Default route */}
            <Route index element={<Navigate to="overview" replace />} />
            {/* User Dashboard */}
            <Route path="overview" element={<Welcome />} />
            <Route path="projects" element={<Projects />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="payment" element={<Payment />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="support" element={<SupportCenter />} />
            <Route path="assessment" element={<Assessment />} />
            <Route path="notifications" element={<UserNotifications />} />
            <Route path="assessment/multimedia/:assessmentId" element={<AssessmentSession />} />
            <Route path="qa-review" element={<QAReviewDashboard />} />
            <Route path="assessments" element={<AssessmentList />} />
            <Route path="assessment-history" element={<AssessmentHistory />} />
          </Route>
        </Route>

        {/* Admin auth */}

        <Route path="/auth/admin-signup" element={<AdminSignup />} />
        <Route path="/auth/admin-login" element={<AdminLogin />} />

        {/* Admin Dashboard */}
        <Route element={<ProtectAdminLayout />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="overview" index element={
              <PageGuard resource="overview">
                <AdminOverview />
              </PageGuard>
            } />
            <Route path="users" element={
              <PageGuard resource="users">
                <UserManagement />
              </PageGuard>
            } />
            <Route path="annotators" element={
              <PageGuard resource="annotators">
                <Annotators />
              </PageGuard>
            } />
            <Route path="assessments">
              <Route index element={
                <PageGuard resource="assessments">
                  <AssessmentManagementList />
                </PageGuard>
            } />
              <Route path="review-assessments" element={
                <PageGuard resource="assessments">
                  <UserAssessments />
                </PageGuard>
            } />
            </Route>
            <Route path="assessments/multimedia" element={
              <PageGuard resource="assessments">
                <AdminReelAssessmentManager />
              </PageGuard>
            } />
            <Route path="assessments/qa-review" element={
              <PageGuard resource="assessments">
                <QAReviewDashboard />
              </PageGuard>
            } />
            <Route path="projects" element={
              <PageGuard resource="projects">
                <ProjectManagement />
              </PageGuard>
            } />
            <Route path="applications" element={
              <PageGuard resource="applications">
                <ApplicationManagement />
              </PageGuard>
            } />
            <Route path="applications-demo" element={
              <PageGuard resource="applications">
                <ApplicationsPage />
              </PageGuard>
            } />
            <Route path="jobs" element={
              <PageGuard resource="jobs">
                <JobManagement />
              </PageGuard>
            } />
            <Route path="tasks" element={
              <PageGuard resource="tasks">
                <TaskManagement />
              </PageGuard>
            } />
            <Route path="invoices" element={
              <PageGuard resource="invoice">
                <InvoiceManagement />
              </PageGuard>
            } />
            <Route path="payments" element={
              <PageGuard resource="payments">
                <PaymentManagement />
              </PageGuard>
            } />
            <Route path="notifications" element={
              <PageGuard resource="notifications">
                <NotificationManagement />
              </PageGuard>
            } />
            <Route path="chat" element={
              <PageGuard resource="chat">
                <ChatManagement />
              </PageGuard>
            } />
            <Route path="rbac" element={
              <PageGuard resource="rbac">
                <RBACPage />
              </PageGuard>
            } />
            <Route path="settings" element={
              <PageGuard resource="settings">
                <SettingsMgt />
              </PageGuard>
            } />
            <Route path="invoice-page/*" element={
              <PageGuard resource="invoice">
                <InvoiceRoutes />
              </PageGuard>
            } />
            <Route path="partner-invoices/*" element={
              <PageGuard resource="invoice">
                <InvoiceRoutes />
              </PageGuard>
            } />

             <Route path="employees/*" element={<EmployeeMgt /> } />
          </Route>
        </Route>

        {/* Redirect unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
