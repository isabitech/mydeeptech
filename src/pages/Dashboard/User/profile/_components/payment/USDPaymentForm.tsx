import React from "react";
import { Form, Input, Select } from "antd";

interface USDPaymentFormProps {
  form: any;
  isEditing: boolean;
  paymentMethod: string;
}

const USDPaymentForm: React.FC<USDPaymentFormProps> = ({
  form,
  isEditing,
  paymentMethod,
}) => {
  const handlePaymentMethodChange = () => {
    form.setFieldsValue({
      accountName: undefined,
      accountNumber: undefined,
      bankName: undefined,
    });
  };

  return (
    <>
      <Form.Item
        label="Payment Method"
        name="paymentMethod"
        rules={[
          {
            required: true,
            message: "Payment method is required",
          },
        ]}
      >
        <Select
          disabled={!isEditing}
          placeholder="Select payment method"
          onChange={handlePaymentMethodChange}
          options={[
            { value: "paypal", label: "PayPal" },
            {
              value: "wise",
              label: "Wise (formerly TransferWise)",
            },
            {
              value: "bank_transfer",
              label: "US Bank Transfer",
            },
            {
              value: "cryptocurrency",
              label: "Cryptocurrency",
            },
          ]}
        />
      </Form.Item>

      {paymentMethod === "paypal" && (
        <Form.Item
          label="PayPal Email"
          name="accountNumber"
          rules={[
            {
              required: true,
              message: "PayPal email is required",
            },
            {
              type: "email",
              message: "Please enter a valid email",
            },
          ]}
        >
          <Input
            disabled={!isEditing}
            className="!font-[gilroy-regular]"
            placeholder="Enter your PayPal email address"
            type="email"
          />
        </Form.Item>
      )}

      {paymentMethod === "wise" && (
        <>
          <Form.Item
            label="Wise Email"
            name="accountNumber"
            rules={[
              {
                required: true,
                message: "Wise email is required",
              },
              {
                type: "email",
                message: "Please enter a valid email",
              },
            ]}
          >
            <Input
              disabled={!isEditing}
              className="!font-[gilroy-regular]"
              placeholder="Enter your Wise email address"
              type="email"
            />
          </Form.Item>
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
        </>
      )}

      {paymentMethod === "bank_transfer" && (
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
              placeholder="Enter full name on account"
            />
          </Form.Item>
          <Form.Item
            label="Routing Number"
            name="accountNumber"
            rules={[
              {
                required: true,
                message: "Routing number is required",
              },
              {
                pattern: /^\d{9}$/,
                message: "Routing number must be 9 digits",
              },
            ]}
          >
            <Input
              disabled={!isEditing}
              className="!font-[gilroy-regular]"
              placeholder="Enter 9-digit routing number"
              maxLength={9}
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
        </>
      )}

      {paymentMethod === "cryptocurrency" && (
        <>
          <Form.Item
            label="Wallet Address"
            name="accountNumber"
            rules={[
              {
                required: true,
                message: "Wallet address is required",
              },
            ]}
          >
            <Input
              disabled={!isEditing}
              className="!font-[gilroy-regular]"
              placeholder="Enter your wallet address"
            />
          </Form.Item>
          <Form.Item
            label="Cryptocurrency Type"
            name="bankName"
            rules={[
              {
                required: true,
                message: "Cryptocurrency type is required",
              },
            ]}
          >
            <Select
              disabled={!isEditing}
              placeholder="Select cryptocurrency"
              options={[
                {
                  value: "Bitcoin (BTC)",
                  label: "Bitcoin (BTC)",
                },
                {
                  value: "Ethereum (ETH)",
                  label: "Ethereum (ETH)",
                },
                { value: "USDT", label: "USDT" },
                { value: "USDC", label: "USDC" },
              ]}
            />
          </Form.Item>
        </>
      )}
    </>
  );
};

export default USDPaymentForm;