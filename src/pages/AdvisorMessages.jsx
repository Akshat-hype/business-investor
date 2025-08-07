import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth } from "../firebase/config";

const AdvisorMessages = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const q = query(
          collection(db, "messages"),
          where("receiverId", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const messageData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMessages(messageData);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div className="container">
      <h2>📩 Messages for Advisor</h2>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <ul>
          {messages.map((msg) => (
            <li key={msg.id}>
              <strong>From:</strong> {msg.senderName || "Unknown"}
              <br />
              <strong>Message:</strong> {msg.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdvisorMessages;
