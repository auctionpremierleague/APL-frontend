import React, { useState, useMemo } from "react";
import { BrowserRouter as Router, Route , Redirect} from "react-router-dom";
import { createBrowserHistory } from "history";
import { UserContext } from "./UserContext";
import Admin from "layouts/Admin.js";
import RTL from "layouts/RTL.js";
import SignIn from "views/SignIn/SignIn.js";
import "assets/css/material-dashboard-react.css?v=1.9.0";

const hist = createBrowserHistory();
function AppRouter() {
  const [user, setUser] = useState(null);

  const value = useMemo(() => ({ user, setUser }), [user, setUser]);
console.log(value);
  return (
    <Router history={hist}>
      
       
        <UserContext.Provider value={value}>
        <Route path="/admin" component={Admin} />
      <Route path="/rtl" component={RTL} />
      <Route path="/signIn" component={SignIn} />
      <Redirect from="/" to="/signIn" />
     
        </UserContext.Provider>
      
    </Router>
  );
}

export default AppRouter;
