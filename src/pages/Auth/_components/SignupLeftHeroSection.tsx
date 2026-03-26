import { motion } from "framer-motion";
import { ArrowLeft, Globe, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import mydeepTechLogo from "./../../../assets/deeptech.png";

const SignupLeftHeroSection = () => {
  return (
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
  )
}

export default SignupLeftHeroSection