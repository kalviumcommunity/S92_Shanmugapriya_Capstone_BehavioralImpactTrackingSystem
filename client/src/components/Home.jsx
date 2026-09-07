import React from "react";

function Home({ user }) {
  return (
    <div className="home">
      <h1>Welcome back, {user.name || user.username}</h1>
      <p>Track, analyze, and improve behavioral outcomes with ease.</p>
    </div>
  );
}

export default Home;