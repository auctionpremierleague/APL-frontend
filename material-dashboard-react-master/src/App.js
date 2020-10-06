import React, { useState, useMemo } from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import { UserContext } from "./UserContext";
import Admin from "layouts/Admin.js";
// import RTL from "layouts/RTL.js";
import SignIn from "views/SignIn/SignIn.js";
import "assets/css/material-dashboard-react.css?v=1.9.0";

const hist = createBrowserHistory();
function AppRouter() {


  
  const [user, setUser] = useState(null);

  const value = useMemo(() => ({ user, setUser }), [user, setUser]);

  // localStorage.clear()
  window.onbeforeunload = () => Router.refresh();
  console.log("in before unload");
  // localStorage.clear();
  // console.log("clearing local storage");
  return (
    <Router history={hist}>
      <UserContext.Provider value={value}>
        {!user && <Redirect from="/" to="/signIn" />}
        <Route path="/signIn" component={SignIn} />
        <Route path="/admin" component={value ? Admin : SignIn} />
        <Redirect from="/" to="/signIn" />

      </UserContext.Provider>

    </Router>
  );
}

export default AppRouter;
