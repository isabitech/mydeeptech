import { useState, useEffect } from "react";
import { FormInstance, notification } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useVerifyAccountNumber } from "../../../../../hooks/Auth/User/Paystack/useVerifyAccountNumber";
import { Profile } from "../../../../../validators/profile/profile-schema";

export const useAccountVerification = (
  isEditing: boolean,
  paymentCurrency: string,
  accountNumber: string,
  bankCode: string,
  form: FormInstance,
  profile: Profile | null | undefined
) => {
  const queryClient = useQueryClient();
  const [hasVerifiedAccount, setHasVerifiedAccount] = useState(false);
  const [shouldVerify, setShouldVerify] = useState(false);
  const [verificationValues, setVerificationValues] = useState({ accountNumber: "", bankCode: "" });
  const [initialAccountData, setInitialAccountData] = useState({ accountNumber: "", bankCode: "", accountName: "" });

  // Initialize verification status based on existing profile data
  useEffect(() => {
    if (isEditing && profile) {
      // Small delay to ensure form is populated first
      const timer = setTimeout(() => {
        // Use profile data directly instead of reading from form (timing issue fix)
        const profileAccountName = profile?.paymentInfo?.accountName || "";
        const profileAccountNumber = profile?.paymentInfo?.accountNumber || "";
        const profileBankCode = profile?.paymentInfo?.bankCode || "";
        
        // Store initial account data for comparison
        setInitialAccountData({
          accountNumber: profileAccountNumber,
          bankCode: profileBankCode,
          accountName: profileAccountName
        });
        
        // If account already has verified details from database, mark as verified
        if (profileAccountName && profileAccountNumber && profileBankCode && paymentCurrency === "NGN") {
          setHasVerifiedAccount(true);
        }
      }, 150); // Small delay to ensure form is populated

      return () => clearTimeout(timer);
    }
  }, [isEditing, profile, paymentCurrency]);

  // Safeguard: Ensure account name is preserved in edit mode
  useEffect(() => {
    if (isEditing && profile?.paymentInfo?.accountName && paymentCurrency === "NGN") {
      const timer = setTimeout(() => {
        const currentAccountName = form.getFieldValue("accountName");
        if (!currentAccountName && profile?.paymentInfo?.accountName) {
          form.setFieldsValue({ accountName: profile.paymentInfo.accountName });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isEditing, form, profile?.paymentInfo?.accountName, paymentCurrency]);

  // Account verification (only when manual verification is triggered)
  const {
    data: verificationData,
    isLoading: isVerifying,
    error: verificationError,
    isSuccess: verificationSuccess,
    refetch: verificationRefetch
  } = useVerifyAccountNumber(
    shouldVerify && paymentCurrency === "NGN" ? verificationValues.accountNumber : "",
    shouldVerify && paymentCurrency === "NGN" ? verificationValues.bankCode : ""
  );

  // Handle account verification result (only for NGN currency)
  useEffect(() => {
    if (paymentCurrency !== "NGN") return;

    // const bankCode = form.getFieldValue("bankCode");
    if (verificationSuccess && verificationData?.success) {
      const accountName = verificationData.data?.accountName;
      if (accountName) {
        form.setFieldsValue({ accountName: accountName });
        setHasVerifiedAccount(true);
        notification.success({
          message: "Account Verified",
          description: `Account verified successfully for ${accountName}`,
          duration: 3,
        });
      }
    } else if (verificationError) {
      setHasVerifiedAccount(false);
      form.setFieldsValue({ accountName: "" });
      notification.error({
        message: "Verification Failed",
        description: "Unable to verify account details. Please check your account number and bank selection.",
        duration: 4,
      });
    }
  }, [verificationSuccess, verificationData, verificationError, form, paymentCurrency]);

  // Reset verification status only when account details actually change from saved values
  useEffect(() => {
    if (paymentCurrency !== "NGN" || !isEditing || !initialAccountData.accountNumber) return;
    
    const currentAccountNumber = form.getFieldValue("accountNumber");
    const currentBankCode = form.getFieldValue("bankCode");
    
    // Only reset if the user has changed the account details from what was initially loaded
    const accountDetailsChanged = 
      currentAccountNumber !== initialAccountData.accountNumber ||
      currentBankCode !== initialAccountData.bankCode;
    
    // Only reset verification if account details actually changed AND we have new details to verify
    if (accountDetailsChanged && currentAccountNumber && currentBankCode) {
      setHasVerifiedAccount(false);
      setShouldVerify(false);
      setVerificationValues({ accountNumber: "", bankCode: "" });
      // Clear account name only when user changes account details to new values
      // Don't clear if we're just initializing the form
      const currentAccountName = form.getFieldValue("accountName");
      if (currentAccountName && currentAccountName === initialAccountData.accountName) {
        // Don't clear the original account name - user is just editing with existing data
        return;
      }
      form.setFieldsValue({ accountName: "" });
    }
  }, [accountNumber, bankCode, isEditing, form, paymentCurrency, initialAccountData.accountNumber, initialAccountData.bankCode, initialAccountData.accountName]);

  // Reset shouldVerify when exiting edit mode
  useEffect(() => {
    if (!isEditing) {
      setShouldVerify(false);
      setVerificationValues({ accountNumber: "", bankCode: "" });
    }
  }, [isEditing]);

  const handleManualVerification = async () => {
    // Get current form values instead of using stale props
    const currentAccountNumber = form.getFieldValue("accountNumber");
    const currentBankCode = form.getFieldValue("bankCode");
    
    if (currentAccountNumber?.length === 10 && currentBankCode) {
      // Reset verification state and clear account name only when manually verifying
      setHasVerifiedAccount(false);
      form.setFieldsValue({ accountName: "" }); // Clear only when user clicks verify
      
      if (isNaN(Number(currentBankCode))) {
        return notification.error({
          message: "Invalid Account Code",
          description: "Please select your bank",
        });
      }

      // Set the values for verification
      setVerificationValues({ accountNumber: currentAccountNumber, bankCode: currentBankCode });

      // Invalidate all verification queries
      await queryClient.invalidateQueries({
        queryKey: ["verifyAccountNumber"]
      });

      // Enable verification - this will trigger the useEffect above
      setShouldVerify(true);
    } else {
      notification.warning({
        message: "Incomplete Information",
        description: "Please enter a valid 10-digit account number and select your bank first.",
      });
    }
  };

  return {
    hasVerifiedAccount,
    setHasVerifiedAccount,
    isVerifying,
    verificationSuccess,
    verificationError,
    handleManualVerification,
    verificationRefetch
  };
};