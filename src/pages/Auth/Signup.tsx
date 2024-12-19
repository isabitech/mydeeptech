import { Form, Input, Button, notification } from "antd";
import { useState } from "react";
import { endpoints } from "../../store/api/endpoints";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (values: any) => {
    setIsLoading(true);

    // Adjust phone number to match API pattern
    const formattedPhone = values.phone.startsWith("0")
      ? values.phone.slice(1) // Remove leading zero
      : values.phone;

    try {
      const response = await fetch(endpoints.auth.signup, {
        method: "POST",
        body: JSON.stringify({
          firstname: values.firstName,
          lastname: values.lastName,
          email: values.email,
          password: values.password,
          username: values.username,
          phone: formattedPhone, // Use formatted phone
        }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (response.ok) {
        notification.open({
          type: "success",
          message: result.message || "Registration Succesful Kindly Login",
        });
        form.resetFields();
        navigate("/dashboard/overview");
      } else {
        notification.open({
          type: "error",
          message: result.message || "Signup failed! Please try again.",
        });
      }
    } catch (error) {
      console.error("Error during signup:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-center text-2xl !text-white font-[gilroy-regular] mb-4">
        Sign Up
      </h2>
      <Form
        onFinish={handleSignup}
        form={form}
        layout="vertical"
        className="!font-[gilroy-regular] !text-white"
      >
        <Form.Item
          label={
            <span className="!font-[gilroy-regular] !text-white">
              First Name
            </span>
          }
          name="firstName"
          rules={[{ required: true, message: "Please enter your first name!" }]}
        >
          <Input
            className="!font-[gilroy-regular] !text-[#333333] !h-12"
            placeholder="Enter your First Name"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="!font-[gilroy-regular] !text-white">
              Last Name
            </span>
          }
          name="lastName"
          rules={[{ required: true, message: "Please enter your last name!" }]}
        >
          <Input
            className="!font-[gilroy-regular] !text-[#333333] !h-12"
            placeholder="Enter your Last Name"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="!font-[gilroy-regular] !text-white">Username</span>
          }
          name="username"
          rules={[{ required: true, message: "Please enter your username!" }]}
        >
          <Input
            className="!font-[gilroy-regular] !text-[#333333] !h-12"
            placeholder="Enter a username"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="!font-[gilroy-regular] !text-white">
              Email Address
            </span>
          }
          name="email"
          rules={[
            { required: true, message: "Please enter your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input
            className="!font-[gilroy-regular] !text-[#333333] !h-12"
            placeholder="Enter your email"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="!font-[gilroy-regular] !text-white">
              Phone Number
            </span>
          }
          name="phone"
          rules={[{ required: true, message: "Please enter your phone!" }]}
        >
          <Input
            className="!font-[gilroy-regular] !text-[#333333] !h-12"
            placeholder="Enter Phone Number"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="!font-[gilroy-regular] !text-white">Password</span>
          }
          name="password"
          rules={[
            { required: true, message: "Please enter your password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
        >
          <Input.Password
            className="!font-[gilroy-regular] !text-[#333333] !h-12"
            placeholder="Enter your password"
          />
        </Form.Item>

        <Form.Item
          hasFeedback
          label={
            <span className="!font-[gilroy-regular] !text-white">
              Confirm Password
            </span>
          }
          name="confirmpassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password
            className="!font-[gilroy-regular] !text-[#333333] !h-12"
            placeholder="Confirm your password"
          />
        </Form.Item>

        <Button
          className="hover:!bg-secondary !font-[gilroy-regular] !text-white !border-primary bg-secondary !w-full !h-12 !mt-4"
          type="primary"
          htmlType="submit"
          loading={isLoading} // Show loading spinner
          disabled={isLoading} // Disable button while loading
        >
          Sign Up
        </Button>
      </Form>
    </div>
  );
};

export default Signup;
