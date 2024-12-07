import React, { useState } from "react";
import {
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaFacebook,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useLogin } from "../../hook/useLogin";
import { useNavigate } from "react-router-dom";
import LoginAvatar from "../../assets/login-img.png";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, isLoading, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isLogin = await login(email, password);
    if (isLogin) {
      navigate("/maindashboard");
    }
  };

  return (
    <div className="row main-login justify-content-center">
      <Col md={5}  className=" d-flex align-items-center justify-content-center ">
        <img className="login-avatar" src={LoginAvatar} alt="" />
      </Col>
      <Col md={7}  className="d-flex align-items-center justify-content-center main-login-form">
        <div className="login-container">
          <div className="login-header text-center">
            <h2>LOG IN</h2>
            <p>Welcome back, let’s dive in!</p>
          </div>
          <div className="account-details">
            <h3>Account Details</h3>
            <p>Please enter your credentials to access your account.</p>
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <FaEnvelope />
                </span>
                <div>
                  <input
                    type="email"
                    className={`form-control ${error ? "is-invalid" : ""}`}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                  />
                </div>
              </div>
              <div className="input-group mb-3 position-relative">
                <span className="input-group-text">
                  <FaLock />
                </span>
                <div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control ${error ? "is-invalid" : ""}`}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="position-absolute end-0 top-50 translate-middle-y me-3 toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      cursor: "pointer",
                      zIndex: 10,
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>

                  {error && <div className="invalid-feedback">{error}</div>}
                </div>
              </div>
              <div className="forgot-remember-container d-flex">
                <div className="remember-me form-check">
                  <div className="remember-box">
                    <input type="checkbox" className="form-check-input" />
                    <b className=" form-check-label">Remember me</b>
                    {/* <div className="remeber-box-check d-flex align-items-center">
                      <input type="checkbox" className="form-check-input" />
                      <i className="form-text ">
                        Keep me logged in on this device.
                      </i>
                    </div> */}
                  </div>
                </div>
                <div className="forgot d-flex">
                  Forgot your password?
                  <a href="/forgot" className="forgot-password">
                    {" "}
                    Click here to reset
                  </a>
                </div>
                
              </div>
              

              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                Login
              </button>
            </form>
          </div>

          <div className="signup-container text-center">
            <p>Or sign up using</p>
            <div className="social-icons">
              <FaGoogle className="social-icon" />
              <FaFacebook className="social-icon" />
            </div>
            <button
              className="guest-button"
              // onClick={() => (window.location.href = "/")} // not implemented yet
            >
              Continue as Guest
            </button>

            <p>Don't have an account?</p>
 
            <button
              className="signup-button"
              onClick={() => (window.location.href = "/signup")}
            >
              Sign up
            </button>
          </div>
        </div>
      </Col>
    </div>
  );
};

export default LoginForm;
