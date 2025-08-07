import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

const BankerDashboard = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const snapshot = await getDocs(collection(db, "business_ideas"));
        const ideasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setIdeas(ideasData);
      } catch (error) {
        console.error("Error fetching ideas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  const handleApprove = async (id) => {
    try {
      const ideaRef = doc(db, "business_ideas", id);
      await updateDoc(ideaRef, {
        loanApproved: true,
      });

      setIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === id ? { ...idea, loanApproved: true } : idea
        )
      );

      alert("✅ Loan approved!");
    } catch (error) {
      console.error("Error approving loan:", error);
      alert("❌ Failed to approve loan.");
    }
  };

  return (
    <div className="container">
      <h2>Banker Dashboard</h2>
      {loading ? (
        <p>Loading ideas...</p>
      ) : ideas.length === 0 ? (
        <p>No business ideas available.</p>
      ) : (
        <div>
          {ideas.map((idea) => (
            <div key={idea.id} className="idea-card" style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem", borderRadius: "8px" }}>
              <h3>{idea.title}</h3>
              <p><strong>Category:</strong> {idea.category}</p>
              <p><strong>Description:</strong> {idea.description}</p>
              <p><strong>Posted by:</strong> {idea.createdBy}</p>
              <p><strong>Loan Approved:</strong> {idea.loanApproved ? "✅ Yes" : "❌ No"}</p>

              <button
                onClick={() => handleApprove(idea.id)}
                disabled={idea.loanApproved}
              >
                {idea.loanApproved ? "Already Approved" : "Approve for Loan"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BankerDashboard;
