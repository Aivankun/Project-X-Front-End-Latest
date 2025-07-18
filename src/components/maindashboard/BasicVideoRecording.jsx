import { React, useState, useEffect, useRef } from "react";
import { Button, Row, Col, Spinner } from "react-bootstrap";
import ErrorAccessCam from "./errors/ErrorAccessCam";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaPause,
  FaPlay,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import CancelInterviewAlert from "../maindashboard/CancelInterviewModal";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hook/useAuthContext";
import axios from "axios";
import LoadingScreen from "./loadingScreen";
import tipsAvatar from "../../assets/tips-avatar.png";
import InterviewSuccessfulPopup from "../maindashboard/InterviewSuccessfulPopup";
import ErrorGenerateFeedback from "./errors/ErrorGenerateFeedback";
import ErrorGenerateQuestion from "./errors/ErrorGenerateQuestion";
import ErrorGenerateFinalGreeting from "./errors/ErrorGenerateFinalGreeting";
import ErrorUploadAnswer from "./errors/ErrorUploadAnswer";
import ErrorTranscription from "./errors/ErrorTranscription";
import ErrorWhileTranscription from "./errors/errorWhileTransciption";
import loading from "../../assets/loading.gif";
import io from "socket.io-client";
import Header from "../../components/Result/Header";
import { useGreeting } from "../../hook/useGreeting";
import InterviewerOption from "../maindashboard/InterviewerOption";
import InterviewPreviewOptionPopup from "./InterviewPreviewOptionPopup";
import InterviewPreview from "./InterviewPreview";
import { useAnalytics } from "../../hook/useAnalytics";
import { popupGuide } from "./PopupGuide";

const BasicVideoRecording = ({ interviewType, category }) => {
  const [errorWhileTranscribing, setErrorWhileTranscribing] = useState(false);
  const [uploadingError, setUploadingError] = useState(false);
  const { getAnalytics } = useAnalytics();
  const recordedChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
  const [showConfirm, setShowConfirm] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isIntroShown, setIsIntroShown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [interviewId, setInterviewId] = useState("");
  const countdownRef = useRef(null);
  const { user } = useAuthContext();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isReattemptingCamera, setIsReattemptingCamera] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);
  const [questionError, setQuestionError] = useState(false);
  const [currentGreetingText, setCurrentGreetingText] = useState("");
  const name = user.name.split(" ")[0];
  const audioRecorderRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const { firstGreeting } = useGreeting();
  const [isIntro, setIsIntro] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState(false);
  const [generateFinalGreetingError, setGenerateFinalGreetingError] =
    useState(false);
  const API = process.env.REACT_APP_API_URL;
  const [isResponseIndicatorVisible, setIsResponseIndicatorVisible] =
    useState(false);
  const transcriptRef = useRef("");
  const [isTranscriptionSpeaking, setIsTranscriptionSpeaking] = useState(false);
  const [isQuestionTranscribing, setIsQuestionTranscribing] = useState(false);
  const tips = [
    "Take deep breaths.",
    "Sit up straight.",
    "Smile naturally.",
    "Make eye contact.",
    "Speak slowly and clearly.",
    "Pause before answering.",
    "Stay positive.",
    "Use a strong voice.",
    "Dress professionally.",
    "Visualize success.",
    "Prepare key points.",
    "Practice power poses.",
    "Keep a glass of water nearby.",
    "Engage actively.",
    "Avoid fidgeting.",
    "Stay hydrated and eat well.",
    "Think of it as a conversation.",
    "Have a backup plan.",
    "End with a strong closing.",
  ];

  const [basicInterviewType, setBasicInterviewType] = useState(
    sessionStorage.getItem("basicInterviewType")
  );
  const [selectedQuestions, setSelectedQuestions] = useState(
    JSON.parse(sessionStorage.getItem("selectedQuestions"))
  );

  //Function that remove selected question and interview type from session storage when page is unmount
  useEffect(() => {
    return () => {
      removeBasicInterviewTypeAndSelectedQuestions();
    };
  }, []);

  //Handle remove basic interview type and selected questions from session storage
  const removeBasicInterviewTypeAndSelectedQuestions = () => {
    sessionStorage.removeItem("basicInterviewType");
    sessionStorage.removeItem("selectedQuestions");
  };

  // Add new state for interviewer selection
  const [showInterviewerSelect, setShowInterviewerSelect] = useState(true);
  const selectedInterviewer = useRef(null);
  const setSelectedInterviewer = (interviewer) => {
    selectedInterviewer.current = interviewer;
  };

  const setTranscript = (text) => {
    transcriptRef.current = `${transcriptRef.current}${text}`;
  };

  const setFinalTransciption = (text) => {
    transcriptRef.current = `${text}`;
  };

  const clearTranscript = () => {
    transcriptRef.current = "";
  };

  //increment the tip index
  const incrementTip = () => {
    setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
  };

  // const [interviewerGreetingText, setInterviewerGreetingText] = useState("");
  const interviewerGreetingText = useRef("");

  const setInterviewerGreetingText = () => {
    interviewerGreetingText.current = firstGreeting(
      selectedInterviewer.current
    );
  };

  //Increment the tip index every 20 seconds
  useEffect(() => {
    // Set interval to increment the tip every 20 seconds
    const interval = setInterval(incrementTip, 5000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(API, {
      reconnection: true, // Explicitly enable reconnection
      reconnectionAttempts: Infinity, // Keep trying indefinitely
      reconnectionDelay: 1000, // Start retrying after 1 second
      reconnectionDelayMax: 5000, // Max delay between retries
      auth: {
        token: user.token,
      },
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("connect_error", (error) => {
      console.error(`Connection error: ${error.message}`);
      setErrorWhileTranscribing(true);
      setIsResponseIndicatorVisible(true);
      setIsRecording(false);
      setIsPaused(true);
      setIsUploading(false);
      clearTranscript();
    });

    newSocket.emit("startTranscription");

    newSocket.on("reconnect_attempt", (attempt) => {
      console.log(`Reconnection attempt #${attempt}`);
    });

    newSocket.on("reconnect", () => {
      console.log("Reconnected to server");
    });

    newSocket.on("disconnect", (reason) => {
      console.warn(`Disconnected: ${reason}`);
    });

    setSocket(newSocket);

    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, []);

  //Toogle camera function
  const toggleCamera = () => {
    setIsCameraOn((prev) => !prev);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOn;
      });
    }
  };

  // Toggle mic mute and unmute function
  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuteState;
      });
    }
  };

  // Access camera when the component mounts
  useEffect(() => {
    // Cleanup function to stop the camera feed when the component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      recordedChunksRef.current = [];
      audioRecorderRef.current = null;
    };
  }, []);

  // Enable camera feed function
  const enableCameraFeed = async (retryCount = 3) => {
    setCameraError(false);
    setIsReattemptingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
      setIsReattemptingCamera(false);
      setCameraError(false);

      // Start the user introduction
      await userIntroduction();
    } catch (error) {
      setIsReattemptingCamera(false);
      setCameraError(true);
    }
  };

  const userIntroduction = async () => {
    if (!isIntroShown) {
      setIsIntro(true);
      setCurrentGreetingText(interviewerGreetingText.current);
      await speak(interviewerGreetingText.current, selectedInterviewer.current);

      // Show the response indicator after speaking the second greeting
      setIsResponseIndicatorVisible(true);
    }
  };

  // Speak function to convert text to audio
  const speak = async (text, voice) => {
    setIsTranscriptionSpeaking(true); // Disable the button before speaking
    try {
      const voiceType = voice.toLowerCase();
      const response = await axios.post(
        `${API}/api/interview/audio`,
        { text, voiceType },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      const { audio } = response.data;

      const audioBlob = new Blob(
        [Uint8Array.from(atob(audio), (c) => c.charCodeAt(0))],
        {
          type: "audio/mp3",
        }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);

      // Return a promise that resolves when the audio ends
      return new Promise((resolve, reject) => {
        audioElement.onended = () => {
          setIsTranscriptionSpeaking(false); // Enable the button after speaking
          resolve();
        };
        audioElement.onerror = reject;
        audioElement.play().catch(reject);
      });
    } catch (error) {
      console.error("Error fetching audio:", error);
      setIsTranscriptionSpeaking(false); // Enable the button in case of error
    }
  };

  // Final greeting function
  const aiFinalGreeting = async () => {
    try {
      // Set uploading state to true
      setIsRecording(false);
      setIsPaused(true);
      const interviewer = selectedInterviewer.current;

      // Create a payload object to send the transcription data
      const greeting = interviewerGreetingText.current;
      const userResponse = transcriptRef.current;

      if (!userResponse) {
        throw new Error("No transcription data to upload");
      }

      const payload = { greeting, userResponse, interviewer };

      const response = await axios.post(
        `${API}/api/interview/final-greeting`,
        payload,
        {
          headers: {
            "Content-Type": "application/json", // Required for file uploads
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setIsUploading(false);
      setIsIntro(false);
      //Extract the final greeting from the response
      const finalGreeting = await response.data.finalGreeting;

      // Set the final greeting text
      setCurrentGreetingText(finalGreeting);
      // Speak the final greeting
      await speak(finalGreeting, selectedInterviewer.current);

      setCurrentGreetingText("");
      clearTranscript();

      // Wait for a brief moment before starting the guide
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Start the guide
      startGuide();
    } catch (error) {
      if (error?.response?.status === 500) {
        setGenerateFinalGreetingError(true);
      }
      if (error?.message === "No transcription data to upload") {
        setTranscriptionError(true);
        clearTranscript();
      }

      console.error("Error fetching final response:", error);
    } finally {
      // Clear the recorded chunks after uploading
      recordedChunksRef.current = [];
      audioRecorderRef.current = [];
      // Set uploading state to false
      setIsUploading(false);
    }
  };

  // Show the response indicator after speaking the question
  useEffect(() => {
    if (
      questions.length > 0 &&
      questions[questionIndex] &&
      !isCountdownActive
    ) {
      setIsQuestionTranscribing(true); // Disable the button before transcribing
      speak(questions[questionIndex], selectedInterviewer.current).then(() => {
        setIsResponseIndicatorVisible(true); // Show the response indicator after speaking the question
        setIsQuestionTranscribing(false); // Enable the button after transcribing
      });
    }
  }, [questions, isCountdownActive, questionIndex]);

  // Reusable function to start recording
  const [recordedVideos, setRecordedVideos] = useState([]); // State to store recorded videos

  const startRecording = () => {
    try {
      setIsResponseIndicatorVisible(false);
      if (streamRef.current) {
        // Clear chunks before new recording
        recordedChunksRef.current = [];
        // Use the reference
        const stream = streamRef.current;
        // Initialize MediaRecorder with stream
        mediaRecorderRef.current = new MediaRecorder(streamRef.current);

        // Start recording if MediaRecorder is inactive
        if (mediaRecorderRef.current.state === "inactive") {
          mediaRecorderRef.current.start();
          setIsRecording(true);
          setIsPaused(false);
        }

        // Set up audio streaming
        const audioTrack = stream.getAudioTracks()[0];
        const audioStream = new MediaStream([audioTrack]);

        audioRecorderRef.current = new MediaRecorder(audioStream, {
          mimeType: "audio/webm;codecs=opus",
        });

        //Remove the previous event listener
        socket.off("real-time-transcription");
        // Listen for transcription events
        socket.on("real-time-transcription", (data) => {
          if (data.isFinal) {
            setTranscript(data.text);
          }
        });

        //Remove the previous event listener
        socket.off("transcription-error");
        // Listen for transcription error events
        socket.on("transcription-error", (error) => {
          // Stop emitting audio data if an error occurs
          if (audioRecorderRef.current?.state === "recording") {
            audioRecorderRef.current.stop();
          }

          console.error("Transcription error:", error);
          setErrorWhileTranscribing(true);
          setIsResponseIndicatorVisible(true);
          setIsRecording(false);
          setIsPaused(true);
          setIsUploading(false);
          clearTranscript();
        });

        // Listen for audio data events
        audioRecorderRef.current.ondataavailable = async (event) => {
          if (
            event.data.size > 0 &&
            socket?.connected &&
            audioRecorderRef.current?.state === "recording" &&
            !errorWhileTranscribing
          ) {
            // Convert the audio chunk to a buffer
            const buffer = await event.data.arrayBuffer();
            // Emit the audio stream to the server
            socket.emit("audio-stream", buffer);
          }
        };

        // Listen for video data events
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        //Emit the audio every 100ms
        audioRecorderRef.current.start(100);
      }
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // Reusable function to stop recording
  const stopRecording = async () => {
    try {
      // Reset timer
      setTimer({ minutes: 0, seconds: 0 });
      // Set uploading state to true
      setIsUploading(true);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        // Stop audio recording
        audioRecorderRef.current?.stop();

        // Flush any remaining audio chunks
        audioRecorderRef.current.onstop = () => {
          if (socket?.connected) {
            socket.emit("stop-transcription"); // Notify the backend to finalize transcription
          }
        };

        //Finalize the transcription when the recording stops
        socket.once("final-transcription", (data) => {
          if (data?.isFinal) {
            setTranscript(data.text);
          }
        });

        // Wait for "transcription-complete" signal from backend
        await new Promise((resolve) => {
          socket.off("transcription-complete");
          socket.once("transcription-complete", (data) => {
            if (data?.message) {
              socket.off("transcription-complete"); // Cleanup listener to avoid memory leaks
              resolve(); // Proceed to the next step
            }
          });
        });

        // Stop video recording and save the video
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.onstop = () => {
          const videoBlob = new Blob(recordedChunksRef.current, {
            type: "video/webm",
          });
          const videoUrl = URL.createObjectURL(videoBlob);
          setRecordedVideos((prevVideos) => [...prevVideos, videoUrl]);
        };

        if (isIntro) {
          await aiFinalGreeting();
        } else {
          /* Interview simulation here if not intro */
          await handleInterviewAnswer();
        }
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const improveTranscription = async () => {
    try {
      const payload = {
        transcript: transcriptRef.current,
      };
      const response = await axios.post(
        `${API}/api/interview/improve-transcription`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`, // JWT token
          },
        }
      );
      const improvedTranscription = response.data.improvedTranscription;
      setFinalTransciption(improvedTranscription);
    } catch (error) {
      console.error("Error improving transcription: ", error);
    }
  };

  const handleInterviewAnswer = async () => {
    //Upload the transcription data for improvement
    await improveTranscription();
    // this function return true when transcription is uploaded successfully and false when it fails
    const isSuccess = await uploadTranscription();

    // Check if transcription upload was successful and exit if not
    if (!isSuccess) {
      return;
    }

    // Check if we're at the last question
    if (questionIndex === 4 && !isUploading) {
      const outroMessage = `Thanks ${name}, and I hope you enjoyed your interview with us.`;
      //Display the outro message
      setCurrentGreetingText(outroMessage);
      //Speak the outro greeting
      await speak(outroMessage, selectedInterviewer.current);
      // Create feedback
      await createFeedback();
    } else {
      //Set the next question
      setQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  //Fcuntion to create feedback
  const createFeedback = async () => {
    // Set generating feedback state to true
    setIsGeneratingFeedback(true);
    setFeedbackError(false);

    socket.emit("generateFeedback", { interviewId });

    socket.off("feedbackGenerated");

    socket.on("feedbackGenerated", async (data) => {
      if (data?.feedback) {
        await getAnalytics();
        removeBasicInterviewTypeAndSelectedQuestions();
        setIsGeneratingFeedback(false);
        setShowPreviewPopup(true);
        setInterviewId("");
      }
    });

    socket.once("error", (error) => {
      if (error?.message) {
        console.error("Error generating feedback: ", error);
        setFeedbackError(true);
      }
    });
  };

  // Timer Effect
  useEffect(() => {
    let interval;
    let elapsedSeconds = 0;

    if (isRecording && !isPaused) {
      interval = setInterval(async () => {
        elapsedSeconds += 1;

        // Calculate minutes and seconds
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;

        setTimer({ minutes, seconds });

        // Check if 3 minutes have elapsed and stop recording
        if (elapsedSeconds === 179) {
          //Add a slight delay before stopping the recording
          setTimeout(async () => {
            await stopRecording();
            clearInterval(interval);
          }, 1000);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Handle intro finish and fetch questions to display on the UI
  const handleIntroFinish = async () => {
    await fetchQuestions();
  };

  // Close  await fetchQuestions();
  const handleClose = () => {
    navigate("/maindashboard"); // Navigate back to dashboard instead of closing modal
  };

  // Confirm close handler
  const handleConfirmClose = async () => {
    setShowConfirm(false);
    // Ensure recording is stopped before closing
    await stopRecording();
    // Navigate back to dashboard
    navigate("/maindashboard");
    window.location.reload(); // Reload the page
  };

  const uploadTranscription = async () => {
    try {
      setIsRecording(false);
      setIsPaused(true);

      const question = questions[questionIndex];

      // Create a payload object to send the transcription data
      const payload = {
        interviewId,
        transcript: transcriptRef.current,
        question,
      };

      // Check if there is video data to upload
      if (!interviewId) {
        throw new Error("No transcription data to upload");
      }

      if (!transcriptRef.current) {
        throw new Error("No transcription data to upload");
      }

      if (!question) {
        throw new Error("No transcription data to upload");
      }

      if (basicInterviewType === "Selective Questioning") {
        const response = await axios.post(
          `${API}/api/interview/mock-interview`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`, // JWT token
            },
          }
        );
      } else {
        // Make a POST request to the server to upload the video
        const response = await axios.post(
          `${API}/api/interview/basic-interview`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`, // JWT token
            },
          }
        );

        // Extract the generated question from the response
        const generatedQuestion = response.data.question;

        if (questionIndex + 1 <= 4) {
          // Set the current greeting text to the generated question
          setQuestions((prevItem) => [...prevItem, generatedQuestion]);
        }
      }

      clearTranscript();
      return true;
    } catch (error) {
      console.error("Error uploading transcription: ", error);
      if (error.message === "No transcription data to upload") {
        // Set transcription error state to pop up the error modal
        setTranscriptionError(true);
        //Reset the transcript text
        clearTranscript();
      } else {
        setUploadingError(true);
      }
      setIsResponseIndicatorVisible(true);
      return false;
    } finally {
      // Clear the recorded chunks after uploading
      recordedChunksRef.current = [];
      audioRecorderRef.current = [];
      // Set uploading state to false
      setIsUploading(false);
    }
  };

  //Countdown effect
  useEffect(() => {
    if (isCountdownActive && countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }

    if (countdown === 0 && isCountdownActive) {
      clearInterval(countdownRef.current); // Stop countdown
      setIsCountdownActive(false);
      setQuestionIndex(0);
    }

    return () => clearInterval(countdownRef.current);
  }, [isCountdownActive, countdown]);

  /* Function below is unique on every recording component*/

  // Fetch questions from the backend
  const fetchQuestions = async () => {
    try {
      // Set the intro state to true
      setIsIntroShown(true);
      setIsCountdownActive(false);
      setQuestionError(false);

      // Create a FormData object to send the interview type and category
      const formData = new FormData();
      formData.append("type", interviewType);
      formData.append("category", category);
      formData.append("basicInterviewType", basicInterviewType);

      const response = await axios.post(
        `${API}/api/interview/generate-questions`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      // Check if questions are returned
      if (response?.data?.questions && response?.data?.questions.length > 0) {
        setQuestions(response.data.questions);
        setIsCountdownActive(true);
        setInterviewId(response.data.interviewId);
      } else {
        setQuestions(selectedQuestions);
        setIsCountdownActive(true);
        setInterviewId(response.data.interviewId);
      }
    } catch (error) {
      setQuestionError(true);
    }
  };

  //Function to initialize Intro.js
  const startGuide = () => {
    // Check if the intro has already been shown
    const isIntroShown = JSON.parse(sessionStorage.getItem("isIntroShown"));

    //Check if the intro has already been shown
    if (!isIntroShown.basic) {
      popupGuide();
      // Update the behavioral field
      const updatedIntroShown = {
        ...isIntroShown,
        basic: true,
      };

      // Save and override the prevous value with the updated object back to sessionStorage
      sessionStorage.setItem("isIntroShown", JSON.stringify(updatedIntroShown));
    }
  };

  // Add handler for interviewer selection
  const handleInterviewerSelect = (interviewer) => {
    setSelectedInterviewer(interviewer);
    setInterviewerGreetingText(firstGreeting(interviewer));
    setShowInterviewerSelect(false);
    // Start camera access after interviewer is selected
    enableCameraFeed();
  };

  const [showPreviewPopup, setShowPreviewPopup] = useState(false);
  const [proceed, setProceed] = useState(false);
  const [showTips, setShowTips] = useState(true); // State to control the visibility of tips

  const handlePreview = async () => {
    setShowPreviewPopup(false);
    setProceed(true);
    setShowSuccessPopup(false); // Ensure success popup does not show after preview
    setShowTips(false); // Hide tips container
  };

  const handleCancelPreview = async () => {
    setShowPreviewPopup(false);
    setShowSuccessPopup(true);
  };


  const handleViewResults = () => {
    const interviewHistory = JSON.parse(localStorage.getItem("analytics")) || [];
    const latestInterview = interviewHistory[interviewHistory.length - 1];
    if (latestInterview) {
      getAnalytics();
      navigate(`/result/${latestInterview._id}`);
    } else {
      console.error("No interview found to view results.");
    }
  };

  return (
    <>
      <Header />
      {/* Add InterviewerOption modal at the top level */}

      {!selectedInterviewer.current ? (
        <InterviewerOption
          show={showInterviewerSelect}
          onHide={() => setShowInterviewerSelect(false)}
          onSelectInterviewer={handleInterviewerSelect}
        />
      ) : (
        <div
          fluid
          className="video-recording-page align-items-center justify-content-center"
        >
          <div className="video-recording-content">
            <Row className="video-recording-row">
              <Col
                md={7}
                className="d-flex flex-column align-items-center h-100"
              >
                <div
                  id="videoArea"
                  className="video-area video-area position-relative d-flex align-items-center "
                >
                  {proceed ? (
                    <InterviewPreview videoSrc={recordedVideos} />
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="video-feed"
                      ></video>
                      {/* Mute indicator in top left */}
                      <div
                        id="mute-indicator"
                        className="mute-indicator position-absolute top-0 start-0 m-2"
                      >
                        {isMuted ? (
                          <div className="d-flex align-items-center gap-2">
                            <FaMicrophoneSlash />
                          </div>
                        ) : (
                          <div className="d-flex align-items-center gap-2">
                            <FaMicrophone />
                          </div>
                        )}
                      </div>
                      <p
                        id="timer"
                        className="timer position-absolute top-0 end-0 m-2"
                      >
                        {`${String(timer.minutes).padStart(2, "0")}:${String(
                          timer.seconds
                        ).padStart(2, "0")} / 3:00`}{" "}
                        {/* Change from 2:00 to 3:00 */}
                      </p>
                      <div className="d-flex align-items-center gap-3 interview-tools">
                        <Button
                          id="cameraButton"
                          className="btn-videorecord"
                          onClick={toggleCamera}
                          variant={isCameraOn ? "success" : "secondary"}
                        >
                          {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
                        </Button>
                        {/* Start and Stop record button */}
                        {isIntro ? (
                          <>
                            <Button
                              id="startButton"
                              className="position-relative pause-indicator"
                              onClick={
                                isRecording ? stopRecording : startRecording
                              }
                              disabled={
                                isUploading ||
                                isTranscriptionSpeaking ||
                                isQuestionTranscribing
                              }
                            >
                              {isUploading ? (
                                <Spinner className="pause-indicator-spinner"></Spinner>
                              ) : isRecording ? (
                                <FaPause size={30} />
                              ) : (
                                <FaPlay size={30} />
                              )}
                            </Button>
                            {isResponseIndicatorVisible && (
                              <div className="response-indicator">
                                Click here to respond
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <Button
                              id="startButton"
                              className="position-relative pause-indicator"
                              onClick={
                                isRecording ? stopRecording : startRecording
                              }
                              disabled={
                                !questions.length ||
                                isUploading ||
                                isTranscriptionSpeaking ||
                                isQuestionTranscribing
                              }
                            >
                              {isUploading ? (
                                <Spinner className="pause-indicator-spinner"></Spinner>
                              ) : isRecording ? (
                                <FaPause size={30} />
                              ) : (
                                <FaPlay size={30} />
                              )}
                            </Button>
                            {isResponseIndicatorVisible && (
                              <div className="response-indicator">
                                Click here to respond
                              </div>
                            )}
                          </>
                        )}
                        <Button
                          id="muteButton"
                          className="btn-mute"
                          onClick={toggleMute}
                        >
                          {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                        </Button>
                      </div>

                      {/* Countdown Overlay */}
                      {isCountdownActive && countdown > 0 && (
                        <div className="countdown-overlay">
                          <h6>Interview will Start in</h6>
                          <h2>{countdown}</h2>
                        </div>
                      )}
                      {/* Overlay for reattempting access to camera */}
                      {isReattemptingCamera && (
                        <div className="camera-retry-overlay">
                          {/* <Spinner animation="border" role="status" /> */}
                          <img
                            className="loadinganimation"
                            animation="border"
                            role="status"
                            src={loading}
                            alt="loading..."
                          />
                          <p>Reattempting access to camera...</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Col>
              {!proceed ? (
                <Col
                  md={5}
                  className="d-flex flex-column align-items-center gap-1"
                >
                  <div className="speech-subtitle-container">
                    {transcriptRef.current ? (
                      <p className="speech-subtitle-overlay">
                        {transcriptRef.current}
                      </p>
                    ) : (
                      <div className="speech-default-subtitle">
                        {/* <p>
                          REAL-TIME TRANSCRIPTION HERE 

                          </p> */}
                      </div>
                    )}
                  </div>
                  <div className="interview-question-container">
                    {currentGreetingText ? (
                      <p>{currentGreetingText}</p>
                    ) : isIntroShown ? (
                      <>
                        {countdown > 0 ? (
                          <i>
                            Hold tight! We’re preparing the perfect questions
                            for you...
                          </i>
                        ) : (
                          <>
                            <h4>Question:</h4>
                            <p className="question-text">
                              {questions[questionIndex]}
                            </p>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="interview-content">
                          <h4>Welcome to the Interview!</h4>
                          <p>
                            We will start when you are ready. Please be
                            prepared.
                          </p>
                        </div>
                        <div className="container-startinterview d-flex justify-content-around align-items-center flex-column w-100">
                          <Button
                            id="startInterviewButton"
                            className="btn-startinterview d-flex align-items-center"
                            variant="link"
                            disabled={isReattemptingCamera}
                            onClick={handleIntroFinish}
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 19 25"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3.76003e-06 1.25075L2.77649e-06 23.7514C0.000727559 23.9792 0.0645093 24.2025 0.184478 24.3973C0.304446 24.592 0.476062 24.7508 0.68085 24.8567C0.88564 24.9625 1.11585 25.0113 1.3467 24.9978C1.57754 24.9843 1.80029 24.9091 1.99095 24.7802L18.487 13.5299C19.171 13.0636 19.171 11.9411 18.487 11.4735L1.99096 0.223223C1.80069 0.0930001 1.57783 0.0166346 1.3466 0.00242295C1.11537 -0.0117887 0.884603 0.0366973 0.67938 0.142613C0.474157 0.248528 0.302322 0.407823 0.182547 0.603189C0.0627727 0.798555 -0.000360534 1.02252 3.76003e-06 1.25075ZM15.5355 12.5011L2.53786 21.3663L2.53786 3.63582L15.5355 12.5011Z"
                                fill="white"
                              />
                            </svg>
                            <p>Start Interview</p>
                          </Button>
                          <i>Click here to Generate Interview Questions</i>
                        </div>
                      </>
                    )}
                  </div>
                </Col>
              ) : (
                <Col
                  md={5}
                  className="d-flex flex-column align-items-center justify-content-end position-relative"
                >
                  <div className="interview-preview-avatar"></div>
                  <div className="orange-box-avatar-sitting"></div>

                  <div className="interview-question-container1">
                    <div className="outro-text-container">
                      <h4>Thank you for proceeding!</h4>
                      <p>Your interview is now in progress. Best of luck!</p>
                    </div>
                    <div className="d-flex justify-content-center align-items-center view-result-container">
                      <Button
                        className="btn-viewresult"
                        onClick={handleViewResults}
                      >
                        View your result
                      </Button>
                    </div>
                  </div>
                </Col>
              )}
            </Row>
            <Row className="d-flex justify-content-center tips-row">
              <Col md={7}>
                {/* Tips container moved below video */}
                {showTips && (
                  <div
                    id="tipsContainer"
                    className="tips-container d-flex mt-3 gap-2"
                  >
                    <div className="tips">
                      <p className="tips-header">Tips:</p>
                      <p className="tips-content">{tips[currentTipIndex]}</p>
                    </div>
                    <img
                      className="tips-avatar"
                      src={tipsAvatar}
                      alt="Tips Avatar"
                    />
                  </div>
                )}
              </Col>
              <Col md={5}></Col>
            </Row>

            {questionError && (
              <ErrorGenerateQuestion
                onRetry={async () => {
                  await fetchQuestions();
                }}
              />
            )}

            {uploadingError && (
              <ErrorUploadAnswer
                onRetry={async () => {
                  setUploadingError(false);
                  setIsUploading(true);
                  await handleInterviewAnswer();
                }}
              />
            )}
            {feedbackError ? (
              <ErrorGenerateFeedback
                onRetry={() => {
                  createFeedback();
                }}
              />
            ) : (
              <div
                show={true}
                onHide={handleClose}
                centered
                dialogClassName="custom-video-record-modal-width"
                backdrop={false}
              ></div>
            )}
            {cameraError ? (
              <ErrorAccessCam
                onClose={() => setCameraError(false)}
                onRetry={() => {
                  // setCameraError(false);
                  enableCameraFeed();
                }}
              />
            ) : (
              <div
                show={true}
                onHide={handleClose}
                centered
                dialogClassName="custom-video-record-modal-width"
                backdrop={false}
              ></div>
            )}
            {showConfirm && (
              <CancelInterviewAlert
                show={showConfirm} // Control visibility with show prop
                onHide={() => setShowConfirm(false)} // Close the modal when needed
                onConfirm={handleConfirmClose}
                onClose={() => setShowConfirm(false)}
                message="Are you sure you want to cancel the interview?"
              />
            )}
            {transcriptionError && (
              <ErrorTranscription
                onRetry={() => {
                  setTranscriptionError(false);
                }}
              />
            )}

            {generateFinalGreetingError && (
              <ErrorGenerateFinalGreeting
                onRetry={async () => {
                  setGenerateFinalGreetingError(false);
                  setIsUploading(true);
                  await aiFinalGreeting();
                }}
              />
            )}

            {errorWhileTranscribing && (
              <ErrorWhileTranscription
                onRetry={() => {
                  setErrorWhileTranscribing(false);
                }}
              />
            )}

            {isGeneratingFeedback && <LoadingScreen />}

            {showPreviewPopup ? (
              <InterviewPreviewOptionPopup
                show={showPreviewPopup}
                onHide={handleCancelPreview}
                onPreview={handlePreview}
              />
            ) : (
              showSuccessPopup && !proceed && <InterviewSuccessfulPopup />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BasicVideoRecording;
