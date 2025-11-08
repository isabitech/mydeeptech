import LandingPageHero from "../../components/LandingPageHero";
import MultiStageSignUpForm from "../../components/MultiStageSignUpForm";

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  domains: string[];
  socialsFollowed: string[];
  consent: "yes" | "no" | "";
};

export default function AdsLandingPage() {
  const handleSignUpSuccess = (formData: FormState) => {
    // Handle successful signup if needed
    console.log("Sign up successful:", formData);
  };

  return (
    <div className="min-h-screen flex font-[gilroy-regular]">
      <div className="grid md:grid-cols-2 w-full shadow-sm overflow-hidden">
        {/* Left Section */}
        <LandingPageHero />

        {/* Right Section */}
        <MultiStageSignUpForm onSuccess={handleSignUpSuccess} />
      </div>
    </div>
  );
}
