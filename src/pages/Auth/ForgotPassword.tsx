

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowRight, AlertCircle, Loader2, CheckCircle, ArrowLeft, Send } from "lucide-react";
import { useDTUserForgotPassword } from "../../hooks/Auth/useDTUserForgotPassword";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { requestPasswordReset, loading, error, emailSent, resetState } = useDTUserForgotPassword();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const result = await requestPasswordReset(email);
    
    if (!result.success && result.error) {
      console.error("Failed to send reset email:", result.error);
    }
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: "" }));
    }
    if (error) {
      resetState();
    }
  };

  const handleSendAnother = () => {
    resetState();
    setEmail("");
    setErrors({});
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center font-[gilroy-regular] justify-center p-6">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
            <div className="text-center">
              <motion.div 
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Send className="h-10 w-10 text-green-600" />
              </motion.div>
              
              <h2 className="text-2xl font-gilroy-bold text-gray-900 mb-3">Check Your Email</h2>
              
              <p className="text-gray-600 font-gilroy-medium mb-2">
                We've sent a password reset link to:
              </p>
              
              <p className="text-[#F6921E] font-gilroy-semibold text-lg mb-6">
                {email}
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700 font-gilroy-medium">
                  🛡️ <strong>Security Notice:</strong> The reset link will expire in 1 hour for your security.
                </p>
                <p className="text-sm text-blue-600 font-gilroy-regular mt-1">
                  📧 Don't see the email? Check your spam or junk folder.
                </p>
              </div>
              
              <div className="space-y-3">
                <motion.button
                  onClick={handleSendAnother}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-gilroy-semibold py-3 px-4 rounded-lg transition-all duration-200 border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Another Email
                </motion.button>
                
                <Link to="/login">
                  <motion.button 
                    className="w-full text-gray-500 hover:text-gray-700 font-gilroy-medium py-3 px-4 transition-colors flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Login</span>
                  </motion.button>
                </Link>
              </div>
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
              <Mail className="h-10 w-10 text-[#F6921E]" />
            </motion.div>
            
            <h1 className="text-3xl font-gilroy-bold text-gray-900 mb-2">
              Forgot Password?
            </h1>
            
            <p className="text-gray-600 font-gilroy-medium">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-gilroy-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={`
                    block w-full pl-10 pr-3 py-3 rounded-lg border font-gilroy-medium
                    bg-gray-50 focus:bg-white transition-all duration-200
                    ${errors.email || error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#F6921E]'}
                    focus:ring-2 focus:ring-[#F6921E]/20 focus:outline-none
                  `}
                  placeholder="Enter your email address"
                  disabled={loading}
                />
              </div>
              
              {errors.email && (
                <motion.div 
                  className="flex items-center space-x-1 mt-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600 font-gilroy-medium">{errors.email}</span>
                </motion.div>
              )}
            </div>

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
              disabled={loading || !email}
              className={`
                w-full py-3 px-4 rounded-lg font-gilroy-semibold text-white
                bg-[#F6921E] hover:bg-[#E8831B] focus:bg-[#E8831B]
                focus:outline-none focus:ring-2 focus:ring-[#F6921E]/50
                disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-all duration-200 flex items-center justify-center space-x-2
              `}
              whileHover={!loading && email ? { scale: 1.02 } : {}}
              whileTap={!loading && email ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>

            {/* Back to Login */}
            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center space-x-1 text-gray-500 hover:text-[#F6921E] font-gilroy-medium text-sm transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <div className="border-t border-gray-200 pt-6">
              <div className="text-xs text-gray-500 font-gilroy-medium space-y-1">
                <p>🛡️ Security: Reset links expire in 1 hour</p>
                <p>📧 Check spam folder if email doesn't arrive</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;