/*import React, { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import io from "socket.io-client";
import apiClient from "../api";
import "../styles/message.css";

//const socket = io("http://localhost:5000", { transports: ['websocket', 'polling'] }); // Ensure socket.io client uses both WebSocket and polling transport methods

//const Messaging = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [recipientId, setRecipientId] = useState(""); // Assume recipient is selected
  const [username, setUsername] = useState("");

  // Memoize the fetchMessages function
  const fetchMessages = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        const token = await getAccessTokenSilently();
        const response = await apiClient.get("/messages/inbox", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(response.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    }
  }, [isAuthenticated, user, getAccessTokenSilently]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setUsername(user.name); // Set username after login
      fetchMessages();
    }

    // Listen for incoming messages in real-time via socket
    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off("newMessage");
    };
  }, [isAuthenticated, user, fetchMessages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      await apiClient.post(
        "/messages/send",
        { recipientId, content: messageContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessageContent("");
      fetchMessages(); // Reload messages after sending
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div>
      <h2>Messages for {username}</h2>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <p>
              <strong>{msg.senderId.name}:</strong> {msg.content}
            </p>
            <small>{new Date(msg.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Recipient ID"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          required
        />
        <textarea
          placeholder="Type your message"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          required
        ></textarea>
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Messaging;*/
