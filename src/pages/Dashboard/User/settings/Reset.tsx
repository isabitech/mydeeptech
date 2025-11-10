import { Button, Form, Input, message } from "antd";
import { useResetPassword } from "../../../../hooks/Auth/User/useResetPassword";

const Reset = () => {
  const [form] = Form.useForm();
  const { resetPassword, loading, error } = useResetPassword();

  const handleSubmit = async (values: any) => {
    try {
      const result = await resetPassword({
        currentPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      if (result.success) {
        message.success("Password reset successfully!");
        form.resetFields();
      } else {
        message.error(result.error || "Failed to reset password");
      }
    } catch (error) {
      message.error("An unexpected error occurred");
    }
  };
  return (
    <div className=" flex flex-col gap-4">
      <p>Reset Password</p>

      <Form form={form} onFinish={handleSubmit}>
        <Form.Item
          name="oldPassword"
          rules={[
            { required: true, message: "Please enter your current password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
        >
          <Input.Password
            className="!font-[gilroy-regular] !text-[#333333] !h-12 !w-[15rem] !rounded-md !p-4"
            placeholder="Old password"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          rules={[
            { required: true, message: "Please enter your new password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
            {
              pattern: new RegExp(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/
              ),
              message:
                "Password must contain at least one lowercase letter, uppercase letter, number, and special character",
            },
          ]}
        >
          <Input.Password
            className="!font-[gilroy-regular] !text-[#333333] !h-12 !w-[15rem] !rounded-md !p-4"
            placeholder="New password"
          />
        </Form.Item>

        <Form.Item
          hasFeedback
          name="confirmPassword"
          rules={[
            {
              required: true,
              message: "Confirm password must match password",
            },
            {
              min: 6,
              message: "Password must have a minimum length of 6",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
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
            className="!font-[gilroy-regular] !text-[#333333] !h-12 !w-[15rem] !rounded-md !p-4"
            placeholder="Confirm new password"
          />
        </Form.Item>

        <Button
          className="!font-[gilroy-regular] !text-white bg-secondary !h-12 !mt-4"
          type="primary"
          htmlType="submit"
          loading={loading}
        >
          Reset Password
        </Button>
      </Form>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default Reset;
