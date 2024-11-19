import { Form, Input, Button } from "antd";

const Signup = () => {
  const handleSignup = (values: any) => {
    console.log("Sign Up Data:", values);
  };

  return (
    <div>
      <h2 className="text-center text-2xl !text-white font-[gilroy-regular] mb-4">
        Sign Up
      </h2>
      <Form
        layout="vertical"
        onFinish={handleSignup}
        className=" !font-[gilroy-regular] !text-white"
      >
        <Form.Item
          label={
            <span className=" !font-[gilroy-regular] !text-white">
              First Name
            </span>
          }
          name="firstName"
          rules={[{ required: true, message: "Please enter your first name!" }]}
        >
          <Input
            className=" !font-[gilroy-regular] !!text-[#333333] !h-12"
            placeholder="Enter your First Name"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className=" !font-[gilroy-regular] !text-white">
              Last Name
            </span>
          }
          name="lastName"
          rules={[{ required: true, message: "Please enter your last name!" }]}
        >
          <Input
            className=" !font-[gilroy-regular] !text-[#333333] !h-12"
            placeholder="Enter your Last Name"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className=" !font-[gilroy-regular] !text-white">
              Username
            </span>
          }
          name="username"
          rules={[{ required: true, message: "Please enter your username!" }]}
        >
          <Input
            className=" !font-[gilroy-regular] !text-[#333333] !h-12"
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
            className=" !font-[gilroy-regular] !text-[#333333] !h-12"
            placeholder="Enter your email"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className=" !font-[gilroy-regular] !text-white">
              Phone Number
            </span>
          }
          name="phone"
          rules={[{ required: true, message: "Please enter your phone!" }]}
        >
          <Input
            className=" !font-[gilroy-regular] !text-[#333333] !h-12"
            placeholder="Enter Phone Number"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className=" !font-[gilroy-regular] !text-white">
              Password
            </span>
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
            <span className=" !font-[gilroy-regular] !text-white">
              Confirm Password
            </span>
          }
          name={"confirmpassword"}
          rules={[
            {
              required: true,
              message: "Confirm password must match password",
            },
            {
              min: 8,
              message: "Password must have a minimum length of 8",
            },
            {
              pattern: new RegExp(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/
              ),
              message:
                "Password must contain at least one lowercase letter, uppercase letter, number, and special character",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The new password that you entered do not match!")
                );
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
          className=" hover:!bg-secondary !font-[gilroy-regular] !text-white !border-primary bg-secondary !w-full !h-12 !mt-4"
          type="primary"
          htmlType="submit"
        >
          Sign Up
        </Button>
      </Form>
    </div>
  );
};

export default Signup;
