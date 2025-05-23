import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import Header from "../../components/AiReference/Header";
import Sidebar from "../../components/AiReference/Sidebar";
import ReferenceRequest from "../../components/AiReference/ReferenceRequest/ReferenceRequest";
import PopupGuide from "../../components/AiReference/PopupGuide"; // Import PopupGuide
import TranslationDropdown from "../../components/AiReference/TranslationDropdown";

import "../../styles/AiReferenceStyles/AiReferenceJobs.css";
import "../../styles/AiReferenceStyles/AiReferenceRequest.css";

function AiReferenceRequestPage() {
  const [showGuide, setShowGuide] = useState(true); // State to control guide visibility

  return (
    <>
      <div className="mock-background">
        <Header />
        <div className="MockMaindashboard-container h-100">
          <Row>
            {/* Sidebar with 3/12 width */}
            <Col md={2} className="p-0 MockSidebar">
              <Sidebar />
            </Col>
            {/* Main content area with 9/12 width */}
            <Col md={10} className="p-3">
              <ReferenceRequest />
              <TranslationDropdown />

            </Col>
          </Row>
        </div>
        {showGuide && <PopupGuide introKey="referenceRequests" />}{" "}
        {/* Pass "referenceRequests" as introKey */}
      </div>
    </>
  );
}

export default AiReferenceRequestPage;
