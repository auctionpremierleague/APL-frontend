import React, { useState ,useContext} from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import red from '@material-ui/core/colors/red';
import { useHistory } from "react-router-dom";
import {ValidComp, BlankArea, CricDreamLogo} from "CustomComponents/CustomComponents.js"
import {encrypt} from "views/functions.js"
import { SettingsCellOutlined } from '@material-ui/icons';
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


export default function ContactUs() {
  const classes = useStyles();
  // const history = useHistory();
  const [feedback, setFeedback] = useState("");
  const [feedbackCode, setFeedbackCode] = useState("");
  const [registerStatus, setRegisterStatus] = useState(0);

  const handleSubmit = async() => {
    let tmp1 = encrypt(feedback);
    console.log(tmp1);

    try {
      let response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/apl/feedback/${localStorage.getItem("uid")}/${tmp1}`);
      setFeedbackCode(response.data);
      //console.log(response);
      setRegisterStatus(200);
    } catch (e) {
      // console.log(response.status);
      console.log(e);
      setRegisterStatus(1001);
    }

    
  }

  
  function ShowResisterStatus() {
    let myMsg;
    switch (registerStatus) {
      case 0:
        myMsg = ``;
        break;
      case 200:
        myMsg = `Reference code ${feedbackCode}`;
        break;
      case 1001:
        myMsg = `Error sending feedback`;
        break;
      default:
        myMsg = "Unknown Error";
        break;
  }
  return(
    <div>
      <Typography className={(registerStatus === 200) ? classes.root : classes.error}>{myMsg}</Typography>
    </div>
  )}


  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
      {/* <CricDreamLogo /> */}
      {/* <Avatar className={classes.avatar}>
        <LockOutlinedIcon />
      </Avatar> */}
      <Typography component="h1" variant="h5">Contact Us</Typography>
      <br/>
      <p className={classes.textData}>Have any issue or suggestion</p>
      <p className={classes.textData}>Kindly provide the details to Auction Permier League</p>
      <ValidatorForm className={classes.form} onSubmit={handleSubmit}>
      <TextValidator
          variant="outlined"
          required
          fullWidth
          multiline      
          label="Feedback"
          onChange={(event) => setFeedback(event.target.value)}
          name="Feedback"
          type="Feedback"
          value={feedback}
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
