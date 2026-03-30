import React from "react";
import { Form, Input, Select } from "antd";

interface ZARPaymentFormProps {
  form: any;
  isEditing: boolean;
}

const ZARPaymentForm: React.FC<ZARPaymentFormProps> = ({
  form,
  isEditing,
}) => {
  return (
    <>
      <Form.Item
        label="Account Holder Name"
        name="accountName"
        rules={[
          {
            required: true,
            message: "Account holder name is required",
          },
        ]}
      >
        <Input
          disabled={!isEditing}
          className="!font-[gilroy-regular]"
          placeholder="Enter account holder name"
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
        ]}
      >
        <Input
          disabled={!isEditing}
          className="!font-[gilroy-regular]"
          placeholder="Enter account number"
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
          options={[
            { value: "ABSA Bank", label: "ABSA Bank" },
            {
              value: "Standard Bank",
              label: "Standard Bank",
            },
            {
              value: "First National Bank",
              label: "First National Bank (FNB)",
            },
            { value: "Nedbank", label: "Nedbank" },
            { value: "Capitec Bank", label: "Capitec Bank" },
            {
              value: "Discovery Bank",
              label: "Discovery Bank",
            },
            { value: "African Bank", label: "African Bank" },
          ]}
        />
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
            { value: "wise", label: "Wise" },
          ]}
        />
      </Form.Item>
    </>
  );
};

export default ZARPaymentForm;