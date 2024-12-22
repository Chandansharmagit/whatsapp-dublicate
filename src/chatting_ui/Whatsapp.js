// Navbar.js
import React from "react";
import {
  FaComments,
  FaPhone,
  FaVideo,
  FaUserFriends,
  FaCog,
} from "react-icons/fa";
import "./Navbar.css"; // Make sure to create a CSS file for styling

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="navbar-item">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-people-fill"
          viewBox="0 0 16 16"
        >
          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
        </svg>
      </div>
      <div className="navbar-item">
        <span>Chats</span>
      </div>

      <div className="navbar-item">
        <span>status</span>
      </div>
      <div className="navbar-item">
        <span>Contacts</span>
      </div>
    </div>
  );
};

export default Navbar;
