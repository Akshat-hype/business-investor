import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const BusinessMessages = () => {
  const [messages, setMessages] = useState([]);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const q = query(
            collection(db, "advisor_messages"),
            where("to", "==", user.uid),
            orderBy("timestamp", "desc")
          );
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      } else {
        setCurrentUser(null);
        setMessages([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleReplyChange = (id, value) => {
    setReplies((prev) => ({ ...prev, [id]: value }));
  };

  const handleReplySubmit = async (messageId) => {
    const replyText = replies[messageId];
    if (!replyText.trim()) return;

    try {
      const msgRef = doc(db, "advisor_messages", messageId);
      await updateDoc(msgRef, {
        replies: arrayUnion({
          text: replyText,
          from: currentUser.uid,
          timestamp: new Date(),
        }),
      });

      alert("✅ Reply sent!");
      setReplies((prev) => ({ ...prev, [messageId]: "" }));
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("❌ Failed to send reply.");
    }
  };

  return (
    <div className="container">
      <h2>Messages from Advisors</h2>

      {loading ? (
        <p>Loading messages...</p>
      ) : messages.length === 0 ? (
        <p>No messages yet for UID: {currentUser?.uid}</p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
            }}
          >
            <p>
              <strong>Message:</strong> {msg.message}
            </p>
            <p>
              <small>From: {msg.from}</small>
            </p>

            {/* Show replies (if any) */}
            {msg.replies && msg.replies.length > 0 && (
              <div style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
                <strong>Replies:</strong>
                <ul>
                  {msg.replies.map((r, i) => (
                    <li key={i}>{r.text}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reply input */}
            <textarea
              placeholder="Type your reply..."
              value={replies[msg.id] || ""}
              onChange={(e) => handleReplyChange(msg.id, e.target.value)}
              style={{ width: "100%", marginTop: "0.5rem" }}
            />
            <button
              onClick={() => handleReplySubmit(msg.id)}
              style={{ marginTop: "0.5rem" }}
            >
              Send Reply
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default BusinessMessages;
