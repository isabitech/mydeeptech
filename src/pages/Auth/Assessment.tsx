import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AssessmentIntroduction from "./AssessmentIntroduction";
import AssessmentExam from "./AssessmentExam";
import AssessmentResults from "./AssessmentResults";
import { Modal } from "antd";

type AssessmentStep = "introduction" | "exam" | "results" | "completed";

const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] =
    useState<AssessmentStep>("introduction");
  const [assessmentScore, setAssessmentScore] = useState<number>(0);
  const [assessmentStatus, setAssessmentStatus] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);

  // Countdown effect for the success modal
  useEffect(() => {
    if (showSuccessModal && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } 
    else if (showSuccessModal && countdown === 0) {
      // Clear user data and redirect to login
      // localStorage.removeItem("user");
      // localStorage.removeItem("userInfo");
      // sessionStorage.clear();
      navigate("/dashboard/assessment");
    }
  }, [showSuccessModal, countdown, navigate]);

  const handleStartAssessment = () => {
    setCurrentStep("exam");
  };

  const handleSubmitSuccess = (score: number, status: string) => {
    setAssessmentScore(score);
    setAssessmentStatus(status);
    setCurrentStep("results");
  };

  const handleReturnToDashboard = () => {
    // Show success modal instead of directly navigating
    setCurrentStep("completed");
    setShowSuccessModal(true);
    setCountdown(5);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "introduction":
        return (
          <AssessmentIntroduction onStartAssessment={handleStartAssessment} />
        );

      case "exam":
        return <AssessmentExam onSubmitSuccess={handleSubmitSuccess} />;

      case "results":
        return (
          <AssessmentResults
            score={assessmentScore}
            status={assessmentStatus}
            onReturnToDashboard={handleReturnToDashboard}
          />
        );

      case "completed":
        return (
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
                Thank you for completing your assessment. Your results have been saved.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 font-medium">
                  Please log out and log back in to see your updated status and access new projects.
                </p>
              </div>
              <p className="text-gray-600">
                Redirecting to login page in{" "}
                <span className="font-bold text-blue-600">{countdown}</span>{" "}
                seconds...
              </p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </Modal>
        );

      default:
        return (
          <AssessmentIntroduction onStartAssessment={handleStartAssessment} />
        );
    }
  };

  return <div className="assessment-container">{renderCurrentStep()}</div>;
};

export default Assessment;
