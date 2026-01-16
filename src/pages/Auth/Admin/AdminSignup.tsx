import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, Input, Button, Alert, Spin, notification } from "antd";
import { useNavigate } from "react-router-dom";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useAdminSignup } from "../../../hooks/Auth/Admin/useAdminSignup";
import { useAdminVerifyOTP } from "../../../hooks/Auth/Admin/useAdminVerifyOTP";
import mydeepTechLogo from '../../../assets/deeptech.png';

const AdminSignup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<"signup" | "verify-otp">("signup");
  const [userEmail, setUserEmail] = useState<string>("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    adminKey: "",
  });

  const [otp, setOtp] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [otpError, setOtpError] = useState("");

  const { signup, loading: signupLoading, error: signupError, resetState: resetSignupState } = useAdminSignup();
  const { verifyOTP, loading: otpLoading, error: otpVerifyError, resetState: resetOtpState } = useAdminVerifyOTP();
  const navigate = useNavigate();

  useEffect(() => {
    // Reset states when component mounts
    resetSignupState();
    resetOtpState();
  }, []); // Remove dependencies to avoid infinite loop

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s+/g, ""))) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.adminKey.trim()) {
      errors.adminKey = "Admin key is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSubmit = async () => {
    if (currentStep === "signup") {
      if (!validateForm()) {
        return;
      }

      const result = await signup(formData);

      if (result.success && result.data) {
        notification.success({
          message: `${result.data.message || "Signup successful! Please verify your email."}`,

        })
        setUserEmail(formData.email);
        setCurrentStep("verify-otp");
      }
    } else if (currentStep === "verify-otp") {
      if (!validateOtp()) {
        return;
      }

      const result = await verifyOTP({
        verificationCode: otp,
        email: userEmail,
        adminKey: formData.adminKey,
      });

      if (result.success) {
        // Navigate to admin login with success message
        navigate("/auth/admin-login", {
          state: {
            message: "Admin account created and verified successfully! You can now log in.",
            email: userEmail
          }
        });
      }
    }
  };

  const validateOtp = (): boolean => {
    if (!otp.trim()) {
      setOtpError("OTP is required");
      return false;
    }

    if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits");
      return false;
    }

    if (!/^\d{6}$/.test(otp)) {
      setOtpError("OTP must contain only numbers");
      return false;
    }

    setOtpError("");
    return true;
  };

  const handleOtpChange = (value: string) => {
    // Allow only numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    setOtp(numericValue);

    // Clear error when user starts typing
    if (otpError) {
      setOtpError("");
    }
  };

  return (
    <div className="min-h-screen font-[gilroy-regular] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
          {currentStep === "signup" ? (
            <>
              <div className="text-center mb-6 font-[gilroy-regular]">
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-gray-800 mb-2"
                >
                  Admin Sign Up
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600"
                >
                  Create your admin account to manage the platform
                </motion.p>
              </div>

              {signupError && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-4"
                >
                  <Alert
                    message="Error"
                    description={signupError}
                    type="error"
                    showIcon
                    closable
                    onClose={resetSignupState}
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
                    Full Name
                  </label>
                  <Input
                    size="large"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    status={formErrors.fullName ? "error" : ""}
                  />
                  {formErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                  )}
                </div>

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
                    status={formErrors.email ? "error" : ""}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    size="large"
                    placeholder="Enter your phone number (e.g., +1234567890)"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    status={formErrors.phone ? "error" : ""}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
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
                    status={formErrors.password ? "error" : ""}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <Input.Password
                    size="large"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    status={formErrors.confirmPassword ? "error" : ""}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Key
                  </label>
                  <Input
                    size="large"
                    placeholder="Enter admin access key"
                    value={formData.adminKey}
                    onChange={(e) => handleInputChange("adminKey", e.target.value)}
                    status={formErrors.adminKey ? "error" : ""}
                  />
                  {formErrors.adminKey && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.adminKey}</p>
                  )}
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
                    disabled={signupLoading}
                    className="bg-primary hover:bg-primary-dark border-secondary hover:border-secondary !font-[gilroy-regular]"
                  >
                    {signupLoading ? (
                      <>
                        <Spin size="small" className="mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Admin Account"
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
                  Already have an admin account?{" "}
                  <button
                    onClick={() => navigate("/auth/admin-login")}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              </motion.div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-gray-800 mb-2"
                >
                  Verify Your Email
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600"
                >
                  We've sent a 6-digit verification code to {userEmail}. Please enter it below to complete your registration.
                </motion.p>
              </div>

              {otpVerifyError && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-4"
                >
                  <Alert
                    message="Error"
                    description={otpVerifyError}
                    type="error"
                    showIcon
                    closable
                    onClose={resetOtpState}
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
                    Verification Code
                  </label>
                  <Input
                    size="large"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    status={otpError ? "error" : ""}
                    maxLength={6}
                    className="text-center text-2xl font-mono tracking-widest"
                    autoComplete="one-time-code"
                  />
                  {otpError && (
                    <p className="mt-1 text-sm text-red-600">{otpError}</p>
                  )}
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
                    disabled={otpLoading || !otp}
                    className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                  >
                    {otpLoading ? (
                      <>
                        <Spin size="small" className="mr-2" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center"
                >
                  <p className="text-gray-600 text-sm mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    onClick={() => {
                      // You can implement resend OTP functionality here
                      console.log("Resend OTP functionality to be implemented");
                    }}
                    disabled={otpLoading}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-gray-400"
                  >
                    Resend verification code
                  </button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center mt-6 pt-4 border-t border-gray-200"
              >
                <p className="text-gray-600 text-sm">
                  Want to change your email?{" "}
                  <button
                    onClick={() => setCurrentStep("signup")}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Back to signup
                  </button>
                </p>
              </motion.div>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminSignup;
