
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import Start from "./Start";
import Submit from "./Submit";
import { useState } from "react";

const Assessment = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmissionSuccess = () => {
    setIsSubmitted(true);
    navigate("/dashboard/overview?resultSubmitted=true");
  };

  return (
    <div className="font-[gilroy-regular] p-6">
      <Header title="Assessment" />

      {!isSubmitted ? (
        <>
          {/* Start Section */}
          <Start/>

          {/* Submit Section */}
          <Submit onSubmissionSuccess={handleSubmissionSuccess}/>
        </>
      ) : (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="text-green-600 text-2xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">Assessment Received</h2>
          <p className="text-green-700">You will receive further instructions via email.</p>
        </div>
      )}
      
    </div>
  );
};

export default Assessment;
