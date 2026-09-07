import React from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import BehaviorManager from "./components/BehaviorManager";
import Footer from "./components/Footer";
import Auth from "./components/Auth";
import "./App.css";

function App() {
	const [user, setUser] = React.useState(() => {
		const storedUser = localStorage.getItem("authUser");
		return storedUser ? JSON.parse(storedUser) : null;
	});

	const handleLogout = () => {
		localStorage.removeItem("authToken");
		localStorage.removeItem("authUser");
		setUser(null);
	};

	if (!user) return <Auth onAuthenticated={setUser} />;

	return <div className="app"><Navbar user={user} onLogout={handleLogout} /><Home user={user} /><BehaviorManager onUnauthorized={handleLogout} /><Footer /></div>;
}

export default App;
