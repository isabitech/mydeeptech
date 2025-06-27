import { useState } from "react";
import axios from "axios";
import Logo from "../../../assets/deeptech.png"; // Adjust the path as necessary
import { notification } from "antd";
import { endpoints } from "../../../store/api/endpoints";
import "../../../components/Loader/loader.css";

const Survey = () => {
  const [email, setEmail] = useState("");
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${endpoints.survey.verifyEmail}`, {
        email: email,
      });
      console.log(response.data);
      if (response.data?.success) {
        notification.success({
          message: "Eligibility Verified",
          description: `${
            response.data?.message || "You are eligible to fill this survey."
          }`,
        });
        console.log(response.data);
        setIsEligible(true);
      } else {
        notification.error({
          message: "Eligibility Not Verified",
          description: `${
            response.data?.message || "You're not eligible to fill this survey."
          }`,
        });
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black font-[gilroy-regular]">
      <div className="h-[50px] mb-4">
        <a href="/">
          <img className="h-full rounded-md" src={Logo} alt="Logo" />
        </a>
      </div>
      {!isEligible ? (
        <div className="bg-gray-100 p-6 rounded-md shadow-md w-[400px]">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Enter your Email to check eligibility
          </h2>
          <input
            type="email"
            className="w-full p-2 border rounded mb-3"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={handleVerify}
            disabled={loading}
            className="bg-secondary w-full text-white py-2 rounded hover:bg-[#e68000] transition flex justify-center"
          >
            {loading ? <div className="loader"></div> : "Verify"}
          </button>
          {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
        </div>
      ) : (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Please fill the form, when it Loads successfully.
          </h3>
          <div className="w-full flex justify-center px-4">
            <div className="w-[75vw] max-sm:w-[95vw] min-h-[80svh]  ">
              <iframe
                className="w-full h-full rounded-md border-none"
                src="https://docs.google.com/forms/d/e/1FAIpQLScYeG383vgLsPFc6P_pAe79QfPdehto3zuPkKshe2Sx29XpPw/viewform?embedded=true"
                frameBorder="0"
                allowFullScreen
              >
                Loading…
              </iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Survey;
