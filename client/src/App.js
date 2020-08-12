import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Route
} from "react-router-dom"
import HomePage from "./pages/HomePage";
import SignUp from "./pages/sign-up/SignUp";
import SignIn from "./pages/sign-in/SignIn";
import Auction from "./pages/Auction/Auction";
import NavBar from "./NavBar";

function App() {
  return (
    <Router>
    <div className="App">
    <NavBar/>
    <div id="page-body">
     <Route path="/" component ={HomePage} exact/>
     <Route path="/auction" component ={Auction} exact/>
     <Route path="/signUp" component ={SignUp} exact/>
     <Route path="/signIn" component ={SignIn} exact/>
    </div>
    </div>
    </Router>
  );
}

export default App;
