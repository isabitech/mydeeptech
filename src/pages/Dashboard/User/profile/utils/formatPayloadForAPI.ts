interface ProfileFormValues {
  country?: string;
  timeZone?: string;
  availableHoursPerWeek?: string | number;
  preferredCommunicationChannel?: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  bankCode?: string;
  bank_slug?: string;
  paymentMethod?: string;
  paymentCurrency?: string;
  educationField?: string;
  yearsOfExperience?: string | number;
  annotationSkills?: string[];
  toolExperience?: string[];
  nativeLanguages?: string[];
  otherLanguages?: string[];
  primaryLanguage?: string;
  englishFluencyLevel?: string;
  resumeUrl?: string;
  idDocumentUrl?: string;
  deviceType?: string;
  operatingSystem?: string;
  internetSpeedMbps?: string | number;
  powerBackup?: boolean;
  hasWebcam?: boolean;
  hasMicrophone?: boolean;
}

/**
 * Formats form values into API payload structure
 * @param values - The form values from form.getFieldsValue()
 * @returns Formatted payload object for API submission
 */

export const formatPayloadForAPI = (values: ProfileFormValues | null | undefined) => {
  if (!values) return {};

  return {
    personalInfo: {
      country: values.country,
      timeZone: values.timeZone,
      availableHoursPerWeek: values.availableHoursPerWeek
        ? Number(values.availableHoursPerWeek)
        : undefined,
      preferredCommunicationChannel: values.preferredCommunicationChannel,
    },
    paymentInfo: {
      accountName: values.accountName,
      accountNumber: values.accountNumber,
      bankName: values.bankName,
      bankCode: values.bankCode,
      bank_slug: values.bank_slug,
      paymentMethod: values.paymentMethod,
      paymentCurrency: values.paymentCurrency,
    },
    professionalBackground: {
      educationField: values.educationField,
      yearsOfExperience: values.yearsOfExperience
        ? Number(values.yearsOfExperience)
        : undefined,
    },
    annotationSkills: values.annotationSkills || [],
    toolExperience: values.toolExperience || [],
    languageProficiency: {
      nativeLanguages: values.nativeLanguages,
      otherLanguages: values.otherLanguages,
      primaryLanguage: values.primaryLanguage,
      englishFluencyLevel: values.englishFluencyLevel,
    },
    attachments: {
      resumeUrl: values.resumeUrl,
      idDocumentUrl: values.idDocumentUrl,
    },
    systemInfo: {
      deviceType: values.deviceType || "",
      operatingSystem: values.operatingSystem || "",
      internetSpeedMbps: values.internetSpeedMbps
        ? Number(values.internetSpeedMbps)
        : 0,
      powerBackup: Boolean(values.powerBackup),
      hasWebcam: Boolean(values.hasWebcam),
      hasMicrophone: Boolean(values.hasMicrophone),
    },
  };
};