import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./authentications/LoginandSign";
import Forgot_password from "./authentications/Forgot_password";
import VerifyOtp from "./authentications/VerifyOtp";
import Changepassword from "./authentications/Changepassword";
import Whatsapp from "./chatting_ui/Whatsapp";
import WhatsAppApp from "./chatting_ui/SidebarChat";
import { PeopleProvider } from "./context/PeopleContext";
import Combinations from "./allcombinations/combinations";
import Addpeoples from "./addpeoples/Addpeoples";
import UpdateUserForm from "./updatingForm/UpdateUserForm";
import VideoCall from "./chatting_ui/videocalling/Videcalling";

function App() {
  return (
    <>
      <PeopleProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />}></Route>
            <Route path="/updateuserform" element={<UpdateUserForm />}></Route>
            <Route path="/all" element={<Combinations />}></Route>
            <Route path="/whats" element={<WhatsAppApp />}></Route>
            <Route path="/video_calling" element={<VideoCall />}></Route>

            <Route
              path="/forgot-password"
              element={<Forgot_password />}
            ></Route>
            <Route path="/verify-otp" element={<VerifyOtp />}></Route>
            <Route path="/change-password" element={<Changepassword />}></Route>
            <Route path="/chat" element={<Whatsapp />}></Route>
          </Routes>

          <Addpeoples />
        </BrowserRouter>
      </PeopleProvider>
    </>
  );
}

export default App;
