import { Button, ConfigProvider } from "antd";
import Logo from "../../assets/deeptech.png";
import freelancer from "../../assets/freelancer.jpg";
import { useState, useEffect } from "react";
import PageModal from "../../components/Modal/PageModal";
import LoginContent from "./Login";
import MultiStageSignUpForm from "../../components/MultiStageSignUpForm";
import { toast } from "sonner";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  GlobalOutlined,
  RightOutlined,
  StarFilled,
  RocketOutlined,
  SafetyOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const LandingPage = () => {
  const [isLoginModal, setIsLoginModal] = useState(false);
  const [isSignUpModal, setIsSignUpModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Animation trigger on mount
  useEffect(() => {
    setIsVisible(true);
    
    // Auto-cycle through features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);

    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      clearInterval(interval);
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const handleOpenLogin = () => setIsLoginModal(!isLoginModal);
  const handleSignUpModal = () => setIsSignUpModal(!isSignUpModal);

  const handleSignUpSuccess = () => {
    // Handle successful signup if needed
    console.log("Sign up successful");
    toast.success("Sign up successful! Please cheeck your email for verification.");
  }

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
      <div className="font-[gilroy-regular] bg-white text-[#333333] overflow-hidden">
        {/* Animated Background Particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-[#F6921E] opacity-10 rounded-full animate-bounce"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-[#333333] opacity-10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-[#F6921E] opacity-20 rounded-full animate-ping"></div>
          <div className="absolute bottom-20 right-40 w-14 h-14 bg-[#333333] opacity-15 rounded-full animate-bounce"></div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-br from-[#333333] via-[#444444] to-[#F6921E] text-white pb-20 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-2 animate-pulse"></div>
          
          <nav className={`flex justify-between items-center px-6 py-6 relative z-10 transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}>
            <div className="h-[50px] w-auto transform hover:scale-110 transition-transform duration-300">
              <img className="h-auto w-[65px] rounded-md shadow-lg" src={Logo} alt="MyDeepTech Logo" />
            </div>
            <ul className="flex gap-8 font-medium">
              <li className="cursor-pointer hover:text-[#F6921E] transition-colors duration-300 relative group">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#F6921E] group-hover:w-full transition-all duration-300"></span>
              </li>
              <li className="cursor-pointer hover:text-[#F6921E] transition-colors duration-300 relative group">
                <a href="/about-us">About</a>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#F6921E] group-hover:w-full transition-all duration-300"></span>
              </li>
            </ul>
            <div className="flex gap-4">
              <Button 
                className="!bg-transparent !text-white !border-white !rounded-xl hover:!bg-white hover:!text-[#333333] transition-all duration-300 transform hover:scale-105 p-5 !font-[gilroy-regular]" 
                onClick={handleOpenLogin}
              >
                Login
              </Button>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="flex px-8 py-16 gap-12 justify-center items-center relative z-10">
            <div className={`flex-1 space-y-8 transition-all duration-1200 delay-300 transform ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`}>
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-white to-[#F6921E] bg-clip-text text-transparent animate-pulse">
                  Empowering Freelancers
                </h1>
                <h2 className="text-3xl md:text-4xl font-semibold text-white">
                  in Data Annotation & AI Development
                </h2>
              </div>
              
              <p className="text-xl max-w-2xl text-gray-100 leading-relaxed">
                Join the future of AI. Find premium gigs, showcase your expertise, and earn competitive income 
                from global AI projects. Work remotely with trusted partners worldwide.
              </p>

              {/* Key Benefits Pills */}
              <div className="flex flex-wrap gap-3 py-4">
                {['Remote Work', 'Dollar Payments', 'Verified Projects', 'Global Opportunities'].map((benefit, index) => (
                  <div 
                    key={benefit}
                    className={`bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white border border-white/20 transform transition-all duration-300 delay-${index * 100} hover:bg-[#F6921E] hover:scale-105 ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                  >
                    <CheckCircleOutlined className="mr-2" />
                    {benefit}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={handleSignUpModal}
                  className="!bg-[#F6921E] hover:!bg-[#e8831a] !text-white !w-auto !px-8 !h-12 !rounded-xl !font-[gilroy-regular] !border-none !shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <RocketOutlined className="mr-2" />
                  Get Started Today
                </Button>
                
                <Button
                  className="!bg-transparent !text-white !border-2 !border-white !px-6 !h-12 !rounded-xl hover:!bg-white hover:!text-[#333333] transform transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Learn More
                  <RightOutlined className="ml-2" />
                </Button>
              </div>
            </div>
            
            <div className={`hidden md:block relative transition-all duration-1200 delay-500 transform ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
              <div className="relative">
                {/* Animated Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-[#F6921E] animate-spin" style={{animationDuration: '10s'}}></div>
                <div className="absolute inset-4 rounded-full border-2 border-white opacity-30 animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
                
                <img 
                  src="https://outsource-philippines.com/wp-content/uploads/2023/08/businessman-using-data-annotation-tools-on-his-laptop.webp" 
                  className="w-[32rem] h-[32rem] object-cover rounded-full border-8 border-white shadow-2xl transform hover:scale-105 transition-transform duration-500 relative z-10" 
                  alt="Professional Freelancer" 
                />
                
                {/* Floating Stats */}
                <div className="absolute -top-4 -left-4 bg-[#F6921E] text-white p-4 rounded-lg shadow-xl animate-bounce">
                  <div className="text-2xl font-bold">1752+</div>
                  <div className="text-sm">Active Users</div>
                </div>
                
                <div className="absolute -bottom-4 -right-4 bg-white text-[#333333] p-4 rounded-lg shadow-xl animate-pulse">
                  <div className="text-2xl font-bold text-[#F6921E]">$50+</div>
                  <div className="text-sm">Hourly Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <section className="py-20 px-6 max-w-7xl mx-auto text-center space-y-16 relative">
          {/* Section Header */}
          <div className={`space-y-4 transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#333333] mb-4">
              What Makes Us <span className="text-[#F6921E]">Different</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just another platform. We're your partners in building a successful freelance career in AI.
            </p>
          </div>

          {/* Interactive Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <SafetyOutlined className="text-4xl" />, 
                title: "Verified Remote Gigs", 
                desc: "Every project is thoroughly vetted. Work with confidence knowing all opportunities are from trusted, legitimate platforms and companies.",
                color: "from-blue-500 to-blue-600"
              },
              { 
                icon: <DollarOutlined className="text-4xl" />, 
                title: "Fair Dollar Payments", 
                desc: "Earn in USD and withdraw directly to your local account. Transparent pricing with no hidden fees or surprises.",
                color: "from-green-500 to-green-600"
              },
              { 
                icon: <TeamOutlined className="text-4xl" />, 
                title: "Skill-Based Matching", 
                desc: "Our AI matches you with projects that align with your expertise. Focus on what you do best and maximize your earning potential.",
                color: "from-purple-500 to-purple-600"
              },
            ].map((item, index) => (
              <div 
                key={index}
                className={`group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-gray-100 overflow-hidden ${
                  activeFeature === index ? 'scale-105' : 'hover:scale-105'
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                {/* Animated Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Icon with Animation */}
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}>
                  {item.icon}
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-[#333333] group-hover:text-[#F6921E] transition-colors duration-300">
                  {item.title}
                </h3>
                
                <p className="text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                  {item.desc}
                </p>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#F6921E] transition-all duration-500"></div>
                
                {/* Floating Particles */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-[#F6921E] rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className={`grid grid-cols-2 md:grid-cols-2 gap-8 pt-16 transition-all duration-1000 delay-300 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            {[
              { number: "500+", label: "Active Freelancers" },
              { number: "50+", label: "Countries Served" }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl font-bold text-[#F6921E] mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-gradient-to-br from-[#FAFAFA] to-[#F0F0F0] py-20 px-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-32 h-32 border border-[#F6921E] rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 border border-[#333333] rounded-full"></div>
            <div className="absolute top-40 right-40 w-16 h-16 bg-[#F6921E] rounded-full opacity-20"></div>
          </div>

          <div className="max-w-6xl mx-auto text-center space-y-16 relative z-10">
            <div className={`space-y-4 transition-all duration-1000 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <h2 className="text-4xl md:text-5xl font-bold text-[#333333]">
                How It <span className="text-[#F6921E]">Works</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From application to payment, we've streamlined the entire process to get you earning faster.
              </p>
            </div>

            {/* Process Steps with Animation */}
            <div className="grid md:grid-cols-4 gap-8 text-left relative">
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#F6921E] to-[#333333]"></div>
              
              {[
                { 
                  icon: <GlobalOutlined />, 
                  title: "Apply to Projects", 
                  desc: "Browse verified opportunities and apply to projects that match your skills and interests.",
                  color: "from-blue-500 to-blue-600" 
                },
                { 
                  icon: <CheckCircleOutlined />, 
                  title: "Get Approved by Admin", 
                  desc: "Our team reviews your application and approves qualified candidates within 24 hours.",
                  color: "from-green-500 to-green-600" 
                },
                { 
                  icon: <RocketOutlined />, 
                  title: "Submit Quality Tasks", 
                  desc: "Complete assignments using our intuitive tools and submit high-quality work on time.",
                  color: "from-purple-500 to-purple-600" 
                },
                { 
                  icon: <DollarOutlined />, 
                  title: "Get Paid in Dollars", 
                  desc: "Receive payments directly to your account in USD. Secure payouts with full transparency.",
                  color: "from-orange-500 to-orange-600" 
                },
              ].map((step, index) => (
                <div 
                  key={index} 
                  className={`relative group transform transition-all duration-700 delay-${index * 200} ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#F6921E] text-white rounded-full flex items-center justify-center font-bold text-sm z-10 group-hover:scale-125 transition-transform duration-300">
                    {index + 1}
                  </div>

                  <div className="bg-white shadow-lg hover:shadow-2xl rounded-2xl border-l-4 border-[#F6921E] p-8 h-full transform transition-all duration-500 hover:-translate-y-2 group-hover:border-l-8">
                    {/* Animated Icon */}
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white text-xl mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                      {step.icon}
                    </div>

                    <h4 className="text-xl font-bold mb-4 text-[#333333] group-hover:text-[#F6921E] transition-colors duration-300">
                      {step.title}
                    </h4>
                    
                    <p className="text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                      {step.desc}
                    </p>

                    {/* Hover Effect Arrow */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <RightOutlined className="text-[#F6921E]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className={`pt-8 transition-all duration-1000 delay-800 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <Button
                onClick={handleSignUpModal}
                className="!bg-[#F6921E] hover:!bg-[#e8831a] !text-white !px-8 !py-3 !h-auto !rounded-xl !font-[gilroy-regular] !border-none !shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <RocketOutlined className="mr-2" />
                Start Your Journey Today
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-6 text-center bg-white max-w-7xl mx-auto relative">
          <div className={`space-y-4 mb-16 transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#333333]">
              What Our <span className="text-[#F6921E]">Freelancers</span> Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied freelancers who've transformed their careers with MyDeepTech.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                name: "Blessing Adeyemi",
                location: "Lagos, Nigeria",
                comment: "MyDeepTech changed my life! I finally found legitimate remote work that pays fairly. The platform is transparent, the projects are real, and I've earned more in 6 months than I did in my previous year.",
                rating: 5,
                avatar: "B",
                role: "Data Annotation Specialist",
                earnings: "$2,400+",
                color: "from-pink-500 to-rose-500"
              },
              {
                name: "Uche Okafor",
                location: "Abuja, Nigeria",
                comment: "The interface is incredibly user-friendly, and the support team is always helpful. I love how they match projects to my skills. Working from home doing text and image labeling has never been this rewarding!",
                rating: 5,
                avatar: "U",
                role: "AI Training Specialist",
                earnings: "$3,100+",
                color: "from-blue-500 to-cyan-500"
              },
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className={`group relative bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl shadow-lg hover:shadow-2xl transform transition-all duration-700 delay-${index * 200} hover:-translate-y-4 border border-gray-100 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F6921E]/10 to-transparent rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700"></div>
                
                {/* Quote Icon */}
                <div className="absolute top-6 left-6 text-6xl text-[#F6921E] opacity-20 font-serif">"</div>
                
                {/* Stars */}
                <div className="flex justify-center mb-6 relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarFilled 
                      key={i} 
                      className="text-yellow-400 text-xl mx-1 transform group-hover:scale-110 transition-transform duration-300" 
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-700 italic text-lg leading-relaxed mb-8 relative z-10 group-hover:text-gray-800 transition-colors duration-300">
                  "{testimonial.comment}"
                </p>

                {/* Profile Section */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${testimonial.color} flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300`}>
                      {testimonial.avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#333333] text-lg">{testimonial.name}</p>
                      <p className="text-[#F6921E] font-medium">{testimonial.role}</p>
                      <p className="text-gray-500 text-sm">{testimonial.location}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#F6921E]">{testimonial.earnings}</div>
                    <div className="text-sm text-gray-500">Total Earned</div>
                  </div>
                </div>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-[#F6921E]/30 transition-all duration-500"></div>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className={`mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-600 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="text-center group">
              <TrophyOutlined className="text-4xl text-[#F6921E] mb-3 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-2xl font-bold text-[#333333]">Rated #1</div>
              <div className="text-gray-600">Best Freelance Platform</div>
            </div>
            <div className="text-center group">
              <StarFilled className="text-4xl text-yellow-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-2xl font-bold text-[#333333]">4.9/5</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
            <div className="text-center group">
              <SafetyOutlined className="text-4xl text-green-500 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-2xl font-bold text-[#333333]">100%</div>
              <div className="text-gray-600">Secure Payments</div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="relative bg-gradient-to-br from-[#333333] via-[#2A2A2A] to-[#1A1A1A] py-24 px-6 text-center text-white overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-[#F6921E] rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#F6921E] rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-[#F6921E] rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>

          <div className={`relative z-10 max-w-4xl mx-auto transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="mb-8">
              <RocketOutlined className="text-6xl text-[#F6921E] mb-6 animate-bounce" />
              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Transform Your Life?
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Join <span className="text-[#F6921E] font-bold">10,000+</span> Africans making real money from global data jobs
              </p>
            </div>

            {/* CTA Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center group">
                <div className="text-3xl font-bold text-[#F6921E] group-hover:scale-110 transition-transform duration-300">$500+</div>
                <div className="text-gray-400">Average Monthly Earnings</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-[#F6921E] group-hover:scale-110 transition-transform duration-300">24/7</div>
                <div className="text-gray-400">Work Anytime</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-[#F6921E] group-hover:scale-110 transition-transform duration-300">Free</div>
                <div className="text-gray-400">No Hidden Fees</div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-6">
              <Button
                className="!bg-gradient-to-r !font-[gilroy-bold] !from-[#F6921E] !to-[#FF8C00] !text-white !rounded-2xl !px-12 !py-6 !font-bold !text-xl !border-none !shadow-2xl hover:!shadow-[0_0_30px_rgba(246,146,30,0.5)] !transform !transition-all !duration-300 hover:!scale-105"
                onClick={handleSignUpModal}
                size="large"
              >
                <RocketOutlined className="mr-2" />
                Start Earning Today - It's FREE!
              </Button>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <CheckCircleOutlined className="text-green-500 mr-2" />
                  No Credit Card Required
                </div>
                <div className="flex items-center">
                  <CheckCircleOutlined className="text-green-500 mr-2" />
                  Instant Access
                </div>
                <div className="flex items-center">
                  <CheckCircleOutlined className="text-green-500 mr-2" />
                  100% Free to Join
                </div>
              </div>
            </div>

            {/* Urgency Element */}
            <div className="mt-8 inline-flex items-center bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full px-6 py-2 text-orange-300">
              <ClockCircleOutlined className="mr-2 animate-pulse" />
              <span className="text-sm font-medium">Limited Time: Get priority access to high-paying projects</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative bg-gradient-to-r from-[#1A1A1A] via-[#222222] to-[#1A1A1A] text-white px-6 py-16 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#F6921E] to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#F6921E] rounded-full blur-3xl opacity-20"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Main Footer Content */}
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              {/* Brand Section */}
              <div className="md:col-span-1 space-y-6">
                <div className="flex items-center space-x-3">
                  <img src={Logo} alt="MyDeepTech" className="h-10 w-auto" />
                  <span className="text-2xl font-bold text-[#F6921E]">MyDeepTech</span>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Empowering Africans with legitimate remote work opportunities in AI and data annotation.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400 font-medium">Trusted by 10,000+ freelancers</span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-[#F6921E] border-b border-[#F6921E]/20 pb-2">
                  Quick Links
                </h4>
                <ul className="space-y-3">
                  {[
                    { name: "Home", href: "/" },
                    { name: "About Us", href: "#" },
                    { name: "How It Works", href: "#how-it-works" },
                    { name: "Projects", href: "#projects" },
                    { name: "Privacy Policy", href: "/privacy-policy" },
                    { name: "Terms of Service", href: "/terms-of-service" },
                  ].map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href}
                        className="text-gray-400 hover:text-[#F6921E] transition-colors duration-300 flex items-center group"
                      >
                        <RightOutlined className="text-xs mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-[#F6921E] border-b border-[#F6921E]/20 pb-2">
                  Services
                </h4>
                <ul className="space-y-3">
                  {[
                    "Data Annotation",
                    "Text Labeling", 
                    "Image Classification",
                    "AI Training Projects",
                  ].map((service, index) => (
                    <li key={index} className="text-gray-400 flex items-center">
                      <CheckCircleOutlined className="text-[#F6921E] text-xs mr-2" />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact & Stats */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-[#F6921E] border-b border-[#F6921E]/20 pb-2">
                  Contact & Support
                </h4>
                <div className="space-y-4">
                  <a 
                    href="mailto:support@mydeeptech.ng"
                    className="flex items-center text-gray-400 hover:text-[#F6921E] transition-colors duration-300 group"
                  >
                    <div className="w-8 h-8 bg-[#F6921E]/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-[#F6921E]/30 transition-colors duration-300">
                      <GlobalOutlined className="text-[#F6921E] text-sm" />
                    </div>
                    <span>support@mydeeptech.ng</span>
                  </a>
                  
                  <div className="flex items-center text-gray-400">
                    <div className="w-8 h-8 bg-[#F6921E]/20 rounded-lg flex items-center justify-center mr-3">
                      <TeamOutlined className="text-[#F6921E] text-sm" />
                    </div>
                    <span>Remote, Worldwide</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-r from-[#F6921E]/10 to-transparent rounded-lg p-4 border border-[#F6921E]/20">
                  <div className="text-2xl font-bold text-[#F6921E]">100%</div>
                  <div className="text-sm text-gray-400">Verified Projects</div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0">
                <p className="text-gray-400 text-sm flex items-center">
                  <span>© {new Date().getFullYear()} MyDeep Technologies LTD. All rights reserved.</span>
                  <span className="mx-3 text-gray-600">|</span>
                  <span className="text-[#F6921E]">Built with ❤️ in Africa</span>
                </p>
                <div className="flex items-center space-x-4 text-sm md:ml-4">
                  <a href="/privacy-policy" className="text-gray-400 hover:text-[#F6921E] transition-colors">
                    Privacy Policy
                  </a>
                  <span className="text-gray-600">|</span>
                  <a href="/terms-of-service" className="text-gray-400 hover:text-[#F6921E] transition-colors">
                    Terms of Service
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <SafetyOutlined className="text-green-500" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <StarFilled className="text-yellow-400" />
                  <span>4.9/5 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Modals */}
        <PageModal
          openModal={isLoginModal}
          onCancel={handleOpenLogin}
          closable={true}
          className="custom-modal"
          modalwidth="auto"
        >
          <LoginContent />
        </PageModal>

        <PageModal
          openModal={isSignUpModal}
          onCancel={handleSignUpModal}
          closable={true}
          className="bg-white text-[#333333]"
          modalwidth="50rem"
        >
          <MultiStageSignUpForm onSuccess={handleSignUpSuccess} className=" font-[gilroy-regular]" />
        </PageModal>
      </div>
    </ConfigProvider>
  );
};

export default LandingPage;
