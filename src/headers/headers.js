import React, { useState } from "react";
import "./header.css";

const Headers = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <div className="header-container">
      <div className="title-left">
        
  
      
      </div>
    </div>
  );
};

export default Headers;
