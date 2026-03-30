import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const LoginLeftHeroSection = () => {
  return (
       <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="p-10 flex flex-col justify-center bg-gradient-to-br from-secondary via-secondary-hover to-primary text-white relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-36 -translate-y-36"></div>
              <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full translate-x-36 translate-y-36"></div>
            </div>

            <div className="relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl font-bold mb-4"
              >
                Welcome Back to MyDeepTech
              </motion.h1>

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

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-xl mb-8 text-orange-100"
              >
                Continue your AI training journey
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                  <span>Access your dashboard</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                  <span>Continue earning up to $30/hr</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                  <span>Track your progress</span>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-8 text-orange-100"
              >
                Don't have an account?{" "}
                <Link to="/signup" className="font-semibold text-white hover:underline">
                  Sign up here
                </Link>
              </motion.p>
            </div>
          </motion.div>
  )
}

export default LoginLeftHeroSection