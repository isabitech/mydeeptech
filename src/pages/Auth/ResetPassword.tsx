import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, CheckCircle, Key } from "lucide-react";
import { useDTUserResetPassword } from "../../hooks/Auth/useDTUserResetPassword";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token');
  
  const { 
    verifyToken, 
    resetPassword, 
    loading, 
    error, 
    isValidatingToken, 
    isTokenValid, 
    passwordReset,
    resetState 
  } = useDTUserResetPassword();

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  useEffect(() => {
    if (passwordReset) {
      // Redirect to login after 3 seconds
      const timeout = setTimeout(() => {
        navigate('/login');
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [passwordReset, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) return;
    
    const result = await resetPassword(token, formData.password, formData.confirmPassword);
    
    if (!result.success && result.error) {
      console.error("Failed to reset password:", result.error);
    }
  };

  const handleInputChange = (field: "password" | "confirmPassword", value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    if (error) {
      resetState();
    }
  };

  // Token validation loading state
  if (isValidatingToken) {
    return (
      <div className="min-h-screen font-[gilroy-regular] bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-xl font-gilroy-semibold text-gray-800 mb-2">Validating Reset Link</h2>
              <p className="text-gray-600 font-gilroy-medium">Please wait while we verify your reset token...</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Invalid token state
  if (!isTokenValid) {
    return (
      <div className="min-h-screen font-[gilroy-regular] bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
            <div className="text-center">
              <motion.div 
                className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <AlertCircle className="h-10 w-10 text-red-600" />
              </motion.div>
              
              <h2 className="text-2xl font-gilroy-bold text-gray-900 mb-3">Invalid Reset Link</h2>
              
              <p className="text-gray-600 font-gilroy-medium mb-6">
                This password reset link is invalid or has expired. Reset links are only valid for 1 hour for security reasons.
              </p>
              
              <div className="space-y-3">
                <Link to="/forgot-password">
                  <motion.button
                    className="w-full bg-[#F6921E] hover:bg-[#E8831B] text-white font-gilroy-semibold py-3 px-4 rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Request New Reset Link
                  </motion.button>
                </Link>
                
                <Link to="/login">
                  <motion.button
                    className="w-full text-gray-500 hover:text-gray-700 font-gilroy-medium py-3 px-4 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back to Login
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (passwordReset) {
    return (
      <div className="min-h-screen font-[gilroy-regular] bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
            <div className="text-center">
              <motion.div 
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="h-10 w-10 text-green-600" />
              </motion.div>
              
              <h2 className="text-2xl font-gilroy-bold text-gray-900 mb-3">Password Reset Successful!</h2>
              
              <p className="text-gray-600 font-gilroy-medium mb-6">
                Your password has been updated successfully. You can now log in with your new password.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700 font-gilroy-medium">
                  🔄 Redirecting to login page in 3 seconds...
                </p>
              </div>
              
              <Link to="/login">
                <motion.button
                  className="w-full bg-[#F6921E] hover:bg-[#E8831B] text-white font-gilroy-semibold py-3 px-4 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Go to Login Now
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-[gilroy-regular] bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="w-20 h-20 bg-[#F6921E]/10 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Key className="h-10 w-10 text-[#F6921E]" />
            </motion.div>
            
            <h1 className="text-3xl font-gilroy-bold text-gray-900 mb-2">
              Reset Your Password
            </h1>
            
            <p className="text-gray-600 font-gilroy-medium">
              Enter your new password below to complete the reset process.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Input */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-gilroy-semibold text-gray-700 mb-2"
              >
                New Password
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`
                    block w-full pl-10 pr-12 py-3 rounded-lg border font-gilroy-medium
                    bg-gray-50 focus:bg-white transition-all duration-200
                    ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#F6921E]'}
                    focus:ring-2 focus:ring-[#F6921E]/20 focus:outline-none
                  `}
                  placeholder="Enter new password (min 8 characters)"
                  disabled={loading}
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {errors.password && (
                <motion.div 
                  className="flex items-center space-x-1 mt-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600 font-gilroy-medium">{errors.password}</span>
                </motion.div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-gilroy-semibold text-gray-700 mb-2"
              >
                Confirm New Password
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`
                    block w-full pl-10 pr-12 py-3 rounded-lg border font-gilroy-medium
                    bg-gray-50 focus:bg-white transition-all duration-200
                    ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#F6921E]'}
                    focus:ring-2 focus:ring-[#F6921E]/20 focus:outline-none
                  `}
                  placeholder="Confirm your new password"
                  disabled={loading}
                />
                
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {errors.confirmPassword && (
                <motion.div 
                  className="flex items-center space-x-1 mt-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600 font-gilroy-medium">{errors.confirmPassword}</span>
                </motion.div>
              )}
            </div>

            {/* Password Strength Indicators */}
            {formData.password && (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-xs font-gilroy-medium text-gray-600">Password Requirements:</div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      formData.password.length >= 8 ? 'bg-green-400' : 'bg-gray-300'
                    }`}></div>
                    <span className={`text-xs font-gilroy-regular ${
                      formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      formData.password === formData.confirmPassword && formData.confirmPassword 
                        ? 'bg-green-400' : 'bg-gray-300'
                    }`}></div>
                    <span className={`text-xs font-gilroy-regular ${
                      formData.password === formData.confirmPassword && formData.confirmPassword 
                        ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      Passwords match
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div 
                className="bg-red-50 border border-red-200 rounded-lg p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-red-700 font-gilroy-medium text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !formData.password || !formData.confirmPassword}
              className={`
                w-full py-3 px-4 rounded-lg font-gilroy-semibold text-white
                bg-[#F6921E] hover:bg-[#E8831B] focus:bg-[#E8831B]
                focus:outline-none focus:ring-2 focus:ring-[#F6921E]/50
                disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-all duration-200 flex items-center justify-center space-x-2
              `}
              whileHover={!loading && formData.password && formData.confirmPassword ? { scale: 1.02 } : {}}
              whileTap={!loading && formData.password && formData.confirmPassword ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Resetting Password...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <div className="border-t border-gray-200 pt-6">
              <div className="text-xs text-gray-500 font-gilroy-medium">
                🛡️ Your new password will be encrypted and stored securely
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;