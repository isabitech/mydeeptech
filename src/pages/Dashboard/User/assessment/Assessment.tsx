
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import Header from "../Header";
import Start from "./Start";
import Submit from "./Submit";
import { useState, useEffect } from "react";

const Assessment = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  const handleSubmissionSuccess = () => {
    setIsSubmitted(true);
    setShowSuccessModal(true);
  };

  // Handle countdown and redirection
  useEffect(() => {
    if (showSuccessModal && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showSuccessModal && countdown === 0) {
      // Clear session and redirect to login
      sessionStorage.clear();
      navigate("/login");
    }
  }, [showSuccessModal, countdown, navigate]);

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

      {/* Success Modal */}
      <Modal
        open={showSuccessModal}
        closable={false}
        footer={null}
        centered
        width={500}
        maskClosable={false}
      >
        <div className="text-center py-6">
          <div className="text-green-500 text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Assessment Submitted Successfully!
          </h2>
          <p className="text-gray-700 mb-6 text-lg">
            Thank you for completing your assessment. 
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-medium">
              Please log out and log back in to see your updated status.
            </p>
          </div>
          <p className="text-gray-600">
            Redirecting to login page in <span className="font-bold text-blue-600">{countdown}</span> seconds...
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </Modal>
      
    </div>
  );
};

export default Assessment;
