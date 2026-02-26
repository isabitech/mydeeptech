
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
} as const;

const QUERY = {
    // Domain Queries
    getDomainCategories: "getDomainCategories",
    getDomainSubCategories: "getDomainSubCategories",
    getDomains: "getDomains",
    getDomainsWithCategorization: "getDomainsWithCategorization", 
    getAllInvoices: "getAllInvoices",
} as const;

const REACT_QUERY_KEYS = {
    MUTATION,
    QUERY,
} as const;

export default REACT_QUERY_KEYS;