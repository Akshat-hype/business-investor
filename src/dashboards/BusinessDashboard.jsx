import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const BusinessDashboard = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Technology",
  });
  const [message, setMessage] = useState("");
  const [ideas, setIdeas] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    category: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditChange = (e) => {
    setEditFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await addDoc(collection(db, "business_ideas"), {
        ...formData,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      setFormData({ title: "", description: "", category: "Technology" });
      setMessage("✅ Idea posted successfully!");
    } catch (error) {
      console.error("Error posting idea:", error);
      setMessage("❌ Failed to post idea.");
    }
  };

  const fetchMyIdeas = () => {
    const q = query(
      collection(db, "business_ideas"),
      where("createdBy", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIdeas(data);
    });

    return unsubscribe;
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "business_ideas", id));
      setMessage("🗑️ Idea deleted.");
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("❌ Could not delete idea.");
    }
  };

  const handleEditClick = (idea) => {
    setEditingId(idea.id);
    setEditFormData({
      title: idea.title,
      description: idea.description,
      category: idea.category,
    });
  };

  const handleUpdate = async (id) => {
    try {
      await updateDoc(doc(db, "business_ideas", id), {
        ...editFormData,
      });
      setMessage("✅ Idea updated!");
      setEditingId(null);
    } catch (error) {
      console.error("Update error:", error);
      setMessage("❌ Failed to update idea.");
    }
  };

  useEffect(() => {
    const unsubscribe = fetchMyIdeas();
    return () => unsubscribe();
  }, []);

  return (
    <div className="container">
      <h2>Business Person Dashboard</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Idea Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Describe your business idea"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="Technology">Technology</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Finance">Finance</option>
          <option value="Education">Education</option>
        </select>

        <button type="submit">Post Idea</button>
      </form>

      <p>{message}</p>

      <hr />
      <h3>Your Posted Ideas</h3>
      {ideas.length === 0 ? (
        <p>No ideas posted yet.</p>
      ) : (
        <ul>
          {ideas.map((idea) => (
            <li key={idea.id}>
              {editingId === idea.id ? (
                <>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                  />
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                  />
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditChange}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                  </select>
                  <button onClick={() => handleUpdate(idea.id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <strong>{idea.title}</strong> — {idea.category}
                  <p>{idea.description}</p>
                  <button onClick={() => handleEditClick(idea)}>Edit</button>
                  <button onClick={() => handleDelete(idea.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BusinessDashboard;
