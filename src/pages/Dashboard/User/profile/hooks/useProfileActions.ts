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
    initializeSelectedDomains();
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
    } catch (error: any) {
      if (error.errorFields && error.errorFields.length > 0) {
        notification.error({
          message: "Validation Error",
          description: "Please check all required fields and try again.",
        });
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          updateError ||
          "An unexpected error occurred. Please try again.";

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