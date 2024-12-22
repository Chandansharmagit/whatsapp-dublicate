import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isMatch, setIsMatch] = useState(true);
  const [strength, setStrength] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Initialize useNavigate

  const checkPasswordStrength = (password) => {
    const lengthCriteria = password.length >= 8;
    const numberCriteria = /\d/.test(password);
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (lengthCriteria && numberCriteria && specialCharCriteria) {
      return 'password Strong';
    } else if (lengthCriteria) {
      return 'password Medium';
    }
    return 'password Weak';
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setStrength(checkPasswordStrength(newPassword));
    setIsMatch(newPassword === confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setIsMatch(password === newConfirmPassword);
  };

  const handleSubmit = async () => {
    if (!isMatch) {
      alert("Passwords do not match.");
      return;
    }

    const email = localStorage.getItem('forgotPasswordEmail'); // Retrieve the email from local storage
    if (!email) {
      alert("No email found in local storage.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:9010/auth/updating-password", null, {
        params: { email, newpassword: password }
      });
      
      setMessage(response.data); // Set success message
      setError('');
      navigate("/"); // Redirect to home page upon success
    } catch (err) {
      if (err.response) {
        setError(err.response.data); // Set error message from response
      } else {
        setError("Error changing password. Please try again.");
      }
      setMessage(''); // Clear success message
    }
  };

  return (
    <div>
      <div className="login-page">
        <div className="form">
          <form className={`login-form`} onSubmit={(e) => e.preventDefault()}>
            <input 
              type="password" 
              placeholder="Enter new password" 
              required 
              value={password} 
              onChange={handlePasswordChange} 
            />
            <input 
              type="password" 
              placeholder="Confirm new password" 
              required 
              value={confirmPassword} 
              onChange={handleConfirmPasswordChange} 
            />
            <button
              type="button"
              className="submit-button"
              onClick={handleSubmit}
            >
              Change Password
            </button>
            <div style={{ color: strength === 'Weak' ? 'red' : strength === 'Medium' ? 'orange' : 'green' }}>
              {strength}
            </div>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
