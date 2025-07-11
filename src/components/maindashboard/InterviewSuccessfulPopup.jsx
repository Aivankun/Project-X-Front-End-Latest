import React, { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import SuccessAvatar from "../../assets/logo1.png";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "../../hook/useAnalytics";

const InterviewSuccessfulPopup = () => {
  const navigate = useNavigate();
  const { getAnalytics } = useAnalytics();

  const handleViewResults = () => {
    const interviewHistory =
      JSON.parse(localStorage.getItem("analytics")) || [];
    const latestInterview = interviewHistory[interviewHistory.length - 1];
    if (latestInterview) {
      getAnalytics();
      navigate(`/result/${latestInterview._id}`);
    } else {
      console.error("No interview found to view results.");
    }
  };

  const handleBackToInterview = () => {
    getAnalytics();
    navigate("/mockInterview");
  };

  return (
    <Modal
      show={true}
      centered
      dialogClassName="interviewsuccess-modal-width"
      backdrop={false}
    >
      <Modal.Body className="d-flex align-items-center flex-column position-relative">
        <img src={SuccessAvatar} alt="" />
        <p>Congratulations! Your interview was successfully recorded.</p>
        <div className="d-flex gap-2">
          <Button className="btn-analytics" onClick={handleViewResults}>
            View Your Results
          </Button>
          <Button
            className="btn-return-maindashboard"
            onClick={handleBackToInterview}
          >
            Back for Interview
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default InterviewSuccessfulPopup;
