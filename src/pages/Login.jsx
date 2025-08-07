import React, { useState } from "react";
import { auth, db } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userType = userSnap.data()?.userType;

      if (userType) {
        localStorage.setItem("userType", userType);
        setMessage("✅ Login successful! Redirecting...");

        // Navigate based on role
        switch (userType) {
          case "Business Person":
            navigate("/dashboard/business");
            break;
          case "Investor":
            navigate("/dashboard/investor");
            break;
          case "Banker":
            navigate("/dashboard/banker");
            break;
          case "Advisor":
            navigate("/dashboard/advisor");
            break;
          default:
            navigate("/");
        }
      } else {
        setMessage("❌ Error: Couldn't determine user type.");
      }
    } catch (error) {
      console.error(error);
      if (error.code === "auth/user-not-found") {
        setMessage("❌ User not found. Please register first.");
      } else if (error.code === "auth/wrong-password") {
        setMessage("❌ Incorrect password.");
      } else {
        setMessage("❌ Error: " + error.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h2>User Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Login;
