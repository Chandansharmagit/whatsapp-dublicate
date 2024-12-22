import React, { useState, useEffect } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';

const socket = io('http://localhost:9091/chat-websocket'); // Replace with your actual WebSocket URL

function VideoCall() {
  const location = useLocation(); // Get state from navigate
  const { receiverContact } = location.state || {}; // Destructure receiverContact from state
  console.log("receiver contact" , receiverContact)

  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);

  useEffect(() => {
    if (!receiverContact) {
      console.error('Receiver contact not found!');
      return;
    }

    // Access user's media stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);

        const newPeer = new Peer({
          initiator: true,  // Set true if initiating the call
          stream: mediaStream, // Pass user's media stream
          trickle: false, // Disable ICE candidates
        });

        newPeer.on('signal', (data) => {
          socket.emit('call', { receiverContact, signal: data });
        });

        setPeer(newPeer);

        socket.on('callAccepted', (signal) => {
          newPeer.signal(signal); // Receive signal and connect
        });

        return () => {
          newPeer.destroy(); // Cleanup on component unmount
          socket.disconnect(); // Disconnect socket
        };
      })
      .catch((err) => {
        console.error('Error accessing media devices.', err);
      });
  }, [receiverContact]);

  return (
    <div>
      {receiverContact ? (
        <>
          <h3>Calling {receiverContact}...</h3>
          <video playsInline autoPlay ref={(ref) => ref && (ref.srcObject = stream)}></video>
        </>
      ) : (
        <h3>Error: Receiver contact not found.</h3>
      )}
    </div>
  );
}

export default VideoCall;
