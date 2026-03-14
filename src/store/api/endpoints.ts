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
    updateUserRole: "/admin/users/:userId/role",
    getRoles: "/admin/roles",
    createRole: "/admin/roles",
    updateRole: "/admin/roles/:roleId",
    deleteRole: "/admin/roles/:roleId",
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

  // Admin partner invoice management endpoints (Simplified System)
  partnerInvoice: {
    create: "/partner-invoice",
    getAll: "/partner-invoice",
    update: "/partner-invoice",
    delete: "/partner-invoice",
    send: "/partner-invoice/send",
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
    getUsers: "/auth/getUsers",
    getAllUsersForRoleManagement: "/admin/users/all",
    getUserById: "/auth/users/:userId",
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
  domain: {
    getCategories: "/new-domain/categories",
    addCategory: "/new-domain/categories",
    updateCategory: "/new-domain/categories",
    deleteCategory: "/new-domain/categories",

    addSubCategory: "/new-domain/subcategories",
    getSubCategories: "/new-domain/subcategories",
    updateSubCategory: "/new-domain/subcategories",
    deleteSubCategory: "/new-domain/subcategories",

    createDomain: "/new-domain",
    getDomains: "/new-domain",
    updateDomain: "/new-domain",
    deleteDomain: "/new-domain",
  },
  payments: {
    initializeBulkTransfer: "/payments/bulk-transfer",
    verifyTransfer: "/payments/verify-transfer",
    checkUserBankDetails: "/payments/check-bank-details",
    testRecipientCreation: "/payments/test-recipient-creation",
    initializeBulkTransferWithInvoices: "/payments/bulk-transfer-with-invoices"
  },
  exchangeRate: {
    getByCountry: "/",
  },
  payStack: {
    verifyAccountDetails: "/payments/verify-account-number",
    listAllNGNBanks: "/payments/get-banks-by-country",
  },

  // Admin HVNC endpoints
  adminHVNC: {
    // Dashboard
    getStats: "/hvnc/admin/stats",
    getLiveDevices: "/hvnc/admin/devices/live",
    getActivity: "/hvnc/admin/activity",

    // Device Management
    getAllDevices: "/hvnc/admin/devices",
    getDeviceById: "/hvnc/admin/devices",       // + /:deviceId
    createDevice: "/hvnc/admin/devices",
    updateDevice: "/hvnc/admin/devices",         // + /:deviceId
    deleteDevice: "/hvnc/admin/devices",         // + /:deviceId
    generateAccessCode: "/hvnc/admin/devices",   // + /:deviceId/access-code/generate
    hubstaffStart: "/hvnc/admin/devices",        // + /:deviceId/hubstaff/start
    hubstaffPause: "/hvnc/admin/devices",        // + /:deviceId/hubstaff/pause

    // Shift / Schedule Management
    getAllShifts: "/hvnc/admin/shifts",
    getShiftById: "/hvnc/admin/shifts",          // + /:shiftId
    createShift: "/hvnc/admin/shifts",
    updateShift: "/hvnc/admin/shifts",           // + /:shiftId
    deleteShift: "/hvnc/admin/shifts",           // + /:shiftId
    getCalendar: "/hvnc/admin/shifts/calendar",
    getShiftUsers: "/hvnc/admin/shifts/users",
    getShiftDevices: "/hvnc/admin/devices",  // Updated to use actual devices endpoint

    // User Management
    getAllUsers: "/hvnc/admin/users",
    getUserById: "/hvnc/admin/users",            // + /:userId
    createUser: "/hvnc/admin/users",
    updateUser: "/hvnc/admin/users",             // + /:userId
    deleteUser: "/hvnc/admin/users",             // + /:userId
    resetUserPassword: "/hvnc/admin/users",      // + /:userId/reset-password
    unlockUser: "/hvnc/admin/users",             // + /:userId/unlock
    assignDevice: "/hvnc/admin/users",           // + /:userId/devices
    unassignDevice: "/hvnc/admin/users",         // + /:userId/devices/:deviceId
    getUserLogs: "/hvnc/admin/users",            // + /:userId/logs
  },

  // User HVNC endpoints
  userHVNC: {
    // Dashboard & Profile
    getDashboard: "/hvnc/user/dashboard",
    getProfile: "/hvnc/user/profile",
    updateProfile: "/hvnc/user/profile",
    
    // Device Management
    getDevices: "/hvnc/user/devices",
    getDeviceById: "/hvnc/user/devices",         // + /:deviceId
    
    // Session Management
    getSessions: "/hvnc/user/sessions",
    startSession: "/hvnc/user/sessions/start",
    endSession: "/hvnc/user/sessions",           // + /:sessionId/end
    getSession: "/hvnc/session",                 // + /:sessionId
    
    // Access Codes & Session Flow
    requestCode: "/hvnc/codes/request",
    validateCode: "/hvnc/codes/validate",
    cancelSession: "/hvnc/session/cancel",
    
    // Session Controls
    hubstaffPause: "/hvnc/session",              // + /:sessionId/hubstaff/pause
    hubstaffResume: "/hvnc/session",             // + /:sessionId/hubstaff/resume
    terminateSession: "/hvnc/session",           // + /:sessionId/terminate
    
    // Shift & Schedule
    getShifts: "/hvnc/user/shifts",
    getCurrentShift: "/hvnc/user/shifts/current",
    getUpcomingShifts: "/hvnc/user/shifts/upcoming",
    
    // Activity & Time Tracking
    getActivity: "/hvnc/user/activity",
    getTimeTracking: "/hvnc/user/time-tracking",
    
    // Notifications
    getNotifications: "/hvnc/user/notifications",
    markNotificationRead: "/hvnc/user/notifications", // + /:id/read
  },
};