import React from "react";
import { Form, Input, Select } from "antd";

interface GBPPaymentFormProps {
  form: any;
  isEditing: boolean;
}

const GBPPaymentForm: React.FC<GBPPaymentFormProps> = ({
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
          placeholder="Enter full name as on account"
        />
      </Form.Item>
      <Form.Item
        label="Sort Code"
        name="accountNumber"
        rules={[
          {
            required: true,
            message: "Sort code is required",
          },
          {
            pattern: /^\d{2}-\d{2}-\d{2}$/,
            message: "Sort code format: XX-XX-XX",
          },
        ]}
      >
        <Input
          disabled={!isEditing}
          className="!font-[gilroy-regular]"
          placeholder="Enter sort code (e.g., 12-34-56)"
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
        <Input
          disabled={!isEditing}
          className="!font-[gilroy-regular]"
          placeholder="Enter bank name"
        />
      </Form.Item>
      <Form.Item label="Payment Method" name="paymentMethod">
        <Select
          disabled={!isEditing}
          placeholder="Select payment method"
          options={[
            {
              value: "bank_transfer",
              label: "UK Bank Transfer",
            },
            { value: "wise", label: "Wise" },
            { value: "paypal", label: "PayPal" },
          ]}
        />
      </Form.Item>
    </>
  );
};

export default GBPPaymentForm;