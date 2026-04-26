import React from "react";
import { Form, Select, Card, FormInstance } from "antd";
import { Bank } from "../../../../../hooks/Auth/User/Paystack/useListAllNGNBanks";
import NGNPaymentForm from "./payment/NGNPaymentForm";
import USDPaymentForm from "./payment/USDPaymentForm"; 
import EURPaymentForm from "./payment/EURPaymentForm";
import GBPPaymentForm from "./payment/GBPPaymentForm";
import ZARPaymentForm from "./payment/ZARPaymentForm";
import KESPaymentForm from "./payment/KESPaymentForm";
import OtherCurrencyPaymentForm from "./payment/OtherCurrencyPaymentForm";

interface PaymentInfoFormProps {
  form: FormInstance;
  isEditing: boolean;
  paymentCurrency: string;
  paymentMethod: string;
  accountNumber: string;
  bankCode: string;
  isVerifying: boolean;
  verificationSuccess: boolean;
  verificationError: Error | null;
  hasVerifiedAccount: boolean;
  allNGNBanks: Bank[];
  onManualVerification: () => void;
  onVerificationRefetch: () => void;
}

const PaymentInfoForm: React.FC<PaymentInfoFormProps> = ({
  form,
  isEditing,
  paymentCurrency,
  paymentMethod,
  accountNumber,
  bankCode,
  isVerifying,
  verificationSuccess,
  verificationError,
  hasVerifiedAccount,
  allNGNBanks,
  onManualVerification,
  onVerificationRefetch,
}) => {
  const handleCurrencyChange = (newCurrency: string) => {
    // Only clear fields if user is actively changing currency (not during form initialization)
    if (isEditing && newCurrency !== paymentCurrency) {
      form.setFieldsValue({
        accountName: undefined,
        accountNumber: undefined,
        bankName: undefined,
        paymentMethod: undefined,
      });
    }
  };

  return (
    <Card 
      title={
        <div className="flex items-center flex-wrap">
          <span>Payment Information</span> 
          {paymentCurrency === "NGN" && isNaN(Number(bankCode)) && (
            <span className="text-red-500 text-xs">
              <span className="text-black ml-1">:</span> Kindly verify your account information now!
            </span>
          )}
        </div>
      } 
      className="mb-6"
    >
          <Form.Item label="Payment Currency" name="paymentCurrency" className="col-span-1">
            <Select
              disabled={!isEditing}
              className="!font-[gilroy-regular]"
              placeholder="Select payment currency first"
              onChange={handleCurrencyChange}
              options={[
                { value: "NGN", label: "NGN - Nigerian Naira" },
                { value: "USD", label: "USD - US Dollar" },
                { value: "EUR", label: "EUR - Euro" },
                { value: "GBP", label: "GBP - British Pound" },
                { value: "CAD", label: "CAD - Canadian Dollar" },
                { value: "AUD", label: "AUD - Australian Dollar" },
                { value: "ZAR", label: "ZAR - South African Rand" },
                { value: "KES", label: "KES - Kenyan Shilling" },
                { value: "GHS", label: "GHS - Ghanaian Cedi" },
                { value: "EGP", label: "EGP - Egyptian Pound" },
              ]}
            />
          </Form.Item>

          {paymentCurrency && (
            <>
              {paymentCurrency === "NGN" && (
                <NGNPaymentForm
                  form={form}
                  isEditing={isEditing}
                  accountNumber={accountNumber}
                  bankCode={bankCode}
                  isVerifying={isVerifying}
                  verificationSuccess={verificationSuccess}
                  verificationError={verificationError}
                  hasVerifiedAccount={hasVerifiedAccount}
                  allNGNBanks={allNGNBanks}
                  onManualVerification={onManualVerification}
                  onVerificationRefetch={onVerificationRefetch}
                />
              )}

              {paymentCurrency === "USD" && (
                <USDPaymentForm
                  form={form}
                  isEditing={isEditing}
                  paymentMethod={paymentMethod}
                />
              )}

              {paymentCurrency === "EUR" && (
                <EURPaymentForm
                  form={form}
                  isEditing={isEditing}
                />
              )}

              {paymentCurrency === "GBP" && (
                <GBPPaymentForm
                  form={form}
                  isEditing={isEditing}
                />
              )}

              {paymentCurrency === "ZAR" && (
                <ZARPaymentForm
                  form={form}
                  isEditing={isEditing}
                />
              )}

              {paymentCurrency === "KES" && (
                <KESPaymentForm
                  form={form}
                  isEditing={isEditing}
                />
              )}

              {!["NGN", "USD", "EUR", "GBP", "ZAR", "KES"].includes(paymentCurrency) && (
                <OtherCurrencyPaymentForm
                  form={form}
                  isEditing={isEditing}
                />
              )}
            </>
          )}
    </Card>
  );
};

export default PaymentInfoForm;