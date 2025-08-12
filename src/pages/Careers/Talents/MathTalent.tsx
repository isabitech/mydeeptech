import Logo from "../../../assets/deeptech.png";

const MathTalent = () => {
  return (
    <section className="w-full px-4 py-10 flex flex-col items-center bg-gray-50 font-[gilroy-regular] text-gray-800">
      <div className="h-[50px] mb-4">
        <a href="/">
          <img className="h-full rounded-md" src={Logo} alt="Logo" />
        </a>
      </div>
      <div className="max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          📊 We’re Hiring: Math AI Trainer
        </h2>

        <p className="text-gray-600 mb-6">
          Join our mission to shape the future of AI in mathematics! We’re
          looking for a skilled Math AI Trainer to create, review, and enhance
          AI-generated math content—helping models solve problems more
          accurately and explain solutions more clearly.
        </p>

        <div className="text-left text-gray-700 space-y-4 mb-8">
          <div>
            <h3 className="font-semibold text-lg">
              You may contribute your expertise by…
            </h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                Creating and answering mathematics problems across various
                topics (algebra, calculus, statistics, geometry, etc.) to train
                AI models
              </li>
              <li>
                Reviewing and evaluating AI-generated solutions for accuracy,
                clarity, and proper mathematical reasoning
              </li>
              <li>
                Providing step-by-step explanations to improve AI's ability to
                teach concepts effectively
              </li>
              <li>
                Suggesting better approaches for solving problems and
                simplifying explanations
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg">
              We’re looking for people with…
            </h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Strong mathematical skills and problem-solving abilities</li>
              <li>
                Deep understanding of at least two areas of mathematics (e.g.,
                algebra & calculus, or statistics & probability)
              </li>
              <li>
                Ability to explain complex concepts in a simple, clear manner
              </li>
              <li>
                Experience teaching, tutoring, or creating math content (formal
                degree is a plus but not required)
              </li>
              <li>
                Excellent attention to detail and logical reasoning
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg">
              Additional Requirements (Compulsory)
            </h3>
            <ul className="list-disc list-inside mt-2 space-y-1 text-red-600">
              <li>Access to a good working laptop</li>
              <li>Good and stable internet connection</li>
              <li>
                Bachelor’s degree (B.Sc) in Mathematics or a related field
              </li>
              <li>Computer savvy and comfortable with online tools</li>
              <li>
                Ready to commit a minimum of 25 hours per week to the role
              </li>
            </ul>
          </div>

          <h3 className="font-bold mt-6">
            Pay: $5/hour ($600/month) — approx. ₦900,000/month
          </h3>
        </div>

        <button className="bg-secondary text-white px-6 py-2 rounded-full transition hover:shadow-md">
          <a href="https://docs.google.com/forms/d/e/1FAIpQLScUPsb8Bds5diKGacoe3HrBI629SMXhSEyJFupDj3SIGCkT5A/viewform?usp=header">Apply Now</a>
        </button>
      </div>
    </section>
  );
};

export default MathTalent;
