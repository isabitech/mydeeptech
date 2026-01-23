
export const baseURL = import.meta.env.MODE === "development" ? 'http://localhost:4000/api' : import.meta.env.VITE_API_URL;

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
    forgotPassword: "/auth/dtuser-forgot-password",
    resetPasswordWithToken: "/auth/dtuser-reset-password",
    verifyResetToken: "/auth/verify-reset-token",
  },

  profileDT: {
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
    getSingleUser: "/auth/DTsingleuser",
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
    toggleActiveStatus: "/admin/projects", // /:projectId/toggle-active
    deleteProject: "/admin/projects",
    requestDeletionOtp: "/admin/projects", // /:projectId/request-deletion-otp
    verifyDeletionOtp: "/admin/projects", // /:projectId/verify-deletion-otp
    getAllApplications: "/admin/applications",
    getApprovedApplicantsForProject: "/projects/:projectId/approved-applicants",
    bulkRejectApplications: "/applications/bulk-reject",
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

  adminActions: {
    getAllDTUsers: "/admin/dtusers",
    updateUserStatus: "/admin/dtusers",
    getAdminUsers: "/admin/admin-users",
  },

  // Admin invoice management endpoints
  adminInvoice: {
    createInvoice: "/admin/invoices",
    getAllInvoices: "/admin/invoices",
    getInvoiceDetails: "/admin/invoices",
    updatePaymentStatus: "/admin/invoices",
    sendPaymentReminder: "/admin/invoices",
    deleteInvoice: "/admin/invoices",
    bulkAuthorizePayment: "/admin/invoices/bulk-authorize-payment",
    generatePaystackCSV: "/admin/invoices/generate-paystack-csv",
    generateMpesaCSV: "/admin/invoices/generate-mpesa-csv",
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
    markAllAsRead: "/notifications/read-all",
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

  // User Assessment endpoints
  assessments: {
    available: "/api/assessments/available",
    start: "/api/assessments/start",
    session: "/api/assessments/session",
    submit: "/api/assessments/submit",
    progress: "/api/assessments/progress",
  },

  // Enhanced Chat support endpoints following the documentation
  chat: {
    startChat: "/chat/start",
    getActiveChats: "/chat/active",
    getChatHistory: "/chat/history",
    getChat: "/chat",
    sendMessage: "/chat",
    uploadFile: "/chat/upload",
    admin: {
      getActiveChats: "/chat/admin/active",
      joinChat: "/chat/admin/join",
      sendMessage: "/chat/admin/send-message",
      closeChat: "/chat/admin/close",
      getStats: "/chat/admin/stats",
      assignAgent: "/chat/admin/assign",
      getChatDetails: "/chat/admin",
    },
  },
};
