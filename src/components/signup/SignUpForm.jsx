import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { Button } from "react-bootstrap";
import logo from "../../assets/logo.png";
import RegistrationSuccessPopUp from "./RegistrationSuccessPopUp"; // Import the success pop-up component
import { useSignup } from "../../hook/useSignup";

function SignUpForm() {
  const [showSuccessPopUp, setShowSuccessPopUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isBoxChecked, setIsBoxChecked] = useState(false);
  const { signup, isLoading, error } = useSignup();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Call the signup function from useSignup hook
    const isSignin = await signup(name, email, password);

    // Show success pop-up
    if (isSignin) {
      setShowSuccessPopUp(true);
    }
  };

  const handleClosePopUp = () => {
    setShowSuccessPopUp(false);
  };

  const handleCheckboxChange = (e) => {
    setIsBoxChecked(e.target.checked);
  };

  return (
    <div className="signup-info-container">
      <div className="info-create-acc-container">
        <img src={logo} alt="Company Logo" className="logo" />
        <h4>HR-HATCH</h4>
        <p>
        Our company offers comprehensive recruitment and talent support for both job seekers and employers. It includes English mock interview platform which helps candidates build confidence and improve their interviewing skills. Our resume builder tailors resumes to specific job requirements. For employers, our job posting services attracts top flexible candidates and, full-cycle Recruitment Process Outsourcing (RPO) solutions. We are dedicated to streamlining the hiring process, ensuring the right talent connects with the right roles.
        </p>
        <p className="text-center already-have-acc">
          Already have an account? <br />
          <small>Log in to access your dashboard.</small>
        </p>
        <Button
          href="/login"
          className="btn-login1 d-flex align-items-center justify-content-center"
        >
          Login
        </Button>
      </div>
      <div className="singup-container">
        <div className="singup-header text-center">
          <h2>Create An Account</h2>
        </div>
        <div className="account-details">
          <h3>Personal Information</h3>
          <p>
            Please provide your details to create your account. All fields
            marked with an asterisk (*) are required.
          </p>

          <form className="singup-form" onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <FaUser />
              </span>

              <input
                type="text"
                className="form-control"
                placeholder="Name"
                required
                onChange={(e) => {
                  setName(e.target.value);
                }}
                value={name}
              />
            </div>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <FaEnvelope />
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                required
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                value={email}
              />
            </div>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <FaLock />
              </span>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                required
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                value={password}
              />
            </div>
            <div className="note d-flex">
              Choose a strong password (at least 8 characters, including letters
              and numbers)
            </div>
            <div className="privacy form-check">
              <div className="checkbox-container d-flex align-items-center">
                <input
                  type="checkbox"
                  checked={isBoxChecked}
                  onChange={handleCheckboxChange}
                />
              </div>
              <div className="privacy-content r">
                <p>Privacy Agreement</p>
                <p>
                  By registering, you agree to our Privacy Policy and Terms of
                  Service. We value your privacy. Your information will not be
                  shared with third parties.
                </p>
              </div>
            </div>
            <button
              type="submit"
              className="singup-button"
              disabled={!isBoxChecked || isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>
      </div>

      {showSuccessPopUp && (
        <RegistrationSuccessPopUp onClose={handleClosePopUp} />
      )}
    </div>
  );
}

export default SignUpForm;
