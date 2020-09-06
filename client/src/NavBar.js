import React from "react";

import {Link} from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Grid from "@material-ui/core/Grid";
import { makeStyles, useTheme } from '@material-ui/core/styles';

export default function NavBar (){
    
    
    const useStyles = makeStyles((theme) => ({
        link:{
            color:'white'
        }
      }));
      const classes = useStyles();
      const theme = useTheme();
      return(
<AppBar>
    <Toolbar>
    <Grid
  container
  direction="row"
  justify="center"
  alignItems="center"
  spacing={2}
>

<Grid item xs={3}>

<Link  className={classes.link} to="/signUp">signUp</Link>
</Grid>
<Grid item xs={3}>
<Link  className={classes.link}  to="/signIn">signIn</Link>
</Grid>
<Grid item xs={3}>
<Link  className={classes.link}  to="/auction">Auction</Link>
</Grid>
<Grid item xs={3}>
<Link  className={classes.link}  to="/myTeam">My Team</Link>
</Grid>

</Grid>
</Toolbar>
</AppBar>       
)
    }
