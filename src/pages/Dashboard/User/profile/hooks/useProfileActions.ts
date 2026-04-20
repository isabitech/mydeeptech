import { useState, useEffect } from "react";
import { notification, FormInstance } from "antd";
import { useUpdateProfile } from "../../../../../hooks/useUpdateProfile";
import { formatProfileForForm, formatPayloadForAPI } from "../utils/index.js";
import {
  getTimezoneByCountry,
  getTimezoneDisplayName,
} from "../../../../../utils/countryTimezoneMapping";
import { Profile } from "../../../../../validators/profile/profile-schema";

export const useProfileActions = (
  profile: Profile | null | undefined,
  userId: string | undefined,
  profileRefetch: () => void,
  form: FormInstance,
  handleSaveDomains: () => Promise<void>,
  initializeSelectedDomains: () => void,
  selectedDomains: string[]
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [hasSelectedCountry, setHasSelectedCountry] = useState(false);
  const [accountVerification, setAccountVerification] = useState({
    hasVerifiedAccount: false,
    verificationSuccess: false
  });
  const { updateProfile, loading: updateLoading, error: updateError } = useUpdateProfile();

  // Allow external setting of account verification
  const updateAccountVerification = (data: { hasVerifiedAccount?: boolean; verificationSuccess?: boolean }) => {
    setAccountVerification(prev => ({ ...prev, ...data }));
  };

  // Initialize form when profile data is available
  useEffect(() => {
    if (profile) {
      form.setFieldsValue(formatProfileForForm(profile));

      if (profile?.personalInfo?.country) {
        setHasSelectedCountry(true);
      }

      // Check if we have existing account details that might be pre-verified
      if (
        profile?.paymentInfo?.accountName &&
        profile?.paymentInfo?.accountNumber &&
        profile?.paymentInfo?.bankCode
      ) {
        updateAccountVerification({ hasVerifiedAccount: true });
      }
    }
  }, [profile, form]);

  const handleCountryChange = (countryValue: string) => {
    const timezone = getTimezoneByCountry(countryValue);
    if (timezone) {
      const timezoneDisplayName = getTimezoneDisplayName(timezone);
      form.setFieldsValue({
        timeZone: timezoneDisplayName,
      });
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    
    // Re-populate form with current profile data when entering edit mode
    if (profile) {
      const formattedData = formatProfileForForm(profile);
      console.log("🔄 Setting form values:", formattedData);
      form.setFieldsValue(formattedData);
      
      // Immediately verify the account name was set
      setTimeout(() => {
        const accountNameInForm = form.getFieldValue("accountName");
        console.log("✅ Account name after form set:", accountNameInForm);
      }, 50);
    }
    
    // Initialize domains after form is populated
    setTimeout(() => {
      initializeSelectedDomains();
    }, 100);
  };

  const handleSave = async (hasVerifiedAccount?: boolean, verificationSuccess?: boolean) => {
    try {
      const values = await form.validateFields();

      if (!userId) {
        notification.error({
          message: "Error",
          description: "User ID not found. Please try logging in again.",
        });
        return;
      }

      // Validate that at least one domain is selected
      if (!selectedDomains || selectedDomains.length === 0) {
        notification.error({
          message: "Domain Selection Required",
          description: "Please select at least one domain before saving your profile.",
        });
        return;
      }

      // Validate account verification for NGN payments
      if (values.paymentCurrency === "NGN" && values.accountNumber && values.bankCode) {
        if (!hasVerifiedAccount && !verificationSuccess) {
          notification.error({
            message: "Account Verification Required",
            description: "Please verify your account details before saving. Ensure your account number and bank are correct.",
          });
          return;
        }
      }

      const payload = formatPayloadForAPI(values);
      const cleanPayload = JSON.parse(JSON.stringify(payload));
      const result = await updateProfile(userId, cleanPayload);

      // Also save domains (even if empty, to handle removals)
      await handleSaveDomains();

      if (result.success) {
        notification.success({
          message: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        setIsEditing(false);

        // Refresh profile data
        profileRefetch();
        
        // Preserve verification status after save
        if (
          profile?.paymentInfo?.accountName &&
          profile?.paymentInfo?.accountNumber &&
          profile?.paymentInfo?.bankCode
        ) {
          updateAccountVerification({ hasVerifiedAccount: true });
        }
      } else {
        notification.error({
          message: "Update Failed",
          description:
            result.data?.message ||
            result.error ||
            "Failed to update profile. Please try again.",
        });
      }
    } catch (error: unknown) {
      // Type guard for form validation errors
      const hasValidationErrors = error && 
        typeof error === 'object' && 
        'errorFields' in error && 
        Array.isArray((error as { errorFields: unknown[] }).errorFields) && 
        (error as { errorFields: unknown[] }).errorFields.length > 0;

      if (hasValidationErrors) {
        notification.error({
          message: "Validation Error",
          description: "Please check all required fields and try again.",
        });
      } else {
        // Extract error message with type safety
        let errorMessage = "An unexpected error occurred. Please try again.";
        
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error && typeof error === 'object') {
          const errorObj = error as Record<string, unknown>;
          // Check for axios-style error structure
          if (errorObj.response && typeof errorObj.response === 'object') {
            const response = errorObj.response as Record<string, unknown>;
            if (response.data && typeof response.data === 'object') {
              const data = response.data as Record<string, unknown>;
              if (typeof data.message === 'string') {
                errorMessage = data.message;
              }
            }
          } else if (typeof errorObj.message === 'string') {
            errorMessage = errorObj.message;
          }
        }
        
        // Fallback to updateError if available
        if (!errorMessage || errorMessage === "An unexpected error occurred. Please try again.") {
          errorMessage = updateError || errorMessage;
        }

        notification.error({
          message: "Update Failed",
          description: errorMessage,
        });
      }
    }
  };

  const handleCancel = () => {
    if (profile) {
      form.setFieldsValue(formatProfileForForm(profile));
    }
    setIsEditing(false);
  };

  return {
    isEditing,
    setIsEditing,
    hasSelectedCountry,
    setHasSelectedCountry,
    updateLoading,
    updateError,
    accountVerification,
    updateAccountVerification,
    handleCountryChange,
    handleEditClick,
    handleSave,
    handleCancel
  };
};