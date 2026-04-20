import { Profile } from "../../../../../validators/profile/profile-schema";

/**
 * Formats profile data for form field values
 * @param profile - The profile data from API
 * @returns Formatted object for form.setFieldsValue()
 */
export const formatProfileForForm = (profile: Profile | null | undefined) => {
  if (!profile) return {};

  return {
    fullName: profile?.personalInfo?.fullName,
    phoneNumber: profile?.personalInfo?.phoneNumber,
    country: profile?.personalInfo?.country,
    timeZone: profile?.personalInfo?.timeZone,
    availableHoursPerWeek: profile?.personalInfo?.availableHoursPerWeek,
    preferredCommunicationChannel: profile?.personalInfo?.preferredCommunicationChannel,
    accountName: profile?.paymentInfo?.accountName,
    accountNumber: profile?.paymentInfo?.accountNumber,
    bankName: profile?.paymentInfo?.bank_slug ? profile?.paymentInfo?.bankName : undefined,
    bankCode: profile?.paymentInfo?.bankCode,
    bank_slug: profile?.paymentInfo?.bank_slug,
    paymentMethod: profile?.paymentInfo?.paymentMethod,
    paymentCurrency: profile?.paymentInfo?.paymentCurrency,
    educationField: profile?.professionalBackground?.educationField,
    yearsOfExperience: profile?.professionalBackground?.yearsOfExperience,
    annotationSkills: profile?.annotationSkills || [],
    toolExperience: profile?.toolExperience || [],
    primaryLanguage: profile?.languageProficiency?.primaryLanguage,
    englishFluencyLevel: profile?.languageProficiency?.englishFluencyLevel,
    resumeUrl: profile?.attachments?.resumeUrl,
    idDocumentUrl: profile?.attachments?.idDocumentUrl,

    // System Information - preserve exact values, only use defaults for null/undefined
    deviceType: profile?.systemInfo?.deviceType ?? "",
    operatingSystem: profile?.systemInfo?.operatingSystem ?? "",
    internetSpeedMbps: profile?.systemInfo?.internetSpeedMbps ?? 0,
    powerBackup: profile?.systemInfo?.powerBackup ?? false,
    hasWebcam: profile?.systemInfo?.hasWebcam ?? false,
    hasMicrophone: profile?.systemInfo?.hasMicrophone ?? false,
  };
};