import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, Input, Button, Alert, Spin, Checkbox } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useAdminLogin } from "../../../hooks/Auth/Admin/useAdminLogin";
import mydeepTechLogo from '../../../assets/deeptech.png';

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>("");

  const { login, loading, error, resetState } = useAdminLogin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Reset state when component mounts
    resetState();

    // Check for success message from signup
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Pre-fill email if provided
      if (location.state.email) {
        setFormData((prev) => ({
          ...prev,
          email: location.state.email,
        }));
      }
    }

    // Check if admin credentials are saved in localStorage
    const savedEmail = localStorage.getItem("adminEmail");
    if (savedEmail && !location.state?.email) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        rememberMe: true,
      }));
    }
  }, []); // Remove resetState from dependencies to avoid infinite loop

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear specific field error when user starts typing
    if (typeof value === "string" && formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Save email to localStorage if remember me is checked
    if (formData.rememberMe) {
      localStorage.setItem("adminEmail", formData.email);
    } else {
      localStorage.removeItem("adminEmail");
    }

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    // Navigation is handled in the useAdminLogin hook
    if (result.success) {
      navigate("/admin/overview");
      console.log("Admin login successful, navigating to dashboard");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br font-[gilroy-regular] from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >

        <div className="flex justify-center items-center w-28 mx-auto">
          <img src={mydeepTechLogo} alt="Logo" className="h-full w-full mb-6 rounded-md" />
        </div>
        <Card className="shadow-2xl border-0 font-[gilroy-regular]">
          <div className="text-center mb-6">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-800 mb-2"
            >
              Admin Login
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600"
            >
              Sign in to your admin account to access the dashboard
            </motion.p>
          </div>

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4"
            >
              <Alert
                message="Success"
                description={successMessage}
                type="success"
                showIcon
                closable
                onClose={() => setSuccessMessage("")}
              />
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4"
            >
              <Alert
                message="Login Failed"
                description={error}
                type="error"
                showIcon
                closable
                onClose={resetState}
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                size="large"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onKeyPress={handleKeyPress}
                status={formErrors.email ? "error" : ""}
                autoComplete="email"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input.Password
                size="large"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onKeyPress={handleKeyPress}
                status={formErrors.password ? "error" : ""}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                autoComplete="current-password"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Checkbox
                checked={formData.rememberMe}
                onChange={(e) =>
                  handleInputChange("rememberMe", e.target.checked)
                }
              >
                Remember me
              </Checkbox>

              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => {
                  // You can implement forgot password functionality here
                  console.log(
                    "Forgot password functionality to be implemented"
                  );
                }}
              >
                Forgot password?
              </button>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6"
            >
              <Button
                type="primary"
                size="large"
                block
                onClick={handleSubmit}
                disabled={loading}
                className="bg-primary hover:bg-primary-dark border-secondary hover:border-secondary !font-[gilroy-regular]"
              >
                {loading ? (
                  <>
                    <Spin size="small" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-6"
          >
            <p className="text-gray-600">
              Don't have an admin account?{" "}
              <button
                onClick={() => navigate("/auth/admin-signup")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Request access
              </button>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-4 pt-4 border-t border-gray-200"
          >
            <p className="text-gray-500 text-sm">
              Regular user?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                User login
              </button>
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
