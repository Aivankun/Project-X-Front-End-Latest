// CandidateDetailsPopUp.jsx
import React from "react";
import { Modal, Button } from "react-bootstrap";

const CandidateDetailsPopUp = ({ candidates, onClose, onEdit }) => {
  // Add onEdit prop
  // Function to get the color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return "#319F43";
      case "Completed":
        return "#1877F2";
      case "Failed":
        return "#FF0000";
      default:
        return "black"; // Default color for unknown statuses
    }
  };

  const formatDate = (date) => {
    return date.split("T")[0];
  };

  return (
    <Modal
      show={true}
      onHide={onClose}
      centered
      className="custom-modal-job"
      backdrop={true}
    >
      <Modal.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5
              className="m-0 color-orange"
              style={{ textTransform: "capitalize" }}
            >
              {typeof candidates.name === "string"
                ? candidates.name
                : `${candidates.name.firstName} ${candidates.name.lastName}`}
            </h5>
          </div>
          <div className="d-flex justify-content-center align-items-center">
            <p className="m-0 candidate-id">
              <strong>Candidate ID:</strong> {candidates._id}
            </p>

            <Button
              className="closebtn"
              variant="link"
              onClick={onClose}
              style={{ fontSize: "1.5rem", textDecoration: "none" }}
            >
              &times;
            </Button>
          </div>
        </div>

        <div className="d-flex gap-4">
          <div>
            <p className="d-flex gap-2 align-items-center justify-content-start">
              <strong
                className="d-flex gap-2 align-items-center"
                style={{ width: "150px" }}
              >
                Status:
              </strong>{" "}
              <span style={{ color: getStatusColor(candidates.status) }}>
                {" "}
                {candidates.status}
              </span>
            </p>
            <p className="d-flex gap-2 align-items-center justify-content-start">
              <strong
                className="d-flex gap-2 align-items-center"
                style={{ width: "150px" }}
              >
                {" "}
                Email:
              </strong>{" "}
              {candidates.email}
            </p>
          </div>
          <div>
            <p className="d-flex gap-2 align-items-center justify-content-start">
              <strong
                className="d-flex gap-2 align-items-center"
                style={{ width: "150px" }}
              >
                Position:
              </strong>{" "}
              {candidates.position || "N/A"}
            </p>
            <p className="d-flex gap-2 align-items-center justify-content-start mb-5">
              <strong
                className="d-flex gap-2 align-items-center"
                style={{ width: "150px" }}
              >
                Applied Date:
              </strong>{" "}
              {formatDate(candidates.createdAt) || "N/A"}
            </p>
          </div>
        </div>

        <div className="candidate-button-controller w-100 d-flex justify-content-center align-items-center gap-3">
          <button onClick={onEdit}>Edit</button>{" "}
          {/* Call onEdit when clicked */}
          <button>Send Email</button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CandidateDetailsPopUp;
