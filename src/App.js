import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase/config";
import { doc, getDoc } from "firebase/firestore";

import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";

import InvestorDashboard from "./dashboards/InvestorDashboard";
import BusinessDashboard from "./dashboards/BusinessDashboard";
import BankerDashboard from "./dashboards/BankerDashboard";
import AdvisorDashboard from "./dashboards/AdvisorDashboard";

import BusinessMessages from "./pages/BusinessMessages";
import InvestorMessages from "./pages/InvestorMessages";
import AdvisorMessages from "./pages/AdvisorMessages";


import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const userRef = doc(db, "users", u.uid);
          const userSnap = await getDoc(userRef);
          const type = userSnap.data()?.userType;
          setUserType(type);
          localStorage.setItem("userType", JSON.stringify(type));
        } catch (error) {
          console.error("❌ Firestore fetch error:", error.message);
          alert("Couldn't load user info.");
        }
      } else {
        setUser(null);
        setUserType(null);
        localStorage.removeItem("userType");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogout = () => {
    signOut(auth);
    setUser(null);
    setUserType(null);
    localStorage.removeItem("userType");
  };

  if (loading) {
    return <div className="container">🔄 Checking authentication...</div>;
  }

  return (
    <Router>
      <Navbar user={user} userType={userType} handleLogout={handleLogout} />
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboards */}
          <Route
            path="/dashboard/business"
            element={userType === "Business Person" ? <BusinessDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/investor"
            element={userType === "Investor" ? <InvestorDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/banker"
            element={userType === "Banker" ? <BankerDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/advisor"
            element={userType === "Advisor" ? <AdvisorDashboard /> : <Navigate to="/login" />}
          />

          {/* 🔐 Messages (for Business Person) */}
          <Route
            path="/messages/business"
            element={userType === "Business Person" ? <BusinessMessages /> : <Navigate to="/login" />}
          />
          <Route
  path="/messages/investor"
  element={userType === "Investor" ? <InvestorMessages /> : <Navigate to="/login" />}
/>
<Route
  path="/messages/advisor"
  element={userType === "Advisor" ? <AdvisorMessages /> : <Navigate to="/login" />}
/>

        </Routes>
      </div>
    </Router>
  );
}

export default App;
