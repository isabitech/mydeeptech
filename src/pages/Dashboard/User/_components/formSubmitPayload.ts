import { SubmitAssessmentReviewPayload } from "../../../../hooks/Auth/User/useSubmitAssessment";

const formSubmitPayload = (values: any) => {

    const payload: SubmitAssessmentReviewPayload = {
            fullName: values.fullName,
            emailAddress: values.emailAddress,
            dateOfSubmission: values.dateOfSubmission?.format('YYYY-MM-DD'),
            timeOfSubmission: values.timeOfSubmission?.format('hh:mm A'),
            submissionStatus: {
                englishTestUploaded: true,
                problemSolvingTestUploaded: true
            },
            englishTestScore: values.englishTestScore,
            problemSolvingScore: values.problemSolvingScore,
            googleDriveLink: values.googleDriveLink,
            encounteredIssues: values.encounteredIssues === 'Yes' 
                ? "Yes, I encountered issues." 
                : "No, the process was smooth.",
            issueDescription: values.encounteredIssues === 'Yes' ? values.issueDescription : "",
            instructionClarityRating: values.instructionClarityRating
    };

        return payload;
}

export { formSubmitPayload }