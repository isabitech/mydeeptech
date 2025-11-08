import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, User, Mail, Phone, Briefcase, Users, Check } from "lucide-react";
import { useSignUpApi } from "../../hooks/Auth/useSignUp";

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  domains: string[];
  socialsFollowed: string[];
  consent: "yes" | "no" | "";
};

const DOMAIN_OPTIONS = [
  "Arts and Entertainment",
  "Computing",
  "Consumer Electronics",
  "Coding",
  "Code Execution",
  "Code Interpreter",
  "Economy",
  "Education",
  "Employment",
  "Entertainment",
  "Environment",
  "Food and Drink",
  "Health",
  "History",
  "Home & Garden",
  "Information Technology",
  "Law / Legal",
  "Science",
  "Sports",
  "Technology",
  "Travel",
  "Other",
  "Adversarial Prompting",
  "Aspirational Capability",
  "STEM",
  "Finance",
  "Math",
  "Retrieval Augmented Generation (RAG)",
  "News",
  "Coding - Tool Use",
];

const SOCIAL_LINKS = [
  { label: "LinkedIn", url: "https://www.linkedin.com/company/mydeeptech" },
  { label: "X / Twitter", url: "https://x.com/mydeeptech" },
  { label: "Threads", url: "https://www.threads.com/@mydeeptech" },
  { label: "Instagram", url: "https://www.instagram.com/mydeeptech/" },
];

interface MultiStageSignUpFormProps {
  onSuccess?: (formData: FormState) => void;
  className?: string;
}

export default function MultiStageSignUpForm({ onSuccess, className = "" }: MultiStageSignUpFormProps) {
  const [currentStage, setCurrentStage] = useState(1);
  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    email: "",
    domains: [],
    socialsFollowed: [],
    consent: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  
  const { signUp, loading, error } = useSignUpApi();

  const stages = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "Domain Selection", icon: Briefcase },
    { id: 3, title: "Social & Consent", icon: Users },
  ];

  const toggleDomain = (domain: string) => {
    setForm((s) => {
      const exists = s.domains.includes(domain);
      return { ...s, domains: exists ? s.domains.filter((d) => d !== domain) : [...s.domains, domain] };
    });
  };

  const toggleSocial = (label: string) => {
    setForm((s) => {
      const exists = s.socialsFollowed.includes(label);
      return { ...s, socialsFollowed: exists ? s.socialsFollowed.filter((d) => d !== label) : [...s.socialsFollowed, label] };
    });
  };

  const validateStage = (stage: number) => {
    const e: Record<string, string> = {};
    
    if (stage === 1) {
      if (!form.fullName.trim()) e.fullName = "Full name is required";
      if (!form.phone.trim()) e.phone = "Phone number is required";
      else if (!/^[+0-9()\-\s]{6,20}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
      if (!form.email.trim()) e.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    } else if (stage === 2) {
      if (form.domains.length === 0) e.domains = "Select at least one domain";
    } else if (stage === 3) {
      if (!form.consent) e.consent = "Please choose yes or no";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStage(currentStage)) {
      setCurrentStage(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStage(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStage(3)) return;
    
    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        domains: form.domains,
        socialsFollowed: form.socialsFollowed,
        consent: form.consent
      };

      const result = await signUp(payload);
      
      if (result.error) {
        setErrors({ submit: result.error });
        return;
      }
      
      setSubmitted(true);
      onSuccess?.(form);
      
    } catch (err: any) {
      setErrors({ submit: err.message });
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCurrentStage(1);
    setForm({ fullName: "", phone: "", email: "", domains: [], socialsFollowed: [], consent: "" });
    setErrors({});
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Full Name
              </label>
              <input
                value={form.fullName}
                onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 text-white p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="John Doe"
              />
              {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Phone className="inline w-4 h-4 mr-2" />
                Phone Number
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 text-white p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 text-white p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                <Briefcase className="inline w-4 h-4 mr-2" />
                Select Your Domain(s)
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-[30rem] md:max-h-[18rem] px-2 overflow-y-auto pr-2 custom-scrollbar">
                {DOMAIN_OPTIONS.map((domain) => (
                  <motion.label
                    key={domain}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      form.domains.includes(domain)
                        ? 'border-secondary bg-secondary/20 text-white'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.domains.includes(domain)}
                      onChange={() => toggleDomain(domain)}
                      className="rounded border-gray-600 bg-gray-700 text-secondary focus:ring-secondary focus:ring-offset-0"
                    />
                    <span className="text-sm font-medium">{domain}</span>
                  </motion.label>
                ))}
              </div>
              {errors.domains && <p className="text-xs text-red-400 mt-2">{errors.domains}</p>}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                <Users className="inline w-4 h-4 mr-2" />
                Follow Us (Optional)
              </label>
              <div className="space-y-3">
                {SOCIAL_LINKS.map((social) => (
                  <motion.div
                    key={social.label}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-3 border border-gray-600 bg-gray-700/50 rounded-lg"
                  >
                    <span className="text-white text-sm">{social.label}</span>
                    <motion.a
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => toggleSocial(social.label)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1 bg-secondary text-white rounded text-sm hover:bg-secondary/80 transition-colors"
                    >
                      Follow
                    </motion.a>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Consent for Updates
              </label>
              <div className="space-y-2">
                <motion.label 
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    form.consent === "yes" ? 'border-secondary bg-secondary/20' : 'border-gray-600 bg-gray-700/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="consent"
                    value="yes"
                    checked={form.consent === "yes"}
                    onChange={() => setForm((s) => ({ ...s, consent: "yes" }))}
                    className="text-secondary focus:ring-secondary focus:ring-offset-0"
                  />
                  <span className="text-white text-sm">Yes, keep me updated on opportunities</span>
                </motion.label>
                <motion.label 
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    form.consent === "no" ? 'border-secondary bg-secondary/20' : 'border-gray-600 bg-gray-700/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="consent"
                    value="no"
                    checked={form.consent === "no"}
                    onChange={() => setForm((s) => ({ ...s, consent: "no" }))}
                    className="text-secondary focus:ring-secondary focus:ring-offset-0"
                  />
                  <span className="text-white text-sm">No, don't contact me</span>
                </motion.label>
              </div>
              {errors.consent && <p className="text-xs text-red-400 mt-2">{errors.consent}</p>}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <div className={`p-8 flex flex-col items-center justify-center bg-[#333333] ${className}`}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Welcome to the community! 🎉
          </h3>
          <p className="text-gray-300 mb-6">
           Please check your mail:{" "}
            <span className="font-semibold text-white">{form.email}</span>
           {" "} for further instructions.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetForm}
            className="bg-secondary text-white px-6 py-3 rounded-lg shadow hover:bg-secondary/80 transition-colors"
          >
            Start Over
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`p-8 flex flex-col bg-[#333333] min-h-screen ${className}`}>
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isActive = currentStage === stage.id;
            const isCompleted = currentStage > stage.id;
            
            return (
              <div key={stage.id} className="flex items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isCompleted ? "#10b981" : isActive ? "#f59e0b" : "#374151"
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </motion.div>
                {stage.id < 3 && (
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: currentStage > stage.id ? "#10b981" : "#374151"
                    }}
                    className="w-16 h-1 mx-2 rounded transition-colors duration-300"
                  />
                )}
              </div>
            );
          })}
        </div>
        <motion.h3
          key={currentStage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-xl font-semibold text-white text-center"
        >
          {stages.find(s => s.id === currentStage)?.title}
        </motion.h3>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-4">
        <AnimatePresence mode="wait">
          {renderStageContent()}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between items-center">
        <motion.button
          whileHover={{ scale: currentStage > 1 ? 1.05 : 1 }}
          whileTap={{ scale: currentStage > 1 ? 0.95 : 1 }}
          onClick={handlePrevious}
          disabled={currentStage === 1 || loading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
            currentStage === 1
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </motion.button>

        {currentStage < 3 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-lg shadow hover:bg-secondary/80 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 text-white md:px-8 md:py-3 px-3 py-3 rounded-lg shadow hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Joining...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Join Community
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Error Display */}
      {(errors.submit || error) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-900/50 border border-red-600 rounded-lg"
        >
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}