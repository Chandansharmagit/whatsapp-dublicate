import React, { useEffect, useState, useRef } from "react";
import "./massageContainer.css";

import axios from "axios";
import SockJS from "sockjs-client"; // Import SockJS if not imported already
import Stomp from "stompjs"; // Import stompjs
import { usePeopleContext } from "../context/PeopleContext";
import sendbutton from "./unnamed.png";
import { useNavigate } from "react-router-dom"; // Import useNavigate
function WhatsAppApp() {
  const { connectedPeople, setConnectedPeople } = usePeopleContext();
  const [username, setUsername] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [image, setImage] = useState("");
  const [contact, setContact] = useState("");
  const [messages, setMessages] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [receiverContact, setReceiverContact] = useState(""); // State for receiver contact
  const [sending, setSending] = useState(false); // State to track if a message is being sent
  const [sentMessages, setSentMessages] = useState([]); // State for sent messages
  const [receivedMessages, setReceivedMessages] = useState([]); // State for received messages
  const [lastMessage, setLastMessage] = useState(null);
  const stompClient = useRef(null);

  const navigate = useNavigate(); // Initialize useNavigate

  const handleUserClicks = (user) => {
    setSelectedUser(user); // Set the selected user

    // Redirect to another page with the selected user contact
    navigate("/video_calling", { state: { receiverContact: user.contact } });
  };

  //getting the main_admin contact
  const admin_contact = localStorage.getItem("sender_contact");
  console.log("sender_contact", admin_contact);

  // Fetch user profile details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:9010/auth/profile/details`,
          { params: { token } }
        );

        if (response.status === 200) {
          setUsername(response.data.name);
          setImage(response.data.image);
          setContact(response.data.contact);
        }
      } catch (error) {
        console.error("Error fetching profile details:", error);
      }
    };

    fetchProfile();
  }, []);

  // Handle user selection and connect to the correct chat topic
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setMessages([]); // Clear messages when switching users
    connectToUserTopic(user.contact);
  };

  // Connect to a specific user's WebSocket topic

  const connectToUserTopic = (contactNumber) => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.disconnect(() => {
        console.log("Disconnected from previous WebSocket");
      });
    }

    const socket = new SockJS("http://localhost:9091/chat-websocket");
    stompClient.current = Stomp.over(socket);

    stompClient.current.connect({}, () => {
      console.log("Connected to WebSocket");

      // Subscribe to the specific user's queue
      stompClient.current.subscribe(
        `/queue/messages/${contactNumber}`,
        (messageOutput) => {
          try {
            // Log the raw received message for debugging
            // Assuming messageOutput is defined properly
            if (
              messageOutput &&
              messageOutput.body &&
              messageOutput.body.message
            ) {
              console.log("Raw received message:", messageOutput.body.message);
            } else {
              console.error("Message output or message content is undefined");
            }

            // Parse the message body
            const message = JSON.parse(messageOutput.body);
            setLastMessage(message);
            // Log the parsed message payload
            console.log("Parsed message payload:", message);

            // Update the state with the received message
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                text: message.message,
                image: message.image, // Include the image in the message UI
                sentByUser: message.sender === contact, // Check if the sender is the current user
                timestamp: new Date().toLocaleTimeString(), // Include the timestamp
              },
            ]);
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        }
      );
    });

    return () => {
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.disconnect(() => {
          console.log("Disconnected from WebSocket");
        });
      }
    };
  };

  // Handle message sending

  const sendMessage = async () => {
    if (sending || (!newMessage.trim() && !selectedImage)) return; // Exit if already sending or no content to send

    setSending(true); // Prevent further clicks while sending

    if (selectedImage) {
      try {
        const base64Image = await convertImageToBase64(selectedImage);
        console.log("Base64 Image:", base64Image); // Debugging log

        const messagePayload = {
          sender: contact,
          receiverContact: selectedUser.contact, // Set receiver contact here
          message: newMessage,
          image: base64Image, // Base64 image string
          timestamp: new Date().toISOString(),
        };

        setReceiverContact(selectedUser.contact); // Ensure the receiver contact is updated
        await sendMessageToKafka(messagePayload);

        resetMessageInput();
      } catch (error) {
        console.error("Error converting image:", error);
        setSending(false);
      }
    } else {
      const messagePayload = {
        sender: contact,
        receiverContact: selectedUser.contact, // Set receiver contact here
        message: newMessage,
        image: null, // No image
        timestamp: new Date().toISOString(),
      };
      setReceiverContact(selectedUser.contact); // Ensure receiver contact is set here

      sendMessageToKafka(messagePayload);
      resetMessageInput();
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const sendMessageToKafka = (payload) => {
    stompClient.current.send("/app/chat", {}, JSON.stringify(payload));
  };

  const resetMessageInput = () => {
    setNewMessage("");
    setSelectedImage(null);
    setSending(false);
  };

  // Handle input change (typing)
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    setIsTyping(true);

    // Notify the server that the user is typing
    stompClient.current.send(
      "/app/typing",
      {},
      JSON.stringify({ contactNumber: selectedUser.contact, isTyping: true })
    );

    // Set a timeout to stop the typing notification after 3 seconds
    setTimeout(() => setIsTyping(false), 3000);
  };

  // Fetch connected people
  const fetchConnectedPeople = async () => {
    try {
      const email = localStorage.getItem("email");
      const response = await axios.get(
        `http://localhost:9010/naming/connectpersion`, // Update to match backend
        { params: { email } }
      );

      if (response.status === 200) {
        setConnectedPeople(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching connected people:", error);
    }
  };

  useEffect(() => {
    fetchConnectedPeople();
  }, []);

  //showing the file option
  const handleFileClick = () => {
    // Create a temporary file input dynamically
    const fileInput = document.createElement("input");
    fileInput.type = "file";

    // Trigger the file chooser
    fileInput.click();

    // Handle the file selection
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        setSelectedImage(file); // Store the selected file in state
      }
    };
  };

  //receivng the sender and reciever massages according to their contact number

  const sender = localStorage.getItem("sender_contact");

  const receiver = receiverContact;

  useEffect(() => {
    if (!selectedUser || !selectedUser.contact) {
      console.error("Selected user or contact not available");
      return;
    }

    axios
      .get(
        `http://localhost:9010/getting/messages/${contact}/${selectedUser.contact}`
      )
      .then((response) => {
        const allMessages = response.data;

        console.log("All messages fetched from backend:", allMessages);

        const filteredSentMessages = allMessages
          .filter((msg) => msg.senderContact === contact)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const filteredReceivedMessages = allMessages
          .filter((msg) => msg.receiverContact === selectedUser.contact)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setSentMessages(filteredSentMessages);
        setReceivedMessages(filteredReceivedMessages);

        console.log("Filtered sent messages:", filteredSentMessages);
        console.log("Filtered received messages:", filteredReceivedMessages);
      })
      .catch((error) => console.error("Error fetching messages:", error));
  }, [contact, selectedUser]);

  return (
    <div className="main-sidebar">
      <div className="sidebar">
        <div className="header">
          <div className="avatar">
            <img
              src={`data:image/png;base64,${image}`}
              alt="Profile"
              className="select-image"
            />
          </div>
          <div className="chat-header-right">
            <h3 className="username">{username ? username : "Guest"}</h3>
          </div>
        </div>
        <div className="sidebar-search">
          <div className="sidebar-search-container">
            <img
              src="https://cdn3.iconfinder.com/data/icons/feather-5/24/search-512.png"
              alt="Search"
              className="search-icon"
            />
            <input type="text" placeholder="Search or start new chat" />
          </div>
        </div>

        <div className="sidebar-chats">
          {Array.isArray(connectedPeople) && connectedPeople.length > 0 ? (
            connectedPeople.map((user) => (
              <div
                key={user.id}
                className={`sidebar-chat ${
                  selectedUser && selectedUser.id === user.id ? "active" : ""
                }`}
                onClick={() => handleUserClick(user)}
              >
                <div className="chat-avatar">
                  <img
                    src={
                      user.image
                        ? `data:image/png;base64,${user.image}`
                        : "default-image-url.png"
                    }
                    alt="Profile"
                    className="select-image"
                  />
                </div>
                <div className="chat-info">
                  <h4>{user.name}</h4>

                  <p>Last Message</p>
                </div>
                <div className="time">
                  <p>2:44 pm</p>
                </div>
              </div>
            ))
          ) : (
            <p>No connected people available</p>
          )}
        </div>
      </div>

      <div className="message-container">
        {selectedUser ? (
          <>
            <div className="header">
              <div className="chat-title">
                <div className="avatar-left">
                  <img
                    src={
                      selectedUser && selectedUser.image
                        ? `data:image/png;base64,${selectedUser.image}`
                        : "default-image-url.png"
                    }
                    alt="Profile"
                    className="select-image"
                  />
                  <div className="user-info">
                    <span>{selectedUser.name}</span>
                    <span className="status">online</span>
                    {/* <p>Contact: {selectedUser.contact}</p> */}
                  </div>
                </div>
                <div className="icons-right">
                  {/* Icons for call, video, etc. */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-telephone"
                    viewBox="0 0 16 16"
                    id="audio_calls"
                    style={{ fill: "#8e8b8b" }} // Inline style for color
                  >
                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
                  </svg>

                  {/* //this for video calling */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-camera-video"
                    viewBox="0 0 16 16"
                    className="video_call"
                    style={{ fill: "#8e8b8b" }} // Inline style for color
                  >
                    <path
                      fill-rule="evenodd"
                      d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z"
                    />
                  </svg>

                  <div class="dropdown-container">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      class="dots-icon"
                      style={{ fill: "#000" }} // Inline style for color
                    >
                      <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                    </svg>

                    <ul class="dropdown-menu">
                      <li>Contact Info</li>
                      <li>Select Message</li>
                      <li>Mute Notifications</li>
                      <li>Report</li>
                      <li>Block</li>
                      <li>Clear Chat</li>
                      <li>Close Chat</li>
                      <li>Delete Chat</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="message-content">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    msg.sentByUser ? "chat-sent" : ""
                  }`}
                >
                  {/* Display the image if it exists */}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Message Attachment"
                      className="message-image"
                    />
                  )}
                  <p>{msg.text}</p>
                  <span className="chat-timestamp">{msg.timestamp}</span>
                </div>
              ))}
              {isTyping && <p className="typing-indicator">Typing...</p>}
            </div>

            <div className="message-footer">
              <img
                src="https://thumbs.dreamstime.com/b/smiley-face-emoji-symbol-icon-isolated-vector-illustration-170508349.jpg"
                alt="Smile"
                className="micor"
              />

              <img
                src="https://cdn-icons-png.flaticon.com/512/54/54848.png"
                alt="Attach"
                style={{
                  width: "25px",
                  height: "25px",
                  cursor: "pointer",
                  marginBottom: "10px",
                }}
                onClick={handleFileClick}
                className="select-image-file"
              />

              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />

              <img
                src={sendbutton}
                alt="Mic"
                className="micor"
                onClick={sendMessage}
              />

              {selectedImage && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "5px",
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="select-chat-message">
            <p>Please select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WhatsAppApp;
