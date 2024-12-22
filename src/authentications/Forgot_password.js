import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Forgot_password = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // To display success or info messages
  const [error, setError] = useState(""); // To display error messages

  const navigate = useNavigate();
  const handleSendEmail = async (e) => {
    e.preventDefault();

    setMessage("please wait we are sending your email..!");

    try {
      const response = await axios.post(
        "http://localhost:9010/auth/forgot-password",
        null, // No request body, only query parameters
        {
          params: { email },
        }
      );

      // Set a success message if email is found
      setMessage(response.data);
      setError(""); // Clear any previous error

      // Store email in local storage
      localStorage.setItem("forgotPasswordEmail", email);

      // Navigate to the OTP verification page after sending the email
      navigate("/verify-otp"); // Make sure this path matches your routing setup
    } catch (error) {
      if (error.response) {
        // If email not found, display the specific error message from backend
        setError(error.response.data);
      } else {
        setError("Error sending email. Please try again.");
      }
      setMessage(""); // Clear any previous success message
    }
  };

  return (
    <div className="login-page">
      <div className="form">
        <form className={`login-form`} onSubmit={handleSendEmail}>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="submit-button">
            Send
          </button>
        </form>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Forgot_password;
