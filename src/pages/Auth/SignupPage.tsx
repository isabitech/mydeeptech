import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, CheckCircle, Users, Globe } from "lucide-react";
import MultiStageSignUpForm from "../../components/MultiStageSignUpForm";
import mydeepTechLogo from "../../assets/deeptech.png";

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  domains: string[];
  socialsFollowed: string[];
  consent: "yes" | "no" | "";
}

const SignupPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const handleSignUpSuccess = (formData: FormData) => {
    setSubmittedData(formData);
    setShowSuccess(true);
  };

  const resetForm = () => {
    setShowSuccess(false);
    setSubmittedData(null);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-background-accent to-primary flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center"
        >
          <div className=" w-full flex justify-center items-center">
            <img
              src={mydeepTechLogo}
              alt="Logo"
              className="h-auto w-[65px] mb-6 rounded-md"
            />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-success" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 mb-3"
          >
            Welcome to MyDeepTech! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-6"
          >
            Thank you for joining our AI training community. We've sent a
            verification email to{" "}
            <span className="font-semibold text-secondary">
              {submittedData?.email}
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-secondary/10 rounded-lg p-4 mb-6"
          >
            <h3 className="font-semibold text-secondary mb-2">Next Steps:</h3>
            <div className="text-left space-y-2 text-primary">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                <span className="text-sm">
                  Check your email for verification link
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                <span className="text-sm">Verify your email address</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                <span className="text-sm">Set up your password</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                <span className="text-sm">Start earning up to $30/hr!</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetForm}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg shadow hover:from-primary-hover hover:to-secondary-hover transition-all duration-200"
            >
              Sign Up Another User
            </motion.button>

            <Link
              to="/login"
              className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              Already have an account? Sign In
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-[gilroy-regular] bg-gradient-to-br from-primary via-background-accent to-primary flex">
      <div className="grid md:grid-cols-2 w-full shadow-sm overflow-hidden">
        {/* Left Section - Hero */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="p-10 flex flex-col justify-center bg-gradient-to-br from-secondary via-secondary-hover to-primary text-white relative overflow-hidden"
        >
          <div className=" w-full flex justify-start items-center">
            <img
              src={mydeepTechLogo}
              alt="Logo"
              className="h-16 w-auto mb-6 rounded-md"
            />
          </div>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-48 -translate-y-48"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white rounded-full -translate-y-32"></div>
          </div>

          <div className="relative z-10">
            {/* Back to Home */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-8"
            >
              <Link
                to="/"
                className="inline-flex items-center text-orange-100 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center mb-6"
            >
              <Sparkles className="w-8 h-8 mr-3" />
              <h1 className="text-4xl font-bold">Join MyDeepTech</h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl mb-8 text-orange-100"
            >
              Shape the future of AI and get paid for it
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-orange-300 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">Competitive Earnings</h3>
                  <p className="text-orange-100 text-sm">
                    Earn up to $30/hr training AI models
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-orange-300 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">Remote Flexibility</h3>
                  <p className="text-orange-100 text-sm">
                    Work from anywhere, anytime
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-orange-300 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">All Domains Welcome</h3>
                  <p className="text-orange-100 text-sm">
                    No matter your expertise, we need you
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-orange-300 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-1">Growing Community</h3>
                  <p className="text-orange-100 text-sm">
                    Join hundreds of AI trainers worldwide
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-10 flex items-center space-x-6"
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="text-orange-100">500+ Active Trainers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span className="text-orange-100">30+ Countries</span>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 text-orange-100"
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-white hover:underline"
              >
                Sign in here
              </Link>
            </motion.p>
          </div>
        </motion.div>

        {/* Right Section - Multi-Stage Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-primary"
        >
          <MultiStageSignUpForm onSuccess={handleSignUpSuccess} />
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
