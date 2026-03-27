import { useState, useEffect } from "react";
import { notification } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useVerifyAccountNumber } from "../../../../../hooks/Auth/User/Paystack/useVerifyAccountNumber";

export const useAccountVerification = (
  isEditing: boolean,
  paymentCurrency: string,
  accountNumber: string,
  bankCode: string,
  form: any
) => {
  const queryClient = useQueryClient();
  const [hasVerifiedAccount, setHasVerifiedAccount] = useState(false);

  // Account verification (only when editing, NGN currency, and both accountNumber and bankCode are available and valid)
  const {
    data: verificationData,
    isLoading: isVerifying,
    error: verificationError,
    isSuccess: verificationSuccess,
    refetch: verificationRefetch
  } = useVerifyAccountNumber(
    isEditing && paymentCurrency === "NGN" && bankCode && !isNaN(Number(bankCode)) ? (accountNumber || "") : "",
    isEditing && paymentCurrency === "NGN" && bankCode && !isNaN(Number(bankCode)) ? (bankCode || "") : ""
  );

  // Handle account verification result (only for NGN currency)
  useEffect(() => {
    if (paymentCurrency !== "NGN") return;

    const bankCode = form.getFieldValue("bankCode");
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

  // Reset verification status when account number or bank changes (only for NGN currency)
  useEffect(() => {
    if (paymentCurrency !== "NGN") return;
    if (isEditing && (accountNumber || bankCode)) {
      setHasVerifiedAccount(false);
      form.setFieldsValue({ accountName: "" });
    }
  }, [accountNumber, bankCode, isEditing, form, paymentCurrency]);

  const handleManualVerification = async () => {
    if (accountNumber?.length === 10 && bankCode) {
      // Reset verification state
      setHasVerifiedAccount(false);
      form.setFieldsValue({ accountName: "" });
      if (isNaN(Number(bankCode))) {
        return notification.error({
          message: "Invalid Account Code",
          description: "Please select your bank",
        });
      }

      // Invalidate and refetch the verification query
      await queryClient.invalidateQueries({
        queryKey: ["verifyAccountNumber", accountNumber, bankCode]
      });

      // Manually trigger refetch
      verificationRefetch();
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