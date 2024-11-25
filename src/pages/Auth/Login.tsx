import { Form, Input, Button, notification } from "antd";
import { useState } from "react";
import { endpoints } from "../../store/api/endpoints"; // Assuming endpoints are defined
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate()
  const handleLogin = async (values: any) => {
    setIsLoading(true);

    try {
      // Send login request to the API
      const response = await fetch(endpoints.auth.login, {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        // Assuming the response contains a token or user session information
        sessionStorage.setItem("authToken", result.token); // Save token to sessionStorage
        sessionStorage.setItem("user", JSON.stringify(result.user)); // Save user info to sessionStorage

        notification.success({
          message: "Login Successful",
          description: "You have successfully logged in.",
        });

        // Redirect to the dashboard or home page
        navigate("/dashboard/overview"); // You can use React Router for navigation if needed
      } else {
        notification.error({
          message: "Login Failed",
          description: result.message || "Invalid credentials or error occurred.",
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      notification.error({
        message: "Login Failed",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="!font-[gilroy-regular] !text-white mt-14">
      <h2 className="text-center text-2xl font-bold mb-4">Hi, Welcome Back!</h2>
      <Form layout="vertical" onFinish={handleLogin}>
        <Form.Item
          label={<span className="!font-[gilroy-regular] !text-white">Email Address</span>}
          name="email"
          rules={[
            { required: true, message: "Please enter your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input className="!font-[gilroy-regular] !text-primary !h-12" placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          label={<span className="!font-[gilroy-regular] !text-white">Password</span>}
          name="password"
          rules={[{ required: true, message: "Please enter your password!" }]}
        >
          <Input.Password className="!font-[gilroy-regular] !text-primary !h-12" placeholder="Enter your password" />
        </Form.Item>

        <span className="text-white text-right w-full underline cursor-pointer">
          <p className="mr-4">Forgot Password?</p>
        </span>

        <Button
          className="!font-[gilroy-regular] !text-white !border-primary bg-secondary !w-full !h-12 !mt-4"
          type="primary"
          htmlType="submit"
          loading={isLoading} // Show loading spinner while request is being made
          disabled={isLoading} // Disable button while loading
        >
          Login
        </Button>
      </Form>
    </div>
  );
};

export default Login;
