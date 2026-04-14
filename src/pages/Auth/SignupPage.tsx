import { useState } from "react";
import { motion } from "framer-motion";
import MultiStageSignUpForm from "../../components/MultiStageSignUpForm";
import ShowSuccess from "./_components/ShowSuccess";
import SignupLeftHeroSection from "./_components/SignupLeftHeroSection";

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  domains: { id: string; name: string }[];
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
        <ShowSuccess email={submittedData?.email ?? ""} resetForm={resetForm} />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-[gilroy-regular] bg-gradient-to-br from-primary via-background-accent to-primary flex">
      <div className="grid md:grid-cols-2 w-full shadow-sm overflow-hidden">
        {/* Left Section - Hero */}
        <SignupLeftHeroSection />
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
