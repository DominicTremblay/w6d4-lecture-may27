import React from 'react';

const NavBar = ({ username }) => {
  return (
    <nav className="navbar">
      <a href="/" className="navbar-brand">
        Chatty
      </a>

      <div>Username: {username}</div>
    </nav>
  );
};

export default NavBar;
