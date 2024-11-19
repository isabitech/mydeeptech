import { Form, Input, Button } from "antd";

const Login = () => {
  const handleLogin = (values: any) => {
    console.log("Login Data:", values);
  };

  return (
    <div className=" !font-[gilroy-regular] !text-white mt-14">
      <h2 className="text-center text-2xl font-bold mb-4">Hi, Welcome Back!</h2>
      <Form layout="vertical" onFinish={handleLogin}>
        <Form.Item
          label={
            <span className=" !font-[gilroy-regular] !text-white">
              Email Address
            </span>
          }
          name="email"
          rules={[
            { required: true, message: "Please enter your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input className=" !font-[gilroy-regular] !text-white !h-12" placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          label={
            <span className=" !font-[gilroy-regular] !text-white">
              Password
            </span>
          }
          name="password"
          rules={[{ required: true, message: "Please enter your password!" }]}
        >
          <Input.Password className=" !font-[gilroy-regular] !text-white !h-12" placeholder="Enter your password" />
        </Form.Item>

        <span className="text-white text-right w-full underline cursor-pointer"><p className=" mr-4">Forgot Password?</p></span>

        <Button className=" !font-[gilroy-regular] !text-white !border-primary bg-secondary !w-full !h-12 !mt-4" type="primary" htmlType="submit" >
          Login
        </Button>
      </Form>
    </div>
  );
};

export default Login;
