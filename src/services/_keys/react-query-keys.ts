
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
    updateAssessmentReview: "updateAssessmentReview",

    userProfile: "userProfile",
} as const;

const REACT_QUERY_KEYS = {
    MUTATION,
    QUERY,
} as const;

export default REACT_QUERY_KEYS;