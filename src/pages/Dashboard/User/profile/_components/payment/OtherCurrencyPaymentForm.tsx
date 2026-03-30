import React from "react";
import { Form, Input, Select } from "antd";

interface OtherCurrencyPaymentFormProps {
  form: any;
  isEditing: boolean;
}

const OtherCurrencyPaymentForm: React.FC<OtherCurrencyPaymentFormProps> = ({
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
        label="Account Details"
        name="accountNumber"
        rules={[
          {
            required: true,
            message: "Account details are required",
          },
        ]}
      >
        <Input
          disabled={!isEditing}
          className="!font-[gilroy-regular]"
          placeholder="Enter account number or relevant details"
        />
      </Form.Item>
      <Form.Item
        label="Bank/Institution Name"
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
          placeholder="Enter bank or financial institution name"
        />
      </Form.Item>
      <Form.Item
        label="Payment Method"
        name="paymentMethod"
      >
        <Select
          disabled={!isEditing}
          placeholder="Select payment method"
          options={[
            {
              value: "bank_transfer",
              label: "Bank Transfer",
            },
            { value: "wise", label: "Wise" },
            { value: "paypal", label: "PayPal" },
            {
              value: "mobile_money",
              label: "Mobile Money",
            },
          ]}
        />
      </Form.Item>
    </>
  );
};

export default OtherCurrencyPaymentForm;