import React, { useEffect, useState } from "react";
import mammoth from "mammoth";
import axios from "axios";

function CompareResumes() {

  const uploadedDocData = JSON.parse(localStorage.getItem('rfoUploadedDocxData'));
  const [originalResumeContent, setOriginalResumeContent] = useState("");
  const [isFetched, setIsFetched] = useState(false);
  const [uploadedDocxData, setuploadedDocxData] = useState("");
  const SERVER_URL = process.env.REACT_APP_API_URL;
  const userStr = localStorage.getItem("user");
  const userData = userStr ? JSON.parse(userStr) : null; 
  const token = userData?.token;
  const fetchOriginalResume = async () => {
    try {
      console.log("uploadedDocxData._id",uploadedDocxData.data._id);
      
      const response = await axios.get(
        `${SERVER_URL}/api/resume-fit-optimizer/get-document/${uploadedDocxData.data._id}`,
        {
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // const buffer = Buffer.from(response.data, "binary");
      // const originalResume = await mammoth.read(buffer);
      // setOriginalResumeContent(originalResume.value);
      // console.log("originalResumeContent", originalResumeContent );

      
      const arrayBuffer = response.data;
      const blob = new Blob([arrayBuffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const reader = new FileReader();

      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setOriginalResumeContent(result.value);
      };

      reader.readAsArrayBuffer(blob);
      setIsFetched(true);
    } catch (error) {
      console.error("Error fetching original resume:", error);
    }
  };
  if (!isFetched) {
    fetchOriginalResume();
  }
  useEffect(() => {
    if (uploadedDocData && !uploadedDocxData) {
      setuploadedDocxData(uploadedDocData);
    }
  }, [uploadedDocData, uploadedDocxData]);
  return (
    <div className="ResumeFitOptimizer-contentainer d-flex flex-column gap-2">
      <div className="compareresumes-container d-flex justify-content-center align-items-center flex-column gap-3">
        <div className=" compareresumes-resume-content w-100 d-flex gap-3 px-4">
          <div className="compareresumes-content-resume-original">
            <div className="compareresumes-content-resume-original-header">
              <h5>Original Resume</h5>
            </div>
            <div
              className="compareresumes-content-resume-original-content"
              dangerouslySetInnerHTML={{ __html: originalResumeContent }}
            />
          </div>
          <div className="compareresumes-content-resume-optimized">
            <div className="compareresumes-content-resume-optimized-header">
              <h5>Optimized Resume</h5>
            </div>
            <div className="compareresumes-content-resume-optimized-content"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompareResumes;
