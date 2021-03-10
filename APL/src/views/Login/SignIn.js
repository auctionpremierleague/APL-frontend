import React, { useState, useContext, useEffect } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import { Switch, Route } from 'react-router-dom';
// import Dialog from '@material-ui/core/Dialog';
// import DialogTitle from '@material-ui/core/DialogTitle';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
// import SignUp from "../Login/SignUp.js";
// import ForgotPassword from "./ForgotPassword.js";
import { useHistory } from "react-router-dom";
import { UserContext } from "../../UserContext";
import axios from "axios";
import red from '@material-ui/core/colors/red';
import { DesktopWindows } from '@material-ui/icons';
import { cdRefresh, specialSetPos, encrypt } from "views/functions.js"
import {setTab} from "CustomComponents/CricDreamTabs.js"
import { CricDreamLogo } from 'CustomComponents/CustomComponents.js';


const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  error:  {
      // right: 0,
      fontSize: '12px',
      color: red[700],
      // position: 'absolute',
      alignItems: 'center',
      marginTop: '0px',
  },
}));

const handleSubmit = e => {
  e.preventDefault();
};

export default function SignIn() {
  const classes = useStyles();
  const history = useHistory();
  const [userName, setUserName] = useState();
  const [password, setPassword] = useState();
  // const [showPage, setShowPage] = useState(true);
  // const [open, setOpen] = useState(true)
  // const { setUser } = useContext(UserContext);
  const [ errorMessage, setErrorMessage ] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem("logout")) {
      localStorage.clear();
    }
    if (window.localStorage.getItem("uid")) {
      // setUser({ uid: window.localStorage.getItem("uid"), admin: window.localStorage.getItem("admin") })
      // history.push("/admin")
    } else {
      // setShowPage(true)
    }
  });

  function handleForgot() {
    console.log("Call forgot password here")
    // history.push('/admin/emailpassword');
    localStorage.setItem("currentLogin", "RESET");
    cdRefresh();
  }

  function handleRegister() {
    console.log("Call for register here");
    // history.push("/admin/register")
    localStorage.setItem("currentLogin", "SIGNUP");
    cdRefresh();
  }

  const handleClick = async () => {
    let response = ""
    try { 
      let enPassword = encrypt(password);
      response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/user/criclogin/${userName}/${enPassword}`); 
      setErrorMessage("");
    } catch (err) {
      setErrorMessage("Invalid Username / Password");
    }
    console.log(`Signin status ${response.status}`);
    if (response.status === 200) {
      let myUID = response.data.uid;
      let userPlan = response.data.userPlan; 
      response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/group/default/${myUID}`);
      // console.log(response.data);
      // SAMPLE OUTPUT
      // {"uid":"8","gid":2,"displayName":"Salgia Super Stars",
      // "groupName":"Happy Home Society Grp 2","tournament":"ENGAUST20","ismember":true,"admin":true}
      window.localStorage.setItem("uid", myUID)
      window.localStorage.setItem("gid", response.data.gid);
      window.localStorage.setItem("displayName", response.data.displayName);
      window.localStorage.setItem("userName", response.data.userName);
      window.localStorage.setItem("groupName", response.data.groupName);
      window.localStorage.setItem("tournament", response.data.tournament);
      window.localStorage.setItem("admin", response.data.admin)
      window.localStorage.setItem("userPlan", userPlan);
      // setUser({ uid: myUID, admin: response.data.admin });
      // cdRefresh(true);
      let newPos = specialSetPos();
      //if (newPos < 0) newPos = 0;
      setTab(newPos);
    }

  }
  
  return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <CricDreamLogo />        
          <Typography component="h1" variant="h5">Sign in</Typography>
          <form className={classes.form} onSubmit={handleSubmit} noValidate>
            <TextField
              autoComplete="fname"
              name="userName"
              variant="outlined"
              required
              fullWidth
              id="userName"
              label="User Name"
              autoFocus
              onChange={(event) => setUserName(event.target.value)}
            />
            <h3></h3>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
            />
            <div>
            <Typography className={classes.error} align="left">{errorMessage}</Typography>
            </div>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={handleClick}
            >
              Sign In
          </Button>
          <Typography className={classes.root}>
              <Link href="#" onClick={handleForgot} variant="body2">
              Forgot password
            </Link>
          </Typography>
          <Typography className={classes.root}>
              <Link href="#" onClick={handleRegister} variant="body2">
              Register
            </Link>
          </Typography>
          </form>
        </div>
        {/* <Route  path='/admin/emailpassword' component={Reset} key="MemberList"/>
        <Route  path='/admin/register' component={SignUp} key="NewGroup"></Route> */}
      </Container>
  );
}
