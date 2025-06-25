import Logo from '../../assets/deeptech.png';

const AboutUs = () => {
  return (
    <div className="min-h-screen px-6 py-10 bg-white text-[#333333] font-[gilroy-regular]">
     <div className="h-[50px]">
              <a href="/"><img className="h-full rounded-md" src={Logo} alt="Logo" /></a>
            </div>
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#F6921E]">About MyDeepTech</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Empowering Africa's Data Workforce for the Future of AI.
          </p>
        </div>

        {/* Section: What We Do */}
        <section>
          <h2 className="text-2xl font-semibold text-[#F6921E] mb-3">🚀 What We Do</h2>
          <p className="text-gray-700 leading-relaxed">
            We partner with top AI companies and data labeling platforms such as
            <strong> Appen, Oneforma, CVAT, and e2f</strong> to access project opportunities in:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
            <li>Text Annotation</li>
            <li>Image Labeling</li>
            <li>Audio Transcription</li>
            <li>Video Segmentation</li>
          </ul>
        </section>

        {/* Section: How It Works */}
        <section>
          <h2 className="text-2xl font-semibold text-[#F6921E] mb-3">💼 How It Works</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <strong>Global Partnerships:</strong> We secure annotation tasks from global clients in USD.
            </li>
            <li>
              <strong>Freelancer Matching:</strong> Verified freelancers apply for projects based on their skills.
            </li>
            <li>
              <strong>Task Submission & Review:</strong> Tasks are submitted and reviewed for quality.
            </li>
            <li>
              <strong>Earn & Get Paid:</strong> Freelancers are paid in Naira while we handle the exchange and reporting.
            </li>
          </ol>
        </section>

        {/* Section: Vision */}
        <section>
          <h2 className="text-2xl font-semibold text-[#F6921E] mb-3">🌍 Our Vision</h2>
          <p className="text-gray-700 leading-relaxed">
            To become Africa’s most trusted platform for connecting skilled freelancers to global data labeling jobs —
            <strong> with fair pay, clear tasks, and zero competition distractions.</strong>
          </p>
        </section>

        {/* Section: Why Choose Us */}
        <section>
          <h2 className="text-2xl font-semibold text-[#F6921E] mb-3">🤝 Why Choose Us</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Transparent Payment Structure — no hidden fees.</li>
            <li>Real Projects, Real Pay — we post only secured jobs.</li>
            <li>Remote First — work from anywhere, anytime.</li>
            <li>We Advocate for You — we handle negotiations and feedback.</li>
          </ul>
        </section>

        {/* Section: Join Us */}
        <section className="text-center">
          <h2 className="text-2xl font-semibold text-[#F6921E] mb-3">👥 Join Us</h2>
          <p className="text-gray-700 max-w-xl mx-auto">
            Whether you're an experienced annotator or just starting out, <strong>MyDeepTech</strong> gives you the tools,
            training, and tasks you need to thrive in the AI era.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
