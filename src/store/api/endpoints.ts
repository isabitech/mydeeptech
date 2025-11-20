export const baseURL = import.meta.env.VITE_API_URL;
export const endpoints = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
  },
  authDT: {
    createDTUser: "/auth/createDTuser",
    getDTUser: "/auth/allDTusers",
    submitResult: "/auth/submit-result",
    verifyEmail: "/auth/verifyDTusermail",
    setUpPassword: "/auth/setupPassword",
    loginDTUser: "/auth/dtUserLogin",
    resetPassword: "/auth/dtUserResetPassword",
  },

  profileDT:{
    getProfile: "/auth/dtUserProfile",
    updateProfile: "/auth/dtUserProfile",
    uploadResume: "/auth/upload-resume",
    uploadIdDocument: "/auth/upload-id-document",
  },

  // DTUser dashboard endpoint
  userDashboard: {
    getDashboard: "/auth/dashboard",
  },

  userStatus: {
    updateUserStatus: "/auth/Dtuserstatusupdate",
    getSingleUser: "/auth/DTsingleuser"
  },

  // admin authentication
  adminAuth: {
    signup: "/admin/create",
    verifyOTP: "/admin/verify-otp",
    login: "/admin/login",
  },



  // admin management
  project: {
    createProject: "/auth/createProject",
    getProject: "/auth/getProject",
    updateProject: "/auth/updateProject",
    deleteProject: "/auth/deleteProject",
  },

  // Admin project management endpoints
  adminProject: {
    createProject: "/admin/projects",
    getAllProjects: "/admin/projects",
    getProjectById: "/admin/projects",
    getProjectAnnotators: "/admin/projects",
    updateProject: "/admin/projects",
    deleteProject: "/admin/projects",
    requestDeletionOtp: "/admin/projects", // /:projectId/request-deletion-otp
    verifyDeletionOtp: "/admin/projects", // /:projectId/verify-deletion-otp
    getAllApplications: "/admin/applications",
    approveApplication: "/admin/applications",
    rejectApplication: "/admin/applications",
    removeApplicant: "/admin/applications", // /:applicationId/remove
    getRemovableApplicants: "/admin/projects", // /:projectId/removable-applicants
  },

  // User project endpoints  
  userProject: {
    projects: "/auth/projects", // New unified endpoint that supports view and status parameters
    browseProjects: "/auth/projects", // Legacy endpoint for backward compatibility  
    applyToProject: "/auth/projects",
    getActiveProjects: "/auth/activeProjects", // Legacy endpoint
  },

  adminActions:{
    getAllDTUsers: "/admin/dtusers",
    updateUserStatus: "/admin/dtusers",
    getAdminUsers: "/admin/admin-users"
  },

  // Admin invoice management endpoints
  adminInvoice: {
    createInvoice: "/admin/invoices",
    getAllInvoices: "/admin/invoices",
    getInvoiceDetails: "/admin/invoices",
    updatePaymentStatus: "/admin/invoices",
    sendPaymentReminder: "/admin/invoices",
    deleteInvoice: "/admin/invoices",
  },

  // User invoice endpoints  
  userInvoice: {
    getUserInvoices: "/auth/invoices",
    getUnpaidInvoices: "/auth/invoices/unpaid",
    getPaidInvoices: "/auth/invoices/paid",
    getInvoiceDashboard: "/auth/invoices/dashboard",
    getInvoiceDetails: "/auth/invoices",
  },


  tasks: {
    createTask: "/auth/createTasks",
    assignTask: "/auth/assignTask",
    getAllTasks: "/auth/getAllTasks",
  },
  users: {
    getAllUsers: "/auth/getAllUsers",
  },
  survey: {
    verifyEmail: "auth/validateuseremail",
  },
  addBulkEmails: "auth/addbulkemails",

  // Notification endpoints
  notifications: {
    getUserNotifications: "/notifications",
    markAsRead: "/notifications",
    markAllAsRead: "/notifications/mark-all-read",
    deleteNotification: "/notifications",
    getSummary: "/notifications/summary",
  },

  // Admin notification endpoints
  adminNotifications: {
    createNotification: "/admin/notifications",
    getAllNotifications: "/admin/notifications",
    updateNotification: "/admin/notifications",
    deleteNotification: "/admin/notifications",
    broadcast: "/admin/notifications/broadcast",
    analytics: "/admin/notifications/analytics",
  },

  // Chat support endpoints
  chat: {
    start: "/chat/start",
    history: "/chat/history",
    getChat: "/chat",
    sendMessage: "/chat",
  },

  // Admin chat endpoints
  adminChat: {
    getActiveChats: "/chat/admin/active",
    joinChat: "/chat/admin/join",
    closeChat: "/chat/admin/close",
  },
};
