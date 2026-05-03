
const MUTATION = {
    // Domain Mutations
    createDomainCategory: "createDomainCategory",
    createDomainSubCategory: "createDomainSubCategory",
    createDomainChildCategory: "createDomainChildCategory",

    updateDomainCategory: "updateDomainCategory",
    deleteDomainCategory: "deleteDomainCategory",

    updateDomainSubCategory: "updateDomainSubCategory",
    deleteDomainSubCategory: "deleteDomainSubCategory",

    createDomain: "createDomain",
    updateDomain: "updateDomain",
    deleteDomain: "deleteDomain",

    bulkInvoicePayment: "bulkInvoicePayment",
    createPartnerInvoice: "createPartnerInvoice",
    updatePartnerInvoice: "updatePartnerInvoice",
    deletePartnerInvoice: "deletePartnerInvoice",
    sendPartnerInvoice: "sendPartnerInvoice",

    submitAssessmentReview: "submitAssessmentReview",
    updateAssessmentReview: "updateAssessmentReview",

    // Authentication Mutations
    userSignin: "userSignin",
    userSignup: "userSignup",

    resetPassword: "resetPassword",
    forgotPassword: "forgotPassword",

    // Chat Mutations
    startChat: "startChat",
    sendMessage: "sendMessage",

    //Project
    approveRejectedProjectApplicant: "approveRejectedProjectApplicant",
    
    // AI Recommendations
    sendBulkInvitations: "sendBulkInvitations",

    // Task Mutations
    createTask: "createTask",
    assignTaskToUsers: "assignTaskToUsers",
    deleteTask: "deleteTask",
    updateTask: "updateTask",

    // Micro Task Mutations
    createMicroTask: "createMicroTask",
    updateMicroTask: "updateMicroTask",
    deleteMicroTask: "deleteMicroTask",
    duplicateMicroTask: "duplicateMicroTask",
    updateMicroTaskStatus: "updateMicroTaskStatus",
    startMicroTaskSubmission: "startMicroTaskSubmission",
    uploadSubmissionImage: "uploadSubmissionImage",
    applyForTask: "uploadSubmissionImage",
    deleteSubmissionImage: "deleteSubmissionImage",
    submitForReview: "submitForReview",
    createTaskSlots: "createTaskSlots",
    reviewSubmissionImage: "reviewSubmissionImage",
    completeMicroTaskReview: "completeMicroTaskReview",
    bulkApproveMicroTasks: "bulkApproveMicroTasks",
    approveOrRejectApplication: "approveOrRejectApplication",
} as const;

const QUERY = {
    // Domain Queries
    getDomainCategories: "getDomainCategories",
    getDomainSubCategories: "getDomainSubCategories",
    getDomains: "getDomains",
    getDomainsWithCategorization: "getDomainsWithCategorization",
    getUserDomains: "getUserDomains",
    getAllInvoices: "getAllInvoices",

    getExchangeRateByCountry: "getExchangeRateByCountry",
    getPartnerInvoices: "getPartnerInvoices",

    // User Invoice Queries
    getUserInvoices: "getUserInvoices",
    getUnpaidInvoices: "getUnpaidInvoices",
    getPaidInvoices: "getPaidInvoices",
    getUserInvoiceDashboard: "getUserInvoiceDashboard",
    getUserInvoiceDetails: "getUserInvoiceDetails",

    assessmentReviews: "assessmentReviews",
    assessmentHistory: "assessmentHistory",
    retakeEligibility: "retakeEligibility",
    userNotifications: "userNotifications",
   

    userProfile: "userProfile",
    getUserProfile: "getUserProfile",

    userDashboardData: "userDashboardData",
    adminDashboardData: "adminDashboardData",
    sopAcceptanceStatus: "sopAcceptanceStatus",

    // Chat Queries
    chatHistory: "chatHistory",
    activeChats: "activeChats",
    chatTicket: "chatTicket",
    
    // Annotators Queries
    getAllDTUsers: "getAllDTUsers",
    getApprovedAnnotators: "getApprovedAnnotators",
    getPendingAnnotators: "getPendingAnnotators",
    getSubmittedAnnotators: "getSubmittedAnnotators",
    getRejectedAnnotators: "getRejectedAnnotators",
    getQAAnnotators: "getQAAnnotators",
    
    // AI Recommendations
    getAiRecommendations: "getAiRecommendations",
    getAiRecommendationStatus: "getAiRecommendationStatus",

    // Task Queries
    getAllTasks: "getAllTasks",
    getAssignedTaskToUsers: "assigned-tasks",
    usersAssignToTask: "usersAssignToTask",
    getAssignedTasks: "getAssignedTasks",
    getPaginatedUsers: "getPaginatedUsers",
    getMyTasks: "getMyTasks",
    // Micro Task Queries
    getAllMicroTasks: "getAllMicroTasks",
    getMicroTaskById: "getMicroTaskById",
    getMicroTaskStatistics: "getMicroTaskStatistics",
    getAvailableMicroTasks: "getAvailableMicroTasks",
    getMicroTaskSlots: "getMicroTaskSlots",
    getUserMicroTaskSubmissions: "getUserMicroTaskSubmissions",
    getUserMicroTaskEarningStatistics: "getUserMicroTaskEarningStatistics",
    getSingleTask: "getSingleTask",
    getMicroTaskSubmissionDetails: "getMicroTaskSubmissionDetails",
    checkMicroTaskEligibility: "checkMicroTaskEligibility",
    getPendingMicroTaskReviews: "getPendingMicroTaskReviews",
    getMicroTaskReviewStatistics: "getMicroTaskReviewStatistics",
    getMicroTaskReviewQueue: "getMicroTaskReviewQueue",
    getMicroTaskSubmissionForReview: "getMicroTaskSubmissionForReview",
    getTasksByFilter: "getTasksByFilter",

} as const;

const REACT_QUERY_KEYS = {
    MUTATION,
    QUERY,
} as const;

export default REACT_QUERY_KEYS;