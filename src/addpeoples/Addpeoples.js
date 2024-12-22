import React, { useState } from "react";
import axios from "axios";
import { usePeopleContext } from "../context/PeopleContext";
import "./add.css";

const Addpeoples = () => {
  const { connectedPeople, setConnectedPeople } = usePeopleContext();
  const [isVisible, setIsVisible] = useState(false);
  const [contact, setContact] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    setFeedbackMessage("");
    setContact("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get email from localStorage
    const email = localStorage.getItem("email");
    if (!email) {
      setFeedbackMessage("No email found for the current user.");
      return;
    }

    // Check for duplicate contacts
    if (connectedPeople.some((person) => person.contact === contact)) {
      setFeedbackMessage("This person is already connected.");
      return;
    }

    setLoading(true);
    setFeedbackMessage("Connecting people...");

    try {
      // Get person data from the backend
      const response = await axios.get(
        `http://localhost:9010/auth/addpeoples`,
        { params: { contact } }
      );

      const newPerson = response.data;

      // Set image if available, else default avatar
      setImage(newPerson.image);

      // Add new person to the connected people list
      setConnectedPeople((prevPeople) => [...prevPeople, newPerson]);

      // Include email in the object sent to savepeoples API
      const personWithEmail = {
        ...newPerson,
        email,
      };

      // Save new person with email to the backend
      await axios.post(
        `http://localhost:9010/naming/savepeoples`,
        personWithEmail
      );

      setFeedbackMessage("Connected! Now you can chat with each other.");
    } catch (error) {
      console.error("There was an error submitting the request:", error);
      setFeedbackMessage("There was an error connecting the person.");
    } finally {
      setLoading(false);
      setContact(""); // Reset contact field after request
    }
  };

  return (
    <div className="req">
      {isVisible && (
        <div className="popup-overlay" onClick={toggleVisibility}></div>
      )}
      <div className="requestOrder-btn" onClick={toggleVisibility}>
        <p>Add contacts</p>
      </div>

      <div className={`requestOrder-messageBox ${isVisible ? "show" : ""}`}>
        <div className="requestOrder-messageHeader">
          <h2>Connect Family Relatives and Friends!</h2>
          <button className="requestOrder-closeBtn" onClick={toggleVisibility}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="requestOrder-form">
          <div className="requestOrder-formFields">
            <input
              type="tel"
              className="requestOrder-input"
              placeholder="Contact Number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
            <img
              src={`data:image/png;base64,${image}`}
              alt="Profile"
              className="select-image"
              
            />
            <button
              className="requestOrder-submitBtn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Connecting..." : "Submit Order"}
            </button>
            {feedbackMessage && (
              <h4 className="requestOrder-feedbackAlert">{feedbackMessage}</h4>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Addpeoples;
