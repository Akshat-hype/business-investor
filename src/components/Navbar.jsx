import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ user, handleLogout }) => {
  const userType = localStorage.getItem("userType")?.replace(/"/g, "");

  const navStyle = {
    backgroundColor: "#2e7d32", // Green
    padding: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#fff",
  };

  const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    marginRight: "20px",
    fontWeight: "bold",
  };

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={linkStyle}>
          Home
        </Link>
        {!user && (
          <>
            <Link to="/register" style={linkStyle}>
              Register
            </Link>
            <Link to="/login" style={linkStyle}>
              Login
            </Link>
          </>
        )}
        {user && (
          <>
            {userType === "Business Person" && (
              <Link to="/messages/business" style={linkStyle}>
                Messages
              </Link>
            )}
            {userType === "Investor" && (
              <Link to="/messages/investor" style={linkStyle}>
                Messages
              </Link>
            )}
            {userType === "Advisor" && (
              <Link to="/messages/advisor" style={linkStyle}>
                Messages
              </Link>
            )}
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#ffffff22",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
      {user && <p style={{ margin: 0 }}>👤 Logged in</p>}
    </nav>
  );
};

export default Navbar;
