import React, { useState, useContext, useEffect } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';

import DialogTitle from '@material-ui/core/DialogTitle';
import Link from '@material-ui/core/Link';

import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import SignUp from "../SignUp/SignUp.js";
import { useHistory } from "react-router-dom";

import { UserContext } from "../../UserContext";
import axios from "axios";




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
}));

const handleSubmit = e => {
  e.preventDefault();
};
export default function SignIn() {
  const classes = useStyles();
  const history = useHistory();
  const [userName, setUserName] = useState();
  const [password, setPassword] = useState();
  const [showPage, setShowPage] = useState(false);
  const [open, setOpen] = useState(false)
  const { setUser } = useContext(UserContext);

  useEffect(() => {


    if (window.localStorage.getItem("logout")) {
      localStorage.clear();
    }
    if (window.localStorage.getItem("uid")) {
      setUser({ uid: window.localStorage.getItem("uid"), admin: window.localStorage.getItem("admin") })
      history.push("/admin")
    } else {
      setShowPage(true)
    }
  })
  const handleClick = async () => {
    let response = ""
    try { response = await axios.get(`/user/login/${userName}/${password}`); }
    catch (err) {
      setOpen(true)
    }


    console.log(response.status)
    if (response.status === 200) {
      var myUID = response.data;
      response = await axios.get(`/group/default/${myUID}`);
      // SAMPLE OUTPUT
      // {"uid":"8","gid":2,"displayName":"Salgia Super Stars",
      // "groupName":"Happy Home Society Grp 2","tournament":"ENGAUST20","ismember":true,"admin":true}
      window.localStorage.setItem("uid", myUID)
      window.localStorage.setItem("gid", response.data.gid);
      window.localStorage.setItem("displayName", response.data.displayName);
      window.localStorage.setItem("groupName", response.data.groupName);
      window.localStorage.setItem("tournament", response.data.tournament);
      window.localStorage.setItem("ismember", response.data.ismember);
      window.localStorage.setItem("admin", response.data.admin)
      setUser({ uid: myUID, admin: response.data.admin });
      // const admin = await axios.get(`/group/owner`);
      // if (admin.data.uid === response.data) {
      //   window.localStorage.setItem("admin", true)
      //   setUser({ uid: response.data, admin: true });
      // } else {
      //   setUser({ uid: response.data, admin: false });
      //   window.localStorage.setItem("admin", false)
      // }
      history.push("/admin")

    }

  }
  return (
    showPage ?
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
        </Typography>
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

          </form>
        </div>

        <Dialog aria-labelledby="simple-dialog-title" open={open}
          onClose={() => setOpen(false)} >
          <DialogTitle id="simple-dialog-title" >Invalid Username or Password</DialogTitle>


        </Dialog>

      </Container> : ""
  );
}
