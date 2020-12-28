import React, { useState ,useContext, useEffect} from 'react';
import axios from "axios";
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
// import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import { useHistory } from "react-router-dom";
import {BlankArea, NothingToDisplay, DisplayBalance} from "CustomComponents/CustomComponents.js"
import {red, blue} from '@material-ui/core/colors';
import {setTab} from "CustomComponents/CricDreamTabs.js"
import {getUserBalance} from "views/functions.js"

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
  button: {
    margin: theme.spacing(0, 1, 0),
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


export default function JoinGroup() {
  const classes = useStyles();
  const history = useHistory();
  const [registerStatus, setRegisterStatus] = useState(0);
  // const [ errorMsg, setErrorMessage ] = useState("");
  const [groupCode, setGroupCode] = useState(localStorage.getItem("joinGroupCode"));
  const [balance, setBalance] = useState(0);

  console.log(localStorage.getItem("joinGroupCode"));
  // setTab(0); 
  useEffect(() => {
    const a = async () => {
      // var balres = await axios.get(`/wallet/balance/${localStorage.getItem("uid")}`);
      // setBalance(balres.data.balance);
      let myBalance = await getUserBalance();
      setBalance(myBalance);
    };    
    a();
  }, []);


  const handleSubmit = async() => {
    console.log("Submit command provided");
    try {
      let response = await axios.get(`/group/join/${groupCode}/${localStorage.getItem("uid")}`);
      console.log("Group Join Success");
      let myBalance = await getUserBalance();
      setBalance(myBalance);
      setTab(parseInt(process.env.REACT_APP_BASEPOS) + parseInt(process.env.REACT_APP_GROUP));
      //setTab(0);
    } catch (err) {
        setRegisterStatus(err.response.status);
    }
  }


  function ShowResisterStatus() {
    let myMsg;
    let myClass = classes.error;
    console.log(`error code ${registerStatus}`);
    switch (registerStatus) {
      case 200:
        myMsg = `User successfully regisitered with group code ${groupCode}.`;
        myClass = classes.root;
        break;
      case 0:
          myMsg = "";
          myClass = classes.root;
          break;
        case 611:
        myMsg = "Invalid Group Code";
        break;
      case 612:
        myMsg = "Already member of this group";
        break;
      case 613:
        myMsg = "Invalid User";
        break;
      case 614:
        myMsg = "Cannot join group. Auction has already started.";
        break;
      case 615:
        myMsg = "Insufficient balance.";
        break;
      case 616:
        myMsg = "No room for new member.";
        break;
      default:
        myMsg = "unknown error";
        break;
    }
    return(
      <div>
        <Typography className={myClass}>{myMsg}</Typography>
      </div>
    );
  }

  
  return (
    <Container component="main" maxWidth="xs">
      <DisplayBalance balance={balance} />
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">Join Group</Typography>
    <ValidatorForm className={classes.form} onSubmit={handleSubmit}>
      <TextValidator
          variant="outlined"
          required
          fullWidth      
          label="Group Code"
          onChange={(event) => setGroupCode(event.target.value)}
          name="groupcode"
          // type=""
          // validators={['required']}
          // errorMessages={['Group code to be provided']}
          value={groupCode}
      />
      <ShowResisterStatus/>
      <BlankArea/>
      <div align="center">
        <Button type="submit" key={"create"} variant="contained" color="primary" size="small"
            className={classes.button}>Submit
        </Button>
      </div>
    </ValidatorForm>
    </div>
    </Container>
  );
}
