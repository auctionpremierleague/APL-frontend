import React, { useState, useMemo } from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import { UserContext } from "./UserContext";
import Admin from "layouts/Admin.js";
import "assets/css/material-dashboard-react.css?v=1.9.0";
// import { DesktopWindows } from "@material-ui/icons";
import CricDreamTabs from "CustomComponents/CricDreamTabs"
import SignIn from "views/Login/SignIn.js";
import SignUp from "views/Login/SignUp.js";
import ForgotPassword from "views/Login/ForgotPassword.js";

const hist = createBrowserHistory();

function AppRouter() {

  const [user, setUser] = useState(null);

  const value = useMemo(() => ({ user, setUser }), [user, setUser]);

  function isUserLogged() {
    console.log(`User is ${localStorage.getItem("uid")}`)
    if ((localStorage.getItem("uid") === "") || 
        (localStorage.getItem("uid") === "0") ||
        (localStorage.getItem("uid") === null))
      return false;
    else
      return true;
  }

  function DispayTabs() {
    // console.log(localStorage.getItem("uid"));
    // console.log(`Status is ${isUserLogged()}`)
    if (isUserLogged())
      return (<CricDreamTabs/>)  
    else {
      if (localStorage.getItem("currentLogin") === "SIGNUP")
        return (<SignUp/>)
      else if (localStorage.getItem("currentLogin") === "RESET")
        return (<ForgotPassword/>)
      else
        return (<SignIn/>)
    }
  }
  // localStorage.clear()
  window.onbeforeunload = () => Router.refresh();
  console.log("in before unload");
  // localStorage.clear();
  // console.log("clearing local storage");
  // return (
  //   <Router history={hist}> 
  //     <UserContext.Provider value={value}>
  //       {!user && <Redirect from="/" to="/signIn" />}
  //       <Route path="/signIn" component={SignIn} />
  //       <Route path="/admin" component={value ? Admin : SignIn} />
  //       <Redirect from="/" to="/signIn" />
  //     </UserContext.Provider>
  //   </Router>
  // );

return (
      <Router history={hist}> 
      <UserContext.Provider value={value}>
      </UserContext.Provider>
      <DispayTabs />
      </Router>
  );

}

export default AppRouter;
