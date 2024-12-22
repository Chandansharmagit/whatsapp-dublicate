import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(""); // Initialize email
  const [message, setMessage] = useState(""); // To display success or info messages
  const [error, setError] = useState(""); // To display error messages

  // Use navigate as a function
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the email from local storage
    const storedEmail = localStorage.getItem("forgotPasswordEmail");
    if (storedEmail) {
      setEmail(storedEmail); // Set the email state
    }
  }, []);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:9010/auth/verify-otp",
        null, // No request body, only query parameters
        {
          params: { email, otp },
        }
      );

      // Set success message if OTP is valid
      setMessage(response.data);
      setError(""); // Clear any previous error

      // Navigate to the change password page after verifying OTP
      navigate("/change-password"); // Ensure this path matches your routing setup
    } catch (error) {
      if (error.response) {
        // Display the specific error message from backend
        setError(error.response.data);
      } else {
        setError("Error verifying OTP. Please try again.");
      }
      setMessage(""); // Clear any previous success message
    }
  };

  return (
    <div className="login-page">
      <div className="form">
        <form className="login-form" onSubmit={handleVerifyOtp}>
          <input
            type="text"
            placeholder="One Time Password"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button type="submit" className="submit-button">
            Verify OTP
          </button>
        </form>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default VerifyOtp;
