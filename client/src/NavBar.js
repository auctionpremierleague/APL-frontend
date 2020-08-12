import React from "react";

import {Link} from "react-router-dom";

const NavBar =()=>(
    <nav>
        <ul>
            <li>

<Link to="/about">Home</Link>
<Link to="/signUp">signUp</Link>
<Link to="/signIn">signIn</Link>
<Link to="/auction">Auction</Link>
            </li>
        </ul>
    </nav>
)

export default NavBar;