import React from "react";
import { Form, Input, Select, Button, Spin } from "antd";
import { Bank } from "../../../../../../hooks/Auth/User/Paystack/useListAllNGNBanks";

interface NGNPaymentFormProps {
  form: any;
  isEditing: boolean;
  accountNumber: string;
  bankCode: string;
  isVerifying: boolean;
  verificationSuccess: boolean;
  verificationError: any;
  hasVerifiedAccount: boolean;
  allNGNBanks: Bank[];
  onManualVerification: () => void;
  onVerificationRefetch: () => void;
}

const NGNPaymentForm: React.FC<NGNPaymentFormProps> = ({
  form,
  isEditing,
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
  return (
    <>
      <Form.Item
        label={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Account Name</span>
              {isVerifying && (<Spin size="small" />)}
              {verificationSuccess && (<span className="text-green-500 text-xs">✓ Verified</span>)}
              {verificationError && (<span className="text-red-500 text-xs">✗ Verification failed</span>)}
            </div>
            {isEditing && accountNumber?.length === 10 && bankCode && !isVerifying && (
              <Button
                type="link"
                size="small"
                onClick={onManualVerification}
                style={{ padding: 0, height: "auto" }}
              >
                {verificationError ? "Retry" : "Verify"}
              </Button>
            )}
          </div>
        }
        name="accountName"
        rules={[
          {
            required: true,
            message: "Account verification is required",
          },
        ]}
        help={
          !hasVerifiedAccount && accountNumber && bankCode && accountNumber.length === 10
            ? "Verifying account details..."
            : hasVerifiedAccount
              ? "Account verified with Paystack"
              : isEditing
                ? "Enter a 10-digit account number and select your bank for automatic verification"
                : "Account name from verification"
        }
      >
        <Input
          disabled={true} // Always disabled - populated by verification
          className={`!font-[gilroy-regular] ${verificationSuccess
            ? "border-green-500 bg-green-50"
            : verificationError
              ? "border-red-500 bg-red-50"
              : isVerifying
                ? "border-blue-500 bg-blue-50"
                : ""
            }`}
          placeholder={
            isVerifying
              ? "Verifying account..."
              : "Account name will appear after verification"
          }
          suffix={
            isVerifying ? (
              <Spin size="small" />
            ) : verificationSuccess ? (
              <span className="text-green-500">✓</span>
            ) : verificationError ? (
              <span className="text-red-500">✗</span>
            ) : null
          }
        />
      </Form.Item>

      <Form.Item
        label="Account Number"
        name="accountNumber"
        rules={[
          {
            required: true,
            message: "Account number is required",
          },
          {
            pattern: /^\d{10}$/,
            message: "Account number must be 10 digits",
          },
        ]}
        help={
          accountNumber?.length === 10 && bankCode
            ? isVerifying
              ? "Verifying account..."
              : verificationSuccess
                ? "Account verified ✓"
                : verificationError
                  ? "Verification failed. Please check your details."
                  : "Ready for verification"
            : "Enter your 10-digit account number"
        }
      >
        <Input
          disabled={!isEditing}
          className={`!font-[gilroy-regular] ${accountNumber?.length === 10 && bankCode
            ? verificationSuccess
              ? "border-green-500"
              : verificationError
                ? "border-red-500"
                : isVerifying
                  ? "border-blue-500"
                  : ""
            : ""
            }`}
          placeholder="Enter 10-digit account number"
          maxLength={10}
        />
      </Form.Item>

      <Form.Item
        label="Bank Name"
        name="bankName"
        rules={[
          {
            required: true,
            message: "Bank name is required",
          },
        ]}
      >
        <Select
          disabled={!isEditing}
          className="!font-[gilroy-regular]"
          placeholder="Select your bank"
          showSearch
          onChange={(value, option) => {
            if (option && typeof option === "object" && "bankCode" in option && "bank_slug" in option) {
              form.setFieldsValue({
                bankCode: option.bankCode,
                bank_slug: option.bank_slug,
              });

              // Manual verification trigger if account number is ready
              const currentAccountNumber = form.getFieldValue("accountNumber");
              if (currentAccountNumber?.length === 10) {
                onVerificationRefetch();
              }
            }
          }}
          filterOption={(input, option) =>
            (option?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          options={allNGNBanks.map((bank: Bank) => ({
            label: bank.name,
            value: bank.name,
            bankCode: bank.code,
            bank_slug: bank.slug,
          }))}
        />
      </Form.Item>

      {/* Hidden form fields for bankCode and bank_slug */}
      <Form.Item name="bankCode" style={{ display: "none" }}>
        <Input type="hidden" />
      </Form.Item>

      <Form.Item name="bank_slug" style={{ display: "none" }}>
        <Input type="hidden" />
      </Form.Item>

      <Form.Item label="Payment Method" name="paymentMethod">
        <Select
          disabled={!isEditing}
          placeholder="Select payment method"
          options={[
            {
              value: "bank_transfer",
              label: "Bank Transfer",
            },
            { value: "mobile_money", label: "Mobile Money" },
          ]}
        />
      </Form.Item>
    </>
  );
};

export default NGNPaymentForm;