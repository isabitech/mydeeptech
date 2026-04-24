import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, Input, Button, Alert, Spin, notification } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useAdminSignup } from "../../../hooks/Auth/Admin/useAdminSignup";
import { useAdminVerifyOTP } from "../../../hooks/Auth/Admin/useAdminVerifyOTP";
import { useAdminVerifyExistingOTP } from "../../../hooks/Auth/Admin/useAdminVerifyExistingOTP";
import { useAdminResendOTP } from "../../../hooks/Auth/Admin/useAdminResendOTP";
import { useAdminResendExistingOTP } from "../../../hooks/Auth/Admin/useAdminResendExistingOTP";
import { useAdminRegistrationState } from "../../../hooks/Auth/Admin/useAdminRegistrationState";
import { AdminAuthResult } from "../../../types/admin";
import mydeepTechLogo from '../../../assets/deeptech.png';

interface LocationState {
  fromLogin?: boolean;
  email?: string;
  fullName?: string;
  message?: string;
}

type CurrentStep = "signup" | "verify-otp";

const AdminSignup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<CurrentStep>("signup");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isRestoringState, setIsRestoringState] = useState(true);
  const [isFromLogin, setIsFromLogin] = useState(false); // Track if user is coming from login

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    adminKey: "",
  });

  const [otp, setOtp] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [otpError, setOtpError] = useState("");

  const { signup, loading: signupLoading, error: signupError, resetState: resetSignupState } = useAdminSignup();
  const { verifyOTP: verifyNewOTP, loading: newOtpLoading, error: newOtpVerifyError, resetState: resetNewOtpState } = useAdminVerifyOTP();
  const { verifyOTP: verifyExistingOTP, loading: existingOtpLoading, error: existingOtpVerifyError, resetState: resetExistingOtpState } = useAdminVerifyExistingOTP();
  
  // Use appropriate verification hook properties based on whether user is coming from login
  const otpLoading = isFromLogin ? existingOtpLoading : newOtpLoading;
  const otpVerifyError = isFromLogin ? existingOtpVerifyError : newOtpVerifyError;
  const resetOtpState = isFromLogin ? resetExistingOtpState : resetNewOtpState;
  
  // Hooks for resending OTP - different for new signups vs existing users from login
  const { 
    resendOTP: resendNewOTP, 
    loading: resendNewLoading, 
    error: resendNewError, 
    canResend: canResendNew, 
    timeRemaining: timeRemainingNew, 
    resetState: resetResendNewState 
  } = useAdminResendOTP();
  
  const { 
    resendOTP: resendExistingOTP, 
    loading: resendExistingLoading, 
    error: resendExistingError, 
    canResend: canResendExisting, 
    timeRemaining: timeRemainingExisting, 
    resetState: resetResendExistingState 
  } = useAdminResendExistingOTP();
  
  // Use appropriate resend hook properties based on whether user is coming from login
  const resendLoading = isFromLogin ? resendExistingLoading : resendNewLoading;
  const resendError = isFromLogin ? resendExistingError : resendNewError;
  const canResend = isFromLogin ? canResendExisting : canResendNew;
  const timeRemaining = isFromLogin ? timeRemainingExisting : timeRemainingNew;
  const resetResendState = isFromLogin ? resetResendExistingState : resetResendNewState;
  
  const { 
    getRegistrationState, 
    saveRegistrationState,
    loading: stateLoading, 
    resetState: resetStateState 
  } = useAdminRegistrationState();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  // Load saved state from database on component mount
  useEffect(() => {
    const checkForExistingRegistration = async () => {
      // Check if redirected from login due to unverified email
      if (locationState?.fromLogin && locationState?.email) {
        setCurrentStep("verify-otp");
        setUserEmail(locationState.email);
        setIsFromLogin(true); // Mark that user is coming from login
        
        // For users coming from login, we don't need a registration state
        // They already have an admin account, just need email verification
        setFormData(prev => ({
          ...prev,
          email: locationState.email || "",
          fullName: locationState.fullName || ""
          // No adminKey needed for existing users
        }));
        
        // notification.warning({
        //   message: location.state.message || "Email verification required",
        //   description: "Please verify your email to complete the login process. Click 'Resend OTP' to get a new verification code.",
        //   duration: 6,
        //   key: "email-verification-required",
        // });
        
        setIsRestoringState(false);
        return;
      }
      
      // Check if there's a URL parameter for email (cross-device continuation)
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get('email');
      
      let emailToCheck = emailParam;
      
      // If no email in URL, try to use any email they might start typing
      if (!emailToCheck && formData.email) {
        emailToCheck = formData.email;
      }
      
      if (emailToCheck) {
        const result = await getRegistrationState(emailToCheck);
        
        if (result.success && result.data) {
          setCurrentStep(result.data.currentStep);
          setUserEmail(result.data.formData.email);
          setFormData(result.data.formData);
          
          // Show helpful message that state was restored
          const deviceInfo = result.data.deviceInfo;
          const lastDevice = deviceInfo?.lastDeviceType || 'another device';
          const lastUpdated = new Date(result.data.lastUpdated).toLocaleString();
          
          notification.info({
            message: "Registration Progress Found",
            description: `Continuing your admin registration from ${lastDevice} (last updated: ${lastUpdated})`,
            duration: 5,
            key: "registration-restored",
          });
        }
      }
      
      setIsRestoringState(false);
    };

    // Reset hook states
    resetSignupState();
    resetNewOtpState();
    resetExistingOtpState();
    resetResendNewState();
    resetResendExistingState();
    resetStateState();
    
    checkForExistingRegistration();
  }, []);

  // Helper function to save state to database for cross-device access
  const saveStateToDatabase = async (step: CurrentStep, email: string, data: typeof formData, adminId?: string): Promise<void> => {
    await saveRegistrationState({
      email,
      currentStep: step,
      formData: data,
      adminId,
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

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

  const handleInputChange = (field: keyof typeof formData, value: string): void => {
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

  const handleSubmit = async (): Promise<void> => {
    if (currentStep === "signup") {
      if (!validateForm()) {
        return;
      }

      const result = await signup(formData);

      if (result.success && result.data) {
        notification.success({
          message: `${result.data.message || "Signup successful! Please verify your email."}`,
          key: "signup-success",
        })
        setUserEmail(formData.email);
        setCurrentStep("verify-otp");
        
        // Save state to database for cross-device access
        await saveStateToDatabase("verify-otp", formData.email, formData, result.data.admin?.id);
      }
    } else if (currentStep === "verify-otp") {
      if (!validateOtp()) {
        return;
      }

      let result: AdminAuthResult;
      if (isFromLogin) {
        // For existing users from login, only send verification code and email
        result = await verifyExistingOTP({
          verificationCode: otp,
          email: userEmail,
        });
      } else {
        // For new signups, send verification code, email, and admin key
        result = await verifyNewOTP({
          verificationCode: otp,
          email: userEmail,
          adminKey: formData.adminKey,
        });
      }

      if (result.success) {
        if (isFromLogin) {
          // For existing users, they are now verified and logged in
          // Store the token and redirect to admin dashboard
          if (result.data?.token) {
            // Store authentication token
            localStorage.setItem('adminToken', result.data.token);
            
            // Navigate to admin dashboard
            navigate("/admin/dashboard", {
              state: {
                message: "Email verified successfully! Welcome back.",
              }
            });
          }
        } else {
          // For new signups, registration completed successfully - redirect to login
          // Navigate to admin login with success message
          navigate("/auth/admin-login", {
            state: {
              message: "Admin account created and verified successfully! You can now log in.",
              email: userEmail
            }
          });
        }
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

  const handleOtpChange = (value: string): void => {
    // Allow only numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    setOtp(numericValue);

    // Clear error when user starts typing
    if (otpError) {
      setOtpError("");
    }
  };

  const handleResendOTP = async (): Promise<void> => {
    if (!canResend) {
      return;
    }

    let result;
    if (isFromLogin) {
      // For existing users from login, only send email
      result = await resendExistingOTP({
        email: userEmail,
      });
    } else {
      // For new signups, send email and admin key
      result = await resendNewOTP({
        email: userEmail,
        adminKey: formData.adminKey,
      });
    }

    if (result.success) {
      notification.success({
        message: "New verification code sent!",
        description: "Please check your email for the new verification code.",
        key: "otp-resent",
      });
    } else {
      notification.error({
        message: "Failed to resend code",
        description: result.error || "Please try again later.",
        key: "otp-resend-error",
      });
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
        
        {/* Loading state while checking for existing registration */}
        {isRestoringState ? (
          <Card className="shadow-2xl border-0 font-[gilroy-regular]">
            <div className="text-center py-8">
              <Spin size="large" />
              <p className="mt-4 text-gray-600">Checking for existing registration...</p>
            </div>
          </Card>
        ) : (
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
                  <Link to="/auth/admin-login" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign in here
                  </Link> 
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-600 text-sm mb-2">
                    Started registration on another device?
                  </p>
                  <button
                    onClick={async () => {
                      const email = formData.email || prompt("Enter your email to check for existing registration:");
                      if (email) {
                        setIsRestoringState(true);
                        const result = await getRegistrationState(email);
                        if (result.success && result.data) {
                          setCurrentStep(result.data.currentStep);
                          setUserEmail(result.data.formData.email);
                          setFormData(result.data.formData);
                          notification.success({
                            message: "Registration Found!",
                            description: "Continuing your registration from another device.",
                            key: "registration-found",
                          });
                        } else {
                          notification.info({
                            message: "No Registration Found",
                            description: "No pending registration found for this email.",
                            key: "no-registration-found",
                          });
                        }
                        setIsRestoringState(false);
                      }
                    }}
                    disabled={stateLoading}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-gray-400"
                  >
                    {stateLoading ? (
                      <>
                        <Spin size="small" className="mr-1" />
                        Checking...
                      </>
                    ) : (
                      "Continue from another device"
                    )}
                  </button>
                </div>
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

              {resendError && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-4"
                >
                  <Alert
                    message="Resend Error"
                    description={resendError}
                    type="error"
                    showIcon
                    closable
                    onClose={resetResendState}
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
                    className="bg-blue-600 hover:bg-blue-700 hover:text-white border-blue-600 hover:border-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 transition-colors duration-500"
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
                    onClick={handleResendOTP}
                    disabled={otpLoading || resendLoading || !canResend}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-gray-400 transition-colors"
                  >
                    {resendLoading ? (
                      <>
                        <Spin size="small" className="mr-1" />
                        Sending...
                      </>
                    ) : !canResend ? (
                      `Resend in ${timeRemaining}s`
                    ) : (
                      "Resend verification code"
                    )}
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
                    onClick={() => {
                      setCurrentStep("signup");
                      // Note: We keep the saved state in case user wants to continue later
                      // They can clear it by completing signup again or it will expire automatically
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Back to signup
                  </button>
                </p>
              </motion.div>
            </>
          )}
        </Card>
        )}
      </motion.div>
    </div>
  );
};

export default AdminSignup;
