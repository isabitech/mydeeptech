
const formatUserInfo = (data: any) => {
    if (!data) return null;

    return {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        domains: data.domains,
        socialsFollowed: data.socialsFollowed,
        consent: data.consent,
        isEmailVerified: data.isEmailVerified,
        hasSetPassword: data.hasSetPassword,
        annotatorStatus: data.annotatorStatus,
        microTaskerStatus: data.microTaskerStatus,
        resultLink: data.resultLink,
        qaStatus: data.qaStatus,
        isAssessmentSubmitted: data.isAssessmentSubmitted,
    };
}

export { formatUserInfo };