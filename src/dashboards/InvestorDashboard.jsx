import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

const InvestorDashboard = () => {
  const [ideas, setIdeas] = useState([]);
  const [filter, setFilter] = useState("All");
  const [interestedIdeas, setInterestedIdeas] = useState([]);
  const [message, setMessage] = useState({});
  

  const user = auth.currentUser;

  useEffect(() => {
    const fetchIdeas = async () => {
      const snapshot = await getDocs(collection(db, "business_ideas"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIdeas(data);
    };

    const fetchInterests = async () => {
      const q = query(
        collection(db, "interests"),
        where("investorId", "==", user?.uid)
      );
      const snapshot = await getDocs(q);
      const ids = snapshot.docs.map((doc) => doc.data().ideaId);
      setInterestedIdeas(ids);
    };

    fetchIdeas();
    fetchInterests();
  }, [user]);

  const handleInterest = async (ideaId) => {
    try {
      await addDoc(collection(db, "interests"), {
        ideaId,
        investorId: user.uid,
        timestamp: Timestamp.now(),
      });
      setInterestedIdeas((prev) => [...prev, ideaId]);
      alert("✅ Interest recorded!");
    } catch (err) {
      console.error("Error expressing interest:", err);
    }
  };

  const handleSendMessage = async (idea) => {
    const content = message[idea.id];
    if (!content) return alert("Please enter a message first.");

    try {
      await addDoc(collection(db, "messages"), {
        ideaId: idea.id,
        fromId: user.uid,
        fromType: "Investor",
        toId: idea.createdBy,
        toType: "Business Person",
        message: content,
        timestamp: Timestamp.now(),
      });

      alert("✅ Message sent!");
      setMessage((prev) => ({ ...prev, [idea.id]: "" }));
    } catch (err) {
      console.error("Message error:", err);
      alert("❌ Failed to send message.");
    }
  };

  const filteredIdeas =
    filter === "All" ? ideas : ideas.filter((idea) => idea.category === filter);

  return (
    <div className="container">
      <h2>Investor Dashboard</h2>

      <div>
        <label>Filter by category: </label>
        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="All">All</option>
          <option value="Technology">Technology</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Finance">Finance</option>
          <option value="Education">Education</option>
        </select>
      </div>

      <hr />

      {filteredIdeas.length === 0 ? (
        <p>No ideas found.</p>
      ) : (
        <ul>
          {filteredIdeas.map((idea) => (
            <li
              key={idea.id}
              style={{ marginBottom: "30px", borderBottom: "1px solid #ccc" }}
            >
              <strong>{idea.title}</strong> — {idea.category}
              <p>{idea.description}</p>
              {idea.imageUrl && (
                <img
                  src={idea.imageUrl}
                  alt="idea"
                  style={{ maxWidth: "300px", display: "block" }}
                />
              )}
              {idea.pdfUrl && (
                <p>
                  <a href={idea.pdfUrl} target="_blank" rel="noreferrer">
                    View PDF
                  </a>
                </p>
              )}

              {!interestedIdeas.includes(idea.id) ? (
                <button onClick={() => handleInterest(idea.id)}>
                  Express Interest
                </button>
              ) : (
                <>
                  <p>✅ You've expressed interest.</p>
                  <textarea
                    rows={2}
                    placeholder="Write a message..."
                    value={message[idea.id] || ""}
                    onChange={(e) =>
                      setMessage((prev) => ({
                        ...prev,
                        [idea.id]: e.target.value,
                      }))
                    }
                  ></textarea>
                  <button onClick={() => handleSendMessage(idea)}>
                    Send Message
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <hr />
      <h3>📌 My Interested Ideas</h3>
      {interestedIdeas.length === 0 ? (
        <p>You haven’t expressed interest in any ideas yet.</p>
      ) : (
        <ul>
          {ideas
            .filter((idea) => interestedIdeas.includes(idea.id))
            .map((idea) => (
              <li key={idea.id}>
                <h4>{idea.title}</h4>
                <p>{idea.description}</p>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default InvestorDashboard;
