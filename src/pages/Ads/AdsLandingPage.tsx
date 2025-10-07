import SignUpForm from "../Projects/GetPaidToTrainAi/Signupform";

export default function AdsLandingPage() {
  return (
    <div className="min-h-screen flex  font-[gilroy-regular] ">
      <div className="grid md:grid-cols-2 max-w-5xl w-full   shadow-sm overflow-hidden">
        
        {/* Left Section */}
        <div className="p-10 justify-center h-full flex flex-col bg-[#333333] text-white  ">
          <h1 className="text-4xl font-bold ">MyDeepTech</h1>
          <h2 className="mt-2 text-2xl font-semibold ">
            Get Paid to Train AI
          </h2>
          <p className="mt-2 ">
            No experience needed, all backgrounds welcome.
          </p>

          <ul className="mt-6 space-y-3 ">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary rounded-full"></span>
              Competitive pay rates
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary rounded-full"></span>
              Work remotely from anywhere
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary rounded-full"></span>
              Flexible schedule
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary rounded-full"></span>
              All domains needed
            </li>
          </ul>

          <p className="mt-6 text-sm text-secondary">
            Join hundreds of experts earning <span className="font-semibold text-white">$30/hr</span> already with MyDeepTech
          </p>
        </div>

        {/* Right Section */}
        <div className="p-10 flex flex-col items-center justify-center bg-[#333333] ">
          <div className="text-white mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18v.01M8.84 4.58a7 7 0 016.32 0m2.74 2.74a7 7 0 010 6.32m-2.74 2.74a7 7 0 01-6.32 0m-2.74-2.74a7 7 0 010-6.32"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-4">
            Ready to get started?
          </h3>
          <button className="bg-secondary text-white px-8 py-3 rounded-lg shadow hover:bg-gray-800 transition">
            Apply Now
          </button>
          <p className="mt-2 text-sm text-white">
            Takes less than 1 minute to complete
          </p>
        </div>
      </div>
      <SignUpForm/>
    </div>
  );
}
