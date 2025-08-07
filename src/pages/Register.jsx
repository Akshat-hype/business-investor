// src/pages/Register.jsx
import React, { useState } from "react";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "Business Person",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // 👈 add loading state

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 👈 show loading
    setMessage("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        userType: formData.userType,
        uid: user.uid,
      });

      setMessage("✅ Registered successfully! You can now log in.");
    } catch (error) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        setMessage("❌ This email is already registered. Please log in instead.");
      } else {
        setMessage("❌ Error: " + error.message);
      }
    }

    setLoading(false); // 👈 hide loading
  };

  return (
    <div className="container">
      <h2>User Registration</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <select name="userType" onChange={handleChange}>
          <option value="Business Person">Business Person</option>
          <option value="Investor">Investor</option>
          <option value="Banker">Banker</option>
          <option value="Advisor">Advisor</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Register;
