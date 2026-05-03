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
    me: "/auth/me",
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
    verifyOTPExisting: "/admin/verify-otp-existing",
    resendOTP: "/admin/resend-otp",
    resendOTPExisting: "/admin/resend-otp-existing",
    login: "/admin/login",
    getRegistrationState: "/admin/registration-state",
    saveRegistrationState: "/admin/registration-state",
  },

  // Admin dashboard endpoint
  adminDashboard: {
    getDashboard: "/admin/dashboard",
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
     approveRejectedProjectApplicant: "/admin/applications/approve-rejected-project-applicant",
  },

  // User project endpoints
  userProject: {
    projects: "/auth/projects", // New unified endpoint that supports view and status parameters
    projectById: "/auth/projects", // Get single project by ID: /auth/projects/:projectId
    browseProjects: "/auth/projects", // Legacy endpoint for backward compatibility
    applyToProject: "/auth/projects",
    getActiveProjects: "/auth/activeProjects", // Legacy endpoint
  },

  adminActions: {
    getAllDTUsers: "/admin/dtusers",
    updateUserStatus: "/admin/dtusers",
    approveAnnotator: "/admin/dtusers",
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
    pagination: "/partner-invoice/pagination",
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
    createTask: "/tasks/createTasks",
    assignTaskToUsers: "/tasks/assignTaskToUsers",
    // getAllTasks: "/auth/getAllTasks",
    deleteTask: "/auth/deleteTask",
    updateTask: "/tasks/updateTask",
    getAssignedTasks: "/tasks/assigned-tasks", // User assigned tasks
    getPaginatedUsers: "/tasks/get-paginated-users", // User assigned tasks
    getMyTasks: "/tasks/me", // Get tasks assigned to the logged-in user

    // Admin
    getAllTasks: "/tasks/getAllTasks",
    getAssignedTaskToUsers: "/tasks/assigned-tasks",
    usersAssignToTask: "/tasks/usersAssignToTask",
    getSingleTask: "/tasks/getSingleTask",
  },

  // Micro Task endpoints
  microTasks: {
    // Admin endpoints
    createTask: "/micro-tasks",
    getAllTasks: "/micro-tasks",
    getTaskById: "/micro-tasks",
    updateTask: "/micro-tasks",
    deleteTask: "/micro-tasks",
    updateTaskStatus: "/micro-tasks",
    duplicateTask: "/micro-tasks",
    getStatistics: "/micro-tasks/statistics",
    getTaskSlots: "/micro-tasks",
    // User endpoints
    getAvailableTasks: "/micro-tasks/available/me",
    allTasks: "/micro-tasks/all",
    filters: "/micro-tasks/filters",
    approveOrRejectApplication: "/micro-tasks/approve_or_reject_application", // Approve or reject task applications
     
  },

  // Micro Task Submissions endpoints
  microTaskSubmissions: {
    getUserSubmissions: "/micro-task-submissions/me",
    checkEligibility: "/micro-task-submissions/tasks",
    startSubmission: "/micro-task-submissions/tasks",
    getSubmissionDetails: "/micro-tasks/submission",
    uploadImage: "/micro-task-submissions",
    deleteImage: "/micro-task-submissions",
    submitForReview: "/micro-task-submissions",
    getEarningStatistics: "/micro-task-submissions/earnings",
  },

  // Micro Task QA endpoints
  microTaskQA: {
    getPendingReviews: "/micro-task-qa/pending",
    getReviewQueue: "/micro-task-qa/queue",
    getReviewStatistics: "/micro-task-qa/statistics",
    getSubmissionForReview: "/micro-task-qa/submission",
    reviewImage: "/micro-task-qa/review",
    completeReview: "/micro-task-qa/complete",
    bulkApprove: "/micro-task-qa/bulk-approve",
    assignReviewer: "/micro-task-qa/assign",
    getReviewerSubmissions: "/micro-task-qa/reviewer",
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
    history: "/assessments/history",
    retakeEligibility: "/assessments/retake-eligibility",
    assessmentReview: "/assessment-reviews",
    assessmentReviews: "/assessment-reviews",
    updateReviewAssessment: "/assessment-reviews",
  },
  aiInterview: {
    candidateOverview: "/ai-interviews/overview",
    tracks: "/ai-interviews/tracks",
    startSession: "/ai-interviews/sessions",
    session: "/ai-interviews/sessions",
    focusEvents: "/ai-interviews/sessions",
    result: "/ai-interviews/results",
    adminOverview: "/admin/ai-interviews/overview",
    adminSessions: "/admin/ai-interviews",
    report: "/admin/ai-interviews",
    schedule: "/admin/ai-interviews/schedule",
    decision: "/admin/ai-interviews",
    note: "/admin/ai-interviews",
  },
  
  // AI Recommendation endpoints
  aiRecommendations: {
    getRecommendations: "/ai-recommendations/projects",
    sendInvitations: "/ai-recommendations/projects",
    getStatus: "/ai-recommendations/status",
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
  rbac: {
    permissions: {
      all: "/roles-permission/permission/all",
      search: "/roles-permission/permission/all/name",
      byId: "/roles-permission/permission",
      create: "/roles-permission/permission/create",
      update: "/roles-permission/permission/update",
      delete: "/roles-permission/permission/delete",
    },
    roles: {
      all: "/roles-permission/role/all",
      byId: "/roles-permission/role",
      create: "/roles-permission/role/create",
      update: "/roles-permission/role/update",
      addPermissions: "/roles-permission/role/:id",
      removePermission: "/roles-permission/role/:id/permissions/remove",
      delete: "/roles-permission/role",
      assignUser: "/roles-permission/role/:roleId/assign-user/:userId",
    },
    users: {
      all: "/admin/admin-users",
      updateRole: "/admin/users/:userId/role",
      assignRolePermission: "/admin/users/:userId/role-permission",
    },
    resources: {
      base: "/resources",
      meAllowed: "/resources/me/allowed",
      search: "/resources/search",
      byId: "/resources/:id",
      togglePublish: "/resources/:id/toggle-publish",
    }
  },
  sop: {
      getSopAcceptanceStatus: "/auth/sop-acceptance/status",
      recordSopAcceptance: "/auth/sop-acceptance",
  }
};
