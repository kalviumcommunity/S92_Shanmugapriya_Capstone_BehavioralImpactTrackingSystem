import React from "react";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="navbar-logo">Behavioral Impact Tracker</h2>
      <ul className="navbar-links">
        <li>Home</li>
        <li>Dashboard</li>
        <li>About</li>
        <li>Contact</li>
      </ul>
    </nav>
  );
}

export default Navbar;