import React from "react";
import { Form, Input, Select } from "antd";

interface EURPaymentFormProps {
  form: any;
  isEditing: boolean;
}

const EURPaymentForm: React.FC<EURPaymentFormProps> = ({
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
        label="IBAN"
        name="accountNumber"
        rules={[
          { required: true, message: "IBAN is required" },
          {
            pattern: /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/,
            message: "Please enter a valid IBAN",
          },
        ]}
      >
        <Input
          disabled={!isEditing}
          className="!font-[gilroy-regular]"
          placeholder="Enter IBAN (e.g., DE89370400440532013000)"
          style={{ textTransform: "uppercase" }}
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
              value: "sepa_transfer",
              label: "SEPA Transfer",
            },
            { value: "wise", label: "Wise" },
            { value: "paypal", label: "PayPal" },
          ]}
        />
      </Form.Item>
    </>
  );
};

export default EURPaymentForm;