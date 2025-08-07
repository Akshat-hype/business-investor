import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { auth } from "../firebase/config";

const AdvisorDashboard = () => {
  const [businessUsers, setBusinessUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState([]);

  useEffect(() => {
    const fetchBusinessUsers = async () => {
      const q = query(collection(db, "users"), where("userType", "==", "Business Person"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBusinessUsers(data);
    };

    const fetchSentMessages = async () => {
      const q = query(
        collection(db, "advisor_messages"),
        where("from", "==", auth.currentUser?.uid || ""),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data());
      setSentMessages(data);
    };

    fetchBusinessUsers();
    fetchSentMessages();
  }, []);

  const handleSendMessage = async () => {
    if (!selectedUser || !message.trim()) {
      alert("Please select a user and write a message.");
      return;
    }

    try {
      await addDoc(collection(db, "advisor_messages"), {
        from: auth.currentUser.uid,
        to: selectedUser,
        message: message.trim(),
        timestamp: Timestamp.now(),
        replies: [],
      });

      alert("✅ Message sent!");
      setMessage("");
      setSelectedUser("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("❌ Failed to send message.");
    }
  };

  return (
    <div className="container">
      <h2>Advisor Dashboard</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>Select Business User:</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          style={{ marginLeft: "1rem" }}
        >
          <option value="">-- Select --</option>
          {businessUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <textarea
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "100%", minHeight: "100px" }}
      />
      <button onClick={handleSendMessage} style={{ marginTop: "0.5rem" }}>
        Send Message
      </button>

      <hr />

      <h3>Sent Messages</h3>
      {sentMessages.length === 0 ? (
        <p>No messages sent yet.</p>
      ) : (
        sentMessages.map((msg, index) => (
          <div key={index} style={{ border: "1px solid #ccc", padding: "0.5rem", marginBottom: "0.5rem" }}>
            <p><strong>To:</strong> {msg.to}</p>
            <p>{msg.message}</p>
            <small>{msg.timestamp?.toDate().toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
};

export default AdvisorDashboard;
