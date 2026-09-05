import React from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import BehaviorManager from "./components/BehaviorManager";
import Footer from "./components/Footer";
import "./App.css";

function App() {
return ( <div className="app"> <Navbar /> <Home /> <BehaviorManager /> <Footer /> </div>
);
}

export default App;
