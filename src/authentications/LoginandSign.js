import React, { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    resetFields();
  };

  const resetFields = () => {
    setName("");
    setContact("");
    setEmail("");
    setPassword("");
  };

  const forgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:9010/auth/signing?email=${encodeURIComponent(
          email
        )}&password=${encodeURIComponent(password)}`
      );

      if (response.status === 200 && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("sender_contact", response.data.contact); // Store sender_contact from API response
        localStorage.setItem("email", email); // Store email in localStorage
        localStorage.setItem("sender_name",response.data.sender_name)
        console.log("Logged in contact: " + response.data.contact); // Confirm sender_contact is stored
        console.log("sendername" + response.data.sender_name)
        console.log("email",response.data.email)
        navigate("/all"); // Navigate to the chat page after login
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("contact", contact);
      formData.append("email", email);
      formData.append("password", password);

      const response = await axios.post(
        "http://localhost:9010/auth/savinguser",
        formData
      );


      
      // Handle successful sign-up
      alert(response.data.message);
      setIsLogin(true); // Switch to login form
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleError = (error) => {
    if (error.response) {
      alert(error.response.data.message); // Show error message from the server
    } else {
      alert("An error occurred. Please try again."); // Generic error message
    }
  };

  return (
    <div className="login-page">
      <div className="form">
        {isLogin ? (
          <form
            className={`login-form ${isLogin ? "show" : ""}`}
            onSubmit={handleLogin}
          >
            <input
              type="text"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="message">
              Forgot password?{" "}
              <span className="toggle-link" onClick={forgotPassword}>
                Click here
              </span>{" "}
              |
              <span className="toggle-link" onClick={toggleForm}>
                {" "}
                Create an account
              </span>
            </p>
          </form>
        ) : (
          <form
            className={`register-form ${!isLogin ? "show" : ""}`}
            onSubmit={handleSignUp}
          >
            <input
              type="text"
              placeholder="Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Contact"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
            <p className="message">
              Already registered?{" "}
              <span className="toggle-link" onClick={toggleForm}>
                Sign In
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
