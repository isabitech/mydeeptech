import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

// Layout components as static imports
import DashboardLayout from "./pages/Dashboard/User/DashboardLayout";
import AdminLayout from "./pages/Dashboard/Admin/AdminLayout";

import ProtectUserLayout from "./components/layouts/ProtectUserLayout";
import ProtectAdminLayout from "./components/layouts/ProtectAdminLayout";
import PublicLayout from "./components/layouts/PublicLayout";
import PageGuard from "./components/PageGuard";

import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import LandingPage from "./pages/Auth/LandingPage";
// import Overview from "./pages/Dashboard/User/Overview";

// Lazy load components for code splitting
const Tasks = React.lazy(() => import("./pages/Dashboard/User/tasks/Tasks"));
const Payment = React.lazy(() => import("./pages/Dashboard/User/payment/Payment"));
const Jobs = React.lazy(() => import("./pages/Dashboard/User/jobs/Jobs"));
const Projects = React.lazy(() => import("./pages/Dashboard/User/projects/Projects"));
const Profile = React.lazy(() => import("./pages/Dashboard/User/profile/Profile"));
const Settings = React.lazy(() => import("./pages/Dashboard/User/settings/Settings"));
const AdminOverview = React.lazy(() => import("./pages/Dashboard/Admin/adminoverview/AdminOverview"));
const UserManagement = React.lazy(() => import("./pages/Dashboard/Admin/usermgt/UserManagement"));
const ProjectManagement = React.lazy(() => import("./pages/Dashboard/Admin/projectmgt/NewProjectManagement"));
const ApplicationManagement = React.lazy(() => import("./pages/Dashboard/Admin/projectmgt/ApplicationManagement"));
const JobManagement = React.lazy(() => import("./pages/Dashboard/Admin/jobmgt/JobManagement"));
const TaskManagement = React.lazy(() => import("./pages/Dashboard/Admin/taskmgt/TaskManagement"));
const PaymentManagement = React.lazy(() => import("./pages/Dashboard/Admin/paymentmgt/PaymentManagement"));
const SettingsMgt = React.lazy(() => import("./pages/Dashboard/Admin/settingsmgt/SettingsMgt"));
const Annotators = React.lazy(() => import("./pages/Dashboard/Admin/annotatorsmgt/Annotators"));
const PageRoute = React.lazy(() => import("./pages/routes/PageRoute"));
const AboutUs = React.lazy(() => import("./pages/AboutUs/AboutUs"));
const NewProjects = React.lazy(() => import("./pages/Projects/NewProjects"));
// import Survey from "./pages/Projects/SurveyProjects/Survey";
const Hiring = React.lazy(() => import("./pages/Careers/Hiring"));
const UploadEmail = React.lazy(() => import("./pages/Projects/SurveyProjects/UploadEmail"));
const MathTalent = React.lazy(() => import("./pages/Careers/Talents/MathTalent"));
const Welcome = React.lazy(() => import("./pages/Dashboard/User/Welcome"));
const Assessment = React.lazy(() => import("./pages/Auth/Assessment"));
const AssessmentHistory = React.lazy(() => import("./pages/Dashboard/User/AssessmentHistory"));
const SupportCenter = React.lazy(() => import("./pages/Dashboard/User/SupportCenter"));
const AssessmentManagementList = React.lazy(() => import("./pages/Dashboard/Admin/assessmentmgt/AssessmentManagementList"));
const AdsLandingPage = React.lazy(() => import("./pages/Ads/AdsLandingPage"));
const VerifyEmail = React.lazy(() => import("./pages/Auth/VerifyEmail"));
const SignupPage = React.lazy(() => import("./pages/Auth/SignupPage"));
const AdminSignup = React.lazy(() => import("./pages/Auth/Admin/AdminSignup"));
const AdminLogin = React.lazy(() => import("./pages/Auth/Admin/AdminLogin"));
const InvoiceManagement = React.lazy(() => import("./pages/Dashboard/Admin/invoicemgt/InvoiceManagement"));
const NotificationManagement = React.lazy(() => import("./pages/Dashboard/Admin/notifications/NotificationManagement"));
const ChatManagement = React.lazy(() => import("./pages/Dashboard/Admin/chat/ChatManagement"));
const ResetPassword = React.lazy(() => import("./pages/Auth/ResetPassword"));
const PrivacyPolicy = React.lazy(() => import("./pages/Legal/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("./pages/Legal/TermsOfService"));
const MultimediaAssessmentDemo = React.lazy(() => import("./components/Assessment/MultimediaAssessmentDemo"));
const AssessmentSession = React.lazy(() => import("./components/Assessment/AssessmentSession"));
const QAReviewDashboard = React.lazy(() => import("./components/Assessment/QAReviewDashboard"));
const AdminReelAssessmentManager = React.lazy(() => import("./components/Assessment/AdminAssessmentManager"));
const AssessmentList = React.lazy(() => import("./components/Assessment/AssessmentList"));
const VideoTest = React.lazy(() => import("./components/VideoTest"));
const InvoiceRoutes = React.lazy(() => import("./pages/Dashboard/Admin/___invoice/InvoiceRoutes"));
const UserNotifications = React.lazy(() => import("./pages/Dashboard/User/user-notifications/UserNotifications"));
const RBACPage = React.lazy(() => import("./pages/Dashboard/Admin/rbcmgt/RBACPage"));
const ApplicationsPage = React.lazy(() => import("./pages/admin/ApplicationsPage"));
const UserAssessments = React.lazy(() => import("./pages/Dashboard/Admin/assessmentmgt/UserAssessments"));
const EmployeeMgt = React.lazy(() => import("./pages/Dashboard/Admin/employeemgt/EmployeeMgt"));
const AnnotatorInterviewHubPage = React.lazy(() => import("./features/aiInterview/pages/AnnotatorInterviewHubPage"));
const AnnotatorInterviewSetupPage = React.lazy(() => import("./features/aiInterview/pages/AnnotatorInterviewSetupPage"));
const AnnotatorInterviewSessionPage = React.lazy(() => import("./features/aiInterview/pages/AnnotatorInterviewSessionPage"));
const AnnotatorInterviewResultPage = React.lazy(() => import("./features/aiInterview/pages/AnnotatorInterviewResultPage"));
const AdminInterviewOverviewPage = React.lazy(() => import("./features/aiInterview/pages/AdminInterviewOverviewPage"));
const AdminInterviewManagementPage = React.lazy(() => import("./features/aiInterview/pages/AdminInterviewManagementPage"));
const AdminInterviewReportPage = React.lazy(() => import("./features/aiInterview/pages/AdminInterviewReportPage"));


const AnimatedRoutes = () => {

  const location = useLocation();

  return (
        <Routes location={location}>
            {/* Static public routes */}
            <Route path="/" element={<LandingPage />} />
            {/* Lazy-loaded public routes with PublicLayout */}
            <Route element={<PublicLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email/:id" element={<VerifyEmail />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/route" element={<PageRoute />} />
              <Route path="/auth/admin-signup" element={<AdminSignup />} />
              <Route path="/auth/admin-login" element={<AdminLogin />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectUserLayout />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<Welcome />} />
                <Route path="new-projects" element={<NewProjects />} />
                <Route path="careers" element={<Hiring />} />
                <Route path="careers/math-ai-trainer" element={<MathTalent />} />
                <Route path="demo/multimedia-assessment" element={<MultimediaAssessmentDemo />} />
                <Route path="video-test" element={<VideoTest />} />
                <Route path="uploadEmail" element={<UploadEmail />} />
                <Route path="apply" element={<AdsLandingPage />} />
                <Route path="projects" element={<Projects />} />
                <Route path="jobs" element={<Jobs />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="payment" element={<Payment />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="support" element={<SupportCenter />} />
                <Route path="assessment" element={<Assessment />} />
                <Route path="notifications" element={<UserNotifications />} />
                <Route path="ai-interview" element={<AnnotatorInterviewHubPage />} />
                <Route path="ai-interview/setup/:trackId" element={<AnnotatorInterviewSetupPage />} />
                <Route path="ai-interview/session/:sessionId" element={<AnnotatorInterviewSessionPage />} />
                <Route path="ai-interview/results/:sessionId" element={<AnnotatorInterviewResultPage />} />
                <Route path="assessment/multimedia/:assessmentId" element={<AssessmentSession />} />
                <Route path="qa-review" element={<QAReviewDashboard />} />
                <Route path="assessments" element={<AssessmentList />} />
                <Route path="assessment-history" element={<AssessmentHistory />} />
              </Route>
            </Route>

            {/* Admin Dashboard */}
            <Route element={<ProtectAdminLayout />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<PageGuard resource="overview"><AdminOverview /></PageGuard>} />
                <Route path="users" element={<PageGuard resource="users"><UserManagement /></PageGuard>} />
                <Route path="annotators" element={<PageGuard resource="annotators"><Annotators /></PageGuard>} />
                <Route path="assessments">
                  <Route index element={<PageGuard resource="assessments"><AssessmentManagementList /></PageGuard>} />
                  <Route path="review-assessments" element={<PageGuard resource="assessments"><UserAssessments /></PageGuard>} />
                </Route>
                <Route path="assessments/multimedia" element={<PageGuard resource="assessments"><AdminReelAssessmentManager /></PageGuard>} />
                <Route path="assessments/qa-review" element={<PageGuard resource="assessments"><QAReviewDashboard /></PageGuard>} />
                <Route path="projects" element={<PageGuard resource="projects"><ProjectManagement /></PageGuard>} />
                <Route path="applications" element={<PageGuard resource="applications"><ApplicationManagement /></PageGuard>} />
                <Route path="applications-demo" element={<PageGuard resource="applications"><ApplicationsPage /></PageGuard>} />
                <Route path="jobs" element={<PageGuard resource="jobs"><JobManagement /></PageGuard>} />
                <Route path="tasks" element={<PageGuard resource="tasks"><TaskManagement /></PageGuard>} />
                <Route path="invoices" element={<PageGuard resource="invoice"><InvoiceManagement /></PageGuard>} />
                <Route path="payments" element={<PageGuard resource="payments"><PaymentManagement /></PageGuard>} />
                <Route path="notifications" element={<PageGuard resource="notifications"><NotificationManagement /></PageGuard>} />
                <Route path="chat" element={<PageGuard resource="chat"><ChatManagement /></PageGuard>} />
                <Route path="rbac" element={<PageGuard resource="rbac"><RBACPage /></PageGuard>} />
                <Route path="settings" element={<PageGuard resource="settings"><SettingsMgt /></PageGuard>} />
                <Route path="invoice-page/*" element={<PageGuard resource="invoice"><InvoiceRoutes /></PageGuard>} />
                <Route path="partner-invoices/*" element={<PageGuard resource="invoice"><InvoiceRoutes /></PageGuard>} />
                <Route path="employees/*" element={<EmployeeMgt />} />
                <Route path="interviews" element={<AdminInterviewOverviewPage />} />
                <Route path="interviews/candidates" element={<AdminInterviewManagementPage />} />
                <Route path="interviews/:sessionId" element={<AdminInterviewReportPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
  );
};

export default AnimatedRoutes;
