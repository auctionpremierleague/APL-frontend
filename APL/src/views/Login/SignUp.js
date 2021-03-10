import React, { useState ,useContext} from 'react';
// import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
// import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
// import { Switch, Route } from 'react-router-dom';
// import Grid from '@material-ui/core/Grid';
// import Box from '@material-ui/core/Box';
//import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
//import { UserContext } from "../../UserContext";
//import axios from "axios";
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import red from '@material-ui/core/colors/red';
// import { useHistory } from "react-router-dom";
// import SignIn from "./SignIn.js";
import { cdRefresh, encrypt, decrypt} from "views/functions.js";
import { CricDreamLogo, BlankArea, ValidComp } from 'CustomComponents/CustomComponents.js';


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

/*** 
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
***/
// const handleSubmit = e => {
//   e.preventDefault();
// };



export default function SignUp() {
  const classes = useStyles();
  // const history = useHistory();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [registerStatus, setRegisterStatus] = useState(199);

  // const { setUser } = useContext(UserContext);

  // const handleChange = (event) => {
  //   const { user } = this.state;
  //   user[event.target.name] = event.target.value;
  //   this.setState({ user });
  // }

  const handleSubmit = async() => {
    console.log("Submit command provided");
    let tmp1 = encrypt(password);
    let tmp2 = encrypt(email);
    let response = await fetch(`${process.env.REACT_APP_AXIOS_BASEPATH}/user/cricsignup/${userName}/${tmp1}/${tmp2}`);
    if (response.status === 200) {
      let setemailresp = await fetch(`${process.env.REACT_APP_AXIOS_BASEPATH}/user/cricemailwelcome/${tmp2}`);
      // history.push("/signin");
      localStorage.setItem("currentLogin", "SIGNIN");
      cdRefresh();

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
      case 199:
        myMsg = "";
        break;
      case 200:
        // setUserName("");
        // setPassword("");
        // setRepeatPassword("");
        // setEmail("");
        myMsg = `User ${userName} successfully regisitered.`;
        break;
      case 602:
        myMsg = "User Name already in use";
        break;
      case 603:
        myMsg = "Email id already in use";
        break;
      default:
          myMsg = "Unknown Error";
          break;
    }
    return(
      <div>
        <Typography className={(registerStatus === 200) ? classes.root : classes.error}>{myMsg}</Typography>
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
        <Typography component="h1" variant="h5">
          Register New User
        </Typography>
    <ValidatorForm className={classes.form} onSubmit={handleSubmit}>
      <TextValidator
          variant="outlined"
          required
          fullWidth      
          label="User Name"
          onChange={(event) => setUserName(event.target.value)}
          name="username"
          // type=""
          validators={['required', 'minLength', 'noSpecialCharacters']}
          errorMessages={['User Name to be provided', 'Mimumum 6 characters required', 'Special characters not permitted']}
          value={userName}
      />
      <BlankArea/>
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
      <BlankArea/>
      <TextValidator
          variant="outlined"
          required
          fullWidth      
          label="Password"
          onChange={(event) => setPassword(event.target.value)}
          name="password"
          type="password"
          validators={['required', 'minLength', 'noSpecialCharacters']}
          errorMessages={['Password to be provided', 'Mimumum 6 characters required', 'Special characters not permitted']}
          value={password}
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
      <BlankArea/>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
      >
        Register
    </Button>
    </ValidatorForm>
    <ShowResisterStatus/>
    </div>
    <ValidComp p1={password}/>    
    <Typography className={classes.root}>
      <Link href="#" onClick={handleLogin} variant="body2">
        Already have an account? Sign in
      </Link>
    </Typography>
    {/* <Switch>
      <Route  path='/admin/signin' component={SignIn} key="MemberList"/>
    </Switch> */}
    </Container>
  );
}
