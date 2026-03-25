
import { motion } from "framer-motion";
import mydeepTechLogo from "./../../../assets/deeptech.png";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

type ShowSuccessProps = {
  email: string;
  resetForm: () => void;
};

const ShowSuccess = ({ email, resetForm}: ShowSuccessProps) => {
  return (
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
              {email ?? ""}
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
  )
}

export default ShowSuccess