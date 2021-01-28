import React, { useState ,useContext} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
// import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import { Switch, Route } from 'react-router-dom';
// import Grid from '@material-ui/core/Grid';
// import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { UserContext } from "../../UserContext";
// import axios from "axios";
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import red from '@material-ui/core/colors/red';
import { useHistory } from "react-router-dom";
import SignIn from "./SignIn.js";
import {ValidComp, BlankArea, CricDreamLogo} from "CustomComponents/CustomComponents.js"
import {validateSpecialCharacters, validateEmail, cdRefresh, encrypt} from "views/functions.js";

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
  textData: {
    fontSize: '14px',
    margin: theme.spacing(0),
  },
}));

class ChildComp extends React.Component {

  componentDidMount()  {

    ValidatorForm.addValidationRule('isEmailOK', (value) => {
      return validateEmail(value);
    });

  }


  componentWillUnmount() {
    // remove rule when it is not needed
    ValidatorForm.removeValidationRule('isEmailOK');
  }

  render() {
    return <br/>;
  }

}


export default function ForgotPassword() {
  const classes = useStyles();
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [registerStatus, setRegisterStatus] = useState(199);

  // const { setUser } = useContext(UserContext);


  const handleSubmit = async() => {
    let tmp1 = encrypt(email);
    let response = await fetch(`${process.env.REACT_APP_AXIOS_BASEPATH}/user/cricemailpassword/${tmp1}`);
    setRegisterStatus(response.status);
  }

  function handleLogin() {
    localStorage.setItem("currentLogin", "SIGNIN");
    cdRefresh();
  }

  function ShowResisterStatus() {
    let myMsg;
    switch (registerStatus) {
      case 199:
        myMsg = ``;
        break;
      case 200:
        myMsg = `Successfully mailed password`;
        break;
      case 602:
        myMsg = `Email not configured in database`;
        break;
      case 603:
        myMsg = `Transport error while sending email`;
        break;
      default:
          myMsg = "Unknown Error";
          break;
    }
    return(
      <div>
        <Typography className={(registerStatus === 200) ? classes.root : classes.error}>{myMsg}</Typography>
        <Typography className={classes.root}>
            <Link href="#" onClick={handleLogin} variant="body2">
            Already have an account? Sign in
          </Link>
        </Typography>
      </div>
    )
  }


  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
      <CricDreamLogo />
        {/* <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar> */}
        <Typography component="h1" variant="h5">Forgot Password.</Typography>
        <br/>
        <p className={classes.textData}>Forgot possword? Do not worry.</p>
        <p className={classes.textData}>Password will be mailed to you</p>
    <ValidatorForm className={classes.form} onSubmit={handleSubmit}>
      <TextValidator
          variant="outlined"
          required
          fullWidth      
          label="Email"
          onChange={(event) => setEmail(event.target.value)}
          name="email"
          type="email"
          validators={['isEmailOK', 'required']}
          errorMessages={['Invalid Email', 'Email to be provided']}
          value={email}
      />
      <ShowResisterStatus/>
      <BlankArea/>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
      >
        Submit
    </Button>
    </ValidatorForm>
    </div>
    <ValidComp />    
    </Container>
  );
}
