import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { notification } from "antd";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import authMutationService from "../../services/authentication/auth-mutation";
import errorMessage from "../../lib/error-message";
import LoginLeftHeroSection from "./_components/LoginLeftHeroSection";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const from = location.state?.from?.pathname;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const { signinMutation, isSigninError, isSigninLoading, signinError } = authMutationService.useUserSignin();
  const error = isSigninError ? errorMessage(signinError) : "";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    signinMutation.mutate(formData, {
      onSuccess: (data) => {

        const userData = data?.user;

        if(!userData) {
          notification.open({
            type: "error",
            message: "Invalid credentials.",
          });
          return navigate("/login", { replace: true });
        }

        if (!userData.isEmailVerified) {
          notification.open({
            type: "warning",
            message: "Please verify your email before logging in. Check your inbox for verification link.",
          });

          notification.error({
            message: "Please verify your email before logging in. Check your inbox for verification link.",
          });
  
          return navigate("/login", { state: { email: formData.email }, replace: true });
      }

      if (!userData.hasSetPassword) {
        notification.open({
          type: "warning",
          message: "Please complete your account setup by setting a password.",
        });
        return navigate("/login", { state: { email: formData.email }, replace: true });
      }
  
      if(userData?.role !== "user") {
          notification.open({
              type: "error",
              message: "Invalid credentials.",
              key: "invalid_credentials",
          });
        return navigate("/login", { replace: true });
      }

        notification.open({ type: "success", message: "Login successful!" });

        if (userData.annotatorStatus || userData.microTaskerStatus) {
          navigate(from ?? "/dashboard/overview");
        } else {
          navigate(from ?? "/admin/overview");
        }

      },
      onError: (err) => {
      const errorMsg = errorMessage(err);
      console.error("Login failed:", errorMsg);
      notification.error({  message: errorMsg });
    },
    });

  };

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className={`${isHomePage ? 'h-auto' : 'min-h-screen'} bg-gradient-to-br from-primary via-primary font-[gilroy-regular] to-background-accent flex items-center justify-center p-4`}>
      <div className={`grid ${isHomePage ? 'grid-cols-1' : 'md:grid-cols-2'} max-w-6xl w-full shadow-2xl overflow-hidden rounded-2xl bg-white`}>
        {/* Left Section - Hero - Hidden on home page */}
        {!isHomePage && <LoginLeftHeroSection />}

        {/* Right Section - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-10 flex flex-col justify-center bg-white"
        >
          <div className="max-w-md mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">Enter your credentials to access your account</p>
            </motion.div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full rounded-lg border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-secondary'
                    } px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
                  placeholder="Enter your email address"
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline w-4 h-4 mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`w-full rounded-lg border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-secondary'
                      } px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-secondary hover:text-secondary-hover hover:underline transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: isSigninLoading ? 1 : 1.02 }}
                whileTap={{ scale: isSigninLoading ? 1 : 0.98 }}
                type="submit"
                disabled={isSigninLoading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 px-4 rounded-lg font-medium hover:from-primary-hover hover:to-secondary-hover focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isSigninLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                )}
              </motion.button>
            </motion.form>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-600">
                New to MyDeepTech?{" "}
                <Link to="/signup" className="font-semibold text-secondary hover:text-secondary-hover hover:underline transition-colors">
                  Create an account
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
