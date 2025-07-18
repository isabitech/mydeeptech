import Logo from "../../assets/deeptech.png";

const Hiring = () => {
  return (
    <section className="w-full px-4 py-10 flex flex-col items-center bg-gray-50 font-[gilroy-regular] text-gray-800">
      <div className="h-[50px] mb-4">
        <a href="/">
          <img className="h-full rounded-md" src={Logo} alt="Logo" />
        </a>
      </div>
      <div className="max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          🚀 We’re Hiring: Frontend Developer (AI Training)
        </h2>

        <p className="text-gray-600 mb-6">
          Join our mission to shape the future of AI! We're looking for a
          talented frontend developer to help us build intuitive interfaces and
          improve AI-generated code.
        </p>

        <div className="text-left text-gray-700 space-y-4 mb-8">
          <div>
            <h3 className="font-semibold text-lg">
              You may contribute your expertise by…
            </h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                Creating and answering questions about front-end development and
                web design to help train AI models
              </li>
              <li>
                Reviewing and evaluating code generated by AI in JavaScript,
                React, and other modern front-end frameworks
              </li>
              <li>
                Assessing UI/UX quality, accessibility, and design choices made
                by AI-generated code
              </li>
              <li>
                Offering expert-level feedback on what makes a user interface
                intuitive, functional, and beautiful
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg">
              We’re looking for people with…
            </h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                Strong technical skills in HTML, CSS, JavaScript, and frameworks
                like React, Next.js, Vue, or similar
              </li>
              <li>
                An eye for world-class design—deep understanding of UI/UX
                principles, responsive design, and interaction patterns
              </li>
              <li>
                Experience building polished, accessible, and production-ready
                web interfaces
              </li>
              <li>
                A background in computer science, web development, or digital
                design (degree not required if experience is exceptional)
              </li>
              <li>
                Outstanding attention to detail and ability to communicate
                clearly about visual and code quality
              </li>
            </ul>
          </div>
          <h3 className="font-bold">Pay : $10-$15 per Hour</h3>
        </div>

        <button className="bg-secondary text-white px-6 py-2 rounded-full transition hover:shadow-md">
          <a href="https://forms.gle/yDLKnoLGAZxxse3b7"> Apply Now</a>
        </button>
      </div>
    </section>
  );
};

export default Hiring;
