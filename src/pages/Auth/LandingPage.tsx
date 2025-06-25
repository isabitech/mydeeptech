import { Button, ConfigProvider } from "antd";
import Logo from "../../assets/deeptech.png";
import freelancer from "../../assets/freelancer.jpg";
import { useState } from "react";
import PageModal from "../../components/Modal/PageModal";
import SignupContent from "./Signup";
import LoginContent from "./Login";

const LandingPage = () => {
  const [isLoginModal, setIsLoginModal] = useState(false);
  const [isSignUpModal, setIsSignUpModal] = useState(false);

  const handleOpenLogin = () => setIsLoginModal(!isLoginModal);
  const handleSignUpModal = () => setIsSignUpModal(!isSignUpModal);

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            colorBgMask: "rgba(0, 0, 0, 0.6)",
            contentBg: "#333333",
            borderRadiusOuter: 12,
          },
        },
      }}
    >
      <div className="font-[gilroy-regular] bg-white text-[#333333]">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#333333] to-[#F6921E] text-white pb-20">
          <nav className="flex justify-between items-center px-6 py-4">
            <div className="h-[50px]">
              <img className="h-full rounded-md" src={Logo} alt="Logo" />
            </div>
            <ul className="flex gap-6 font-medium">
              <li className="cursor-pointer hover:underline">Home</li>
              <li className="cursor-pointer hover:underline"><a href="/about-us">About</a></li>
              {/* <li className="cursor-pointer hover:underline">Contact</li> */}
            </ul>
            <div className="flex gap-3">
              {/* <Button className="!bg-[#333333] !text-white !rounded-xl" onClick={handleOpenLogin}>Login</Button>
              <Button className="!bg-[#F6921E] !text-white !rounded-xl" onClick={handleSignUpModal}>Sign Up</Button> */}
            </div>
          </nav>

          {/* Hero Section */}
          <div className="flex px-8 py-10 gap-10 justify-center items-center">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold">
                Empowering Freelancers in Data Annotation and AI Development
              </h1>
              <p className="text-lg max-w-xl">
                Find gigs, showcase your skills, and grow your income in global AI projects. Work remotely and get paid fairly.
              </p>
              {/* <Button className="!bg-[#F6921E] !text-white !w-[10rem] !h-10 !rounded-xl !font-[gilroy-regular] !border-none !shadow-md" onClick={handleSignUpModal}>
                Get Started
              </Button> */}
              <a href="/new-projects">
                <Button className="!bg-[#F6921E] !text-white !w-[10rem] !h-10 !rounded-xl !font-[gilroy-regular] !border-none !shadow-md max-sm:mt-4">
                Get Started
              </Button>
              </a>
            </div>
            <div className="hidden md:block">
              <img src={freelancer} className="w-[28rem] h-[28rem] object-cover rounded-full border-4 border-white" alt="Freelancer" />
            </div>
          </div>
        </div>

        {/* Features */}
        <section className="py-16 px-6 max-w-6xl mx-auto text-center space-y-10">
          <h2 className="text-3xl font-bold text-[#333333]">What Makes Us Different</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Verified Remote Gigs", desc: "We only offer real data tasks from trusted platforms." },
              { title: "Fair Payment", desc: "You get paid in Dollars withdraw to your Naira account " },
              { title: "Skill-Based Matching", desc: "Apply to projects that match your annotation strength." },
            ].map((item, index) => (
              <div key={index} className="bg-[#F9F9F9] p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-2 text-[#F6921E]">{item.title}</h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-[#FAFAFA] py-16 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <h2 className="text-3xl font-bold text-[#333333]">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6 text-left">
              {[
                "Apply to Projects",
                "Get Approved by Admin",
                "Submit Tasks",
                "Get Paid in Dollars",
              ].map((step, index) => (
                <div key={index} className="p-4 bg-white shadow rounded-md border-l-4 border-[#F6921E]">
                  <h4 className="text-lg font-semibold mb-2">Step {index + 1}</h4>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-6 text-center bg-white max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">What Freelancers Are Saying</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: "Blessing, Lagos",
                comment: "I finally found legit gigs I can trust. MyDeepTech pays on time and communicates clearly.",
              },
              {
                name: "Uche, Abuja",
                comment: "The interface is simple. I earn from home doing text and image labeling.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-[#F9F9F9] p-6 rounded-xl">
                <p className="text-gray-700 italic">“{item.comment}”</p>
                <p className="mt-4 font-semibold text-[#F6921E]">{item.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-[#333333] py-16 text-center text-white px-6">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="mb-6 text-lg">Join hundreds of other Nigerians making money from global data jobs.</p>
          {/* <Button
            className="!bg-[#F6921E] !text-white !rounded-xl !px-6 !py-2"
            onClick={handleSignUpModal}
          >
            Join Now
          </Button> */}
          <a href="/new-projects">
          <Button
            className="!bg-[#F6921E] !text-white !rounded-xl !px-6 !py-2 !font-[gilroy-regular] !border-none !shadow-md"
            // onClick={handleSignUpModal}
          >
            Join Now
          </Button></a>
        </section>

        {/* Footer */}
        <footer className="bg-[#1F1F1F] text-white px-6 py-8 mt-10">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="font-bold mb-2 text-[#F6921E]">MyDeepTech</h4>
              <p>Your trusted partner for remote AI and annotation work.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Navigation</h4>
              <ul className="space-y-1">
                <li>Home</li>
                <li><a href="/about-us">About</a></li>
                {/* <li>Contact</li> */}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">Contact</h4>
              <p><a href="mailto:support@mydeeptech.site">Email: support@mydeeptech.site</a></p>
              {/* <p><a href="tel:+2347026093593">Phone: +234 702 609 3593</a></p> */}
              <p>Location : Remote, Worldwide</p>
            </div>
          </div>
          <p className="text-center text-gray-400 text-xs mt-6">© {new Date().getFullYear()} MyDeepTech. All rights reserved.</p>
        </footer>

        {/* Modals */}
        <PageModal
          openModal={isLoginModal}
          onCancel={handleOpenLogin}
          closable={true}
          className="custom-modal"
          modalwidth="400px"
        >
          <LoginContent />
        </PageModal>

        <PageModal
          openModal={isSignUpModal}
          onCancel={handleSignUpModal}
          closable={true}
          className="custom-modal"
          modalwidth="400px"
        >
          <SignupContent />
        </PageModal>
      </div>
    </ConfigProvider>
  );
};

export default LandingPage;
