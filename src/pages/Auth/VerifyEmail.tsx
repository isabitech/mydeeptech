
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useVerifyEmail } from "../../hooks/Auth/useVerifyEmail";

const VerifyEmail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const { verifyEmail, setupPassword, loading, error, isVerified, userData } = useVerifyEmail();
  
  const userEmail = encodeURIComponent(email);

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordSetup, setIsPasswordSetup] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  useEffect(() => {
    if (id && !verificationAttempted) {
      setVerificationAttempted(true);
      verifyEmail(id, userEmail);
    }
  }, [id, verifyEmail, verificationAttempted]);

  const validatePassword = () => {
    const errors: Record<string, string> = {};
    
    if (!passwordData.password) {
      errors.password = "Password is required";
    } else if (passwordData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(passwordData.password)) {
      errors.password = "Password must contain uppercase, lowercase, number and special character";
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordData.password !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword() || !userData?.email || !id) return;

    const result = await setupPassword({
      userId: id,
      email: userData.email,
      password: passwordData.password,
      confirmPassword: passwordData.confirmPassword,
    });

    if (result.success) {
      setIsPasswordSetup(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  };

  const handlePasswordChange = (field: "password" | "confirmPassword", value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Show success page after password setup
  if (isPasswordSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-background-accent to-primary flex items-center justify-center p-4 font-[gilroy-regular]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success" />
          </div>
          
          <h1 className="text-2xl font-bold text-primary mb-3">
            Account Setup Complete! 🎉
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your password has been set successfully. You can now log in to your account.
          </p>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3 }}
            className="h-1 bg-success rounded-full mb-4"
          />
          
          <p className="text-sm text-gray-500">
            Redirecting to login page...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-background-accent to-primary flex items-center justify-center font-[gilroy-regular] p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
            className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Mail className="w-8 h-8 text-secondary" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-primary mb-2">
            Email Verification
          </h1>
          
          <p className="text-gray-600">
            {loading ? "Verifying your email address..." : 
             isVerified ? "Email verified successfully!" : 
             "We're verifying your email address"}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-8"
          >
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-error mr-3" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Success State - Show Password Setup */}
        <AnimatePresence>
          {isVerified && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-success mr-3" />
                  <div>
                    <p className="text-green-800 text-sm font-medium">Email verified successfully!</p>
                    <p className="text-green-700 text-xs mt-1">
                      Welcome, {userData?.email}! Now set up your password.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Password Setup Form */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center mb-4">
                  <Lock className="w-5 h-5 text-gray-600 mr-3" />
                  <h2 className="text-lg font-semibold text-primary">Set Up Your Password</h2>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.password}
                        onChange={(e) => handlePasswordChange("password", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                        placeholder="Enter a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordErrors.password && (
                      <p className="text-error text-xs mt-1">{passwordErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-error text-xs mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-2">Password must contain:</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li className="flex items-center">
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          passwordData.password.length >= 8 ? 'bg-success' : 'bg-gray-300'
                        }`} />
                        At least 8 characters
                      </li>
                      <li className="flex items-center">
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          /(?=.*[a-z])(?=.*[A-Z])/.test(passwordData.password) ? 'bg-success' : 'bg-gray-300'
                        }`} />
                        Uppercase and lowercase letters
                      </li>
                      <li className="flex items-center">
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          /(?=.*\d)/.test(passwordData.password) ? 'bg-success' : 'bg-gray-300'
                        }`} />
                        At least one number
                      </li>
                      <li className="flex items-center">
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          /(?=.*[@$!%*?&])/.test(passwordData.password) ? 'bg-success' : 'bg-gray-300'
                        }`} />
                        Special character (@$!%*?&)
                      </li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-secondary text-white py-3 px-4 rounded-lg font-medium hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Setting up password...
                      </span>
                    ) : (
                      "Complete Setup"
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Retry Button for Failed Verification */}
        {error && !loading && !isVerified && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => id && verifyEmail(id, userEmail)}
            className="w-full bg-secondary text-white py-3 px-4 rounded-lg font-medium hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors"
          >
            Try Again
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;