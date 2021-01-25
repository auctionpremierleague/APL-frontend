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
import axios from "axios";
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import red from '@material-ui/core/colors/red';
import { useHistory } from "react-router-dom";
import {validateSpecialCharacters, validateEmail, cdRefresh} from "views/functions.js";
import { CricDreamLogo } from 'CustomComponents/CustomComponents.js';
import { setTab } from "CustomComponents/CricDreamTabs.js"


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

class ChildComp extends React.Component {

  componentDidMount()  {
    // custom rule will have name 'isPasswordMatch'
    ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
      return (value === this.props.p1)
    });

    ValidatorForm.addValidationRule('minLength', (value) => {
      return (value.length >= 6)
    });

    ValidatorForm.addValidationRule('noSpecialCharacters', (value) => {
      return validateSpecialCharacters(value);
    });

    ValidatorForm.addValidationRule('isEmailOK', (value) => {
      return validateEmail(value);
    });
  }

  
  componentWillUnmount() {
    // remove rule when it is not needed
    ValidatorForm.removeValidationRule('isPasswordMatch');
    ValidatorForm.removeValidationRule('isEmailOK');
    ValidatorForm.removeValidationRule('minLength');
    ValidatorForm.removeValidationRule('noSpecialCharacters');   
  }

  render() {
    return <br/>;
  }

}
// const handleSubmit = e => {
//   e.preventDefault();
// };



export default function ChangePassword() {
  const classes = useStyles();
  const history = useHistory();
  // const [userName, setUserName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [registerStatus, setRegisterStatus] = useState(0);

  // const { setUser } = useContext(UserContext);

  // const handleChange = (event) => {
  //   const { user } = this.state;
  //   user[event.target.name] = event.target.value;
  //   this.setState({ user });
  // }

  const handleSubmit = async() => {
    console.log("Submit command provided");
    if (currentPassword === newPassword) {
      setRegisterStatus(611);
      return;
    }
    let response = await fetch(`${process.env.REACT_APP_AXIOS_BASEPATH}/user/reset/${localStorage.getItem("uid")}/${currentPassword}/${newPassword}`);
    if (response.status === 200) {
      setTab(0);
    } else {
      // error
      setRegisterStatus(response.status);
      console.log(`Status is ${response.status}`);
    }
  }

  function handleLogin() {
    // console.log("Call for login here");
    // history.push("/signin")
    localStorage.setItem("currentLogin", "SIGNIN");
    cdRefresh();

  }

  function ShowResisterStatus() {
    // console.log(`Status is ${registerStatus}`);
    let myMsg;
    switch (registerStatus) {
      case 200:
        // setUserName("");
        // setPassword("");
        // setRepeatPassword("");
        // setEmail("");
        myMsg = `Updated Password successfully.`;
        break;
      case 602:
        myMsg = "Invalid Current password";
        break;
      case 611:
        myMsg = "New password has to be other than CUrrent Password";
        break;
        default:
          myMsg = "";
          break;
    }
    return(
      <Typography className={(registerStatus === 200) ? classes.root : classes.error}>{myMsg}</Typography>
    )
  }

  function BlankArea() {
    return(<h3></h3>)
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
      <Typography component="h1" variant="h5">
        Change Password
      </Typography>
      <ValidatorForm className={classes.form} onSubmit={handleSubmit}>
      <TextValidator
          variant="outlined"
          required
          fullWidth      
          label="Current Password"
          onChange={(event) => setCurrentPassword(event.target.value)}
          name="currentpassword"
          type="password"
          validators={['required', 'minLength', 'noSpecialCharacters']}
          errorMessages={['Current Password to be provided', 'Mimumum 6 characters required', 'Special characters not permitted']}
          value={currentPassword}
      />
      <BlankArea/>
      <TextValidator
          variant="outlined"
          required
          fullWidth      
          label="Password"
          onChange={(event) => setNewPassword(event.target.value)}
          name="password"
          type="password"
          validators={['required', 'minLength', 'noSpecialCharacters']}
          errorMessages={['Password to be provided', 'Mimumum 6 characters required', 'Special characters not permitted']}
          value={newPassword}
      />
      <BlankArea/>
      <TextValidator
          variant="outlined"
          required
          fullWidth      
          label="Repeat password"
          onChange={(event) => setRepeatPassword(event.target.value)}
          name="repeatPassword"
          type="password"
          validators={['isPasswordMatch', 'required']}
          errorMessages={['password mismatch', 'this field is required']}
          value={repeatPassword}
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
        Update
    </Button>
    </ValidatorForm>
    </div>
    <ChildComp p1={newPassword}/>    
    </Container>
  );
}
