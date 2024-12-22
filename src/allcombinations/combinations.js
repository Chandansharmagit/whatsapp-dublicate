import React, { useEffect } from "react";
import Navbar from "../chatting_ui/Whatsapp";
import Headers from "../headers/headers";
import WhatsAppApp from "../chatting_ui/SidebarChat";
import './combination.css';
const Combinations = () => {
  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (!userToken) {
      window.location.href = "/";
    }
  }, []); // Added missing comma

  return (
    <div className="margin">
      <Headers />
      {/* <Navbar /> */}
      <WhatsAppApp />
    </div>
  );
};

export default Combinations;
