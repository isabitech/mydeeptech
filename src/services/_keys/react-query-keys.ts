
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

    assessmentReviews: "assessmentReviews",
   

    userProfile: "userProfile",
    getUserProfile: "getUserProfile",

    userDashboardData: "userDashboardData",
} as const;

const REACT_QUERY_KEYS = {
    MUTATION,
    QUERY,
} as const;

export default REACT_QUERY_KEYS;