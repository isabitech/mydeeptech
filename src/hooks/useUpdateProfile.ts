import { useState } from "react";
import { endpoints } from "../store/api/endpoints";
import { retrieveTokenFromStorage } from "../helpers";
import { getErrorMessage } from "../service/apiUtils";

export interface UpdateProfilePayload {
  personalInfo?: {
    fullName?: string;
    phoneNumber?: string;
    country?: string;
    timeZone?: string;
    availableHoursPerWeek?: number;
    preferredCommunicationChannel?: string;
  };
  paymentInfo?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    bankCode?: string;
    paymentMethod?: string;
    paymentCurrency?: string;
  };
  professionalBackground?: {
    educationField?: string;
    yearsOfExperience?: number;
    annotationExperienceTypes?: string[];
  };
  languageProficiency?: {
    primaryLanguage?: string;
    otherLanguages?: string[];
    englishFluencyLevel?: string;
  };
  annotationSkills?: string[];
  toolExperience?: string[];
  attachments?: {
    resumeUrl?: string;
    idDocumentUrl?: string;
  };
  domains?: string[];
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  profile?: any;
}

interface UpdateProfileResult {
  success: boolean;
  data?: UpdateProfileResponse;
  error?: string;
}

export const useUpdateProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (
    userId: string,
    payload: UpdateProfilePayload
  ): Promise<UpdateProfileResult> => {
    setLoading(true);
    setError(null);

    try {
      // Get authentication token
      const token = await retrieveTokenFromStorage();
      if (!token) {
        const errorMessage = "No authentication token found. Please login again.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoints.profileDT.updateProfile}/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        // Try to get the error message from response body
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If can't parse JSON, use default message
        }
        throw new Error(errorMessage);
      }

      const data: UpdateProfileResponse = await response.json();

      if (data.success) {
        return { success: true, data };
      } else {
        const errorMessage = data.message || "Failed to update profile";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
  };

  return {
    updateProfile,
    loading,
    error,
    resetState,
  };
};
