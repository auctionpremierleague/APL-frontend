import React from "react";
import { useHistory } from "react-router-dom";

export default function Logout() {
localStorage.clear();
const history = useHistory();
history.push("/signIn")

return(<div></div>)
}