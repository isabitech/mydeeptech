import { Button, Form, Input } from "antd";

const Reset = () => {
  return (
    <div className=" flex flex-col gap-4">
      <p>Reset Password</p>

      <Form>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Please enter your password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
        >
          <Input.Password
            className="!font-[gilroy-regular] !text-[#333333] !h-12 !w-[15rem] !rounded-md !p-4"
            placeholder="Old password"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Please enter your password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
        >
          <Input.Password
            className="!font-[gilroy-regular] !text-[#333333] !h-12 !w-[15rem] !rounded-md !p-4"
            placeholder="New password"
          />
        </Form.Item>

        <Form.Item
          hasFeedback
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
            className="!font-[gilroy-regular] !text-[#333333] !h-12 !w-[15rem] !rounded-md !p-4"
            placeholder="Confirm new password"
          />
        </Form.Item>

        <Button
          className="  !font-[gilroy-regular] !text-white  bg-secondary  !h-12 !mt-4"
          type="primary"
          htmlType="submit"
        >
          Reset
        </Button>
      </Form>
    </div>
  );
};

export default Reset;
