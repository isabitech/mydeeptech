import { SubmitAssessmentReviewPayload } from "../../../../hooks/Auth/User/useSubmitAssessment";
import { Dayjs } from 'dayjs';

export interface FormValues {
    fullName: string;
    emailAddress: string;
    dateOfSubmission: Dayjs;
    timeOfSubmission: Dayjs;
    englishTestScore: number;
    problemSolvingScore: number;
    googleDriveLink: string;
    encounteredIssues: 'Yes' | 'No';
    issueDescription?: string;
    instructionClarityRating: number;
}

const formSubmitPayload = (values: FormValues) => {
    const payload: SubmitAssessmentReviewPayload = {
            fullName: values.fullName,
            emailAddress: values.emailAddress,
            dateOfSubmission: values.dateOfSubmission?.format('YYYY-MM-DD'),
            timeOfSubmission: values.timeOfSubmission?.format('hh:mm A'),
            submissionStatus: {
                englishTestUploaded: true,
                problemSolvingTestUploaded: true
            },
            englishTestScore: values.englishTestScore.toString(),
            problemSolvingScore: values.problemSolvingScore.toString(),
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