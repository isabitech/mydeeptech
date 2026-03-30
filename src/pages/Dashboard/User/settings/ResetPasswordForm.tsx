import { Button, Form, Input, message } from "antd";
import authMutationService from "../../../../services/authentication/auth-mutation";
import { ResetPasswordSchema } from "../../../../validators/authentication/user-reset-password-schema";
import errorMessage from "../../../../lib/error-message";
import { AlertCircle } from "lucide-react";
const ResetPasswordForm = () => {

  const [form] = Form.useForm();

  const { resetPasswordMutation, isResetPasswordLoading, isResetPasswordError, resetPasswordError } = authMutationService.useResetPassword();

  const handleSubmit = async (values: ResetPasswordSchema) => {

    const result = ResetPasswordSchema.safeParse(values);

    if (!result.success) {
      const errorMessages = result.error.issues[0]?.message;
      message.error(errorMessages);
      return;
    }

    resetPasswordMutation.mutate(result.data, {
      onSuccess: () => {
        message.success({
          content: "Password reset successful!",
          key: "resetPasswordSuccess",
        });
        form.resetFields();
      },
      onError: (error) => {
        const errorMsg = errorMessage(error);
        message.error({
          content: errorMsg,
          key: "resetPasswordError",
        });
      },
    });
  };


  return (
    <div className="flex flex-col gap-4 w-full">


      <Form form={form} onFinish={handleSubmit} className="flex flex-col gap-4 w-[100%] lg:w-[50%]">
        {/* Error Display */}
        {isResetPasswordError && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-red-800 text-sm">{errorMessage(resetPasswordError)}</p>
            </div>
          </div>
        )}
        <h2 className="font-semibold text-lg">Reset Password</h2>
        <Form.Item
          name="currentPassword"
          rules={[
            { required: true, message: "Please enter your current password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
        >
          <Input.Password
            autoComplete="current-password"
            className="!font-[gilroy-regular] !text-[#333333] !h-11 !rounded-md"
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
            autoComplete="new-password"
            className="!font-[gilroy-regular] !text-[#333333]  !h-11 !rounded-md"
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
            className="!font-[gilroy-regular] !text-[#333333] !h-11 !rounded-md"
            placeholder="Confirm new password"
            autoComplete="confirm-password"
          />
        </Form.Item>

        <Button
          className="!font-[gilroy-regular] !text-white bg-secondary !h-11 !mt-4"
          type="primary"
          htmlType="submit"
          disabled={isResetPasswordLoading}
          loading={isResetPasswordLoading}
        >
          Reset Password
        </Button>
      </Form>


    </div>
  );
};

export default ResetPasswordForm;
