import { Form, Input, Button, notification } from "antd";
import { useState } from "react";
import { endpoints } from "../../store/api/endpoints"; // Assuming endpoints are defined
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../UserContext"; // Adjust path

const Login = () => {
  const { setUserInfo } = useUserContext(); // Get the setUserInfo function
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: any) => {
    setIsLoading(true);

    try {
      const response = await fetch(endpoints.auth.login, {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      if (response.ok) {
        // Update the context with user info
        setUserInfo({
          firstName: result.user.firstname,
          lastName: result.user.lastname,
          email: result.user.email,
          userId: result.user._id,
          phone: result.user.phone,
          userName: result.user.username,
          userRole: result.user.role,
        });

        sessionStorage.setItem("authToken", result.token); // Save token to session
        notification.success({
          message: "Login Successful",
          description: "You have successfully logged in.",
        });

        if (result.user.role === "USER") {
          navigate("/admin/overview"); // Navigate after successful login
        }
      } else {
        notification.error({
          message: "Login Failed",
          description: result.message || "Invalid credentials.",
        });
      }
    } catch (error) {
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
            className="!font-[gilroy-regular] !text-primary !h-12"
            placeholder="Enter your email"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="!font-[gilroy-regular] !text-white">Password</span>
          }
          name="password"
          rules={[{ required: true, message: "Please enter your password!" }]}
        >
          <Input.Password
            className="!font-[gilroy-regular] !text-primary !h-12"
            placeholder="Enter your password"
          />
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
