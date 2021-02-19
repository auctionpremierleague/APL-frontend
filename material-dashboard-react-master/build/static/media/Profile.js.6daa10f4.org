import React, { useEffect, useState } from 'react';
import axios from "axios";
import Table from "components/Table/Table.js";
import Grid from "@material-ui/core/Grid";
import GridItem from "components/Grid/GridItem.js";
// import Card from "components/Card/Card.js";
// import CardBody from "components/Card/CardBody.js";
import Button from '@material-ui/core/Button';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core/styles';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
// import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import {BlankArea, DisplayPageHeader, MessageToUser} from "CustomComponents/CustomComponents.js"
import {validateSpecialCharacters, validateEmail} from "views/functions.js";
import { red, blue } from '@material-ui/core/colors';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
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
  noerror:  {
    // right: 0,
    fontSize: '12px',
    color: blue[700],
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


export default function Profile() { 
  const classes = useStyles();

  useEffect(() => {
    const profileInfo = async () => {
      try {
        // get user details
        var userRes = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/user/profile/${localStorage.getItem("uid")}`);
        setUserDetails(userRes.data); // master data for comparision if changed by user
        setLoginName(userRes.data.loginName);
        setUserName(userRes.data.userName);
        setDefaultGroup(userRes.data.defaultGroup);
        setEmail(userRes.data.email);
        setPassword(userRes.password);

        // get wallet transaction and also calculate balance
        var response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/wallet/details/${localStorage.getItem("uid")}`);
        setTransactions(response.data);
        let myBalance = response.data.reduce((accum,item) => accum + item.amount, 0);
        setBalance(myBalance);
      } catch (e) {
          console.log(e)
      }
    }
    profileInfo();
  }, []);

  
  const [expandedPanel, setExpandedPanel] = useState("profile");
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loginName, setLoginName] = useState("");
  const [userName, setUserName] = useState("");
  const [defaultGroup, setDefaultGroup] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [registerStatus, setRegisterStatus] = useState(0);

  function handleProfileSubmit() {
    console.log("Profile Submit");
  }

  function ShowResisterStatus() {
    // console.log(`Status is ${registerStatus}`);
    let myMsg;
    switch (registerStatus) {
      case 0:
        myMsg = "";
        break;
      case 1:
        myMsg = "Profile Successfully updated";
        break;
      case 2:
        myMsg = "Password Successfully updated";
        break;
      case 101:
        myMsg = `Email ${email} already in use`;
        break;
      case 201:
        myMsg = `Incorrect current password`;
        break;
      case 202:
        myMsg = "Incorrect New Password";
        break;
      case 203:
        myMsg = "New password same as old Password.";
        break;
    }
  
    return(
      <Typography className={(registerStatus < 100) ? classes.noerror : classes.error}>{myMsg}</Typography>
    )
  }

  function DisplayChangePassword() {
    return (
      <div>
        <h6>Chnage Password to be implemented</h6>
      </div>
    );
  }

  function DisplayUserData() {
    return (
    <div align="center">
    < ValidatorForm className={classes.form} onSubmit={handleProfileSubmit}>
      <TextValidator
        variant="outlined"
        required
        fullWidth      
        label="User Name"
        onChange={(event) => setUserName(event.target.value)}
        name="username"
        //validators={['required', 'minLength', 'noSpecialCharacters']}
        //errorMessages={['User Name to be provided', 'Mimumum 6 characters required', 'Special characters not permitted']}
        value={userName}
      />
      <BlankArea/>
      <TextValidator
          variant="outlined"
          fullWidth      
          readonly
          label="Default Group (read-only)"
          name="defaultgroup"
          value={defaultGroup}
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
      <ShowResisterStatus />
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
  );
}

  function ShowProfile() {  
      return (
      <div>
      <Accordion expanded={expandedPanel === "profile"} onChange={handleAccordionChange("profile")}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography className={classes.heading}>Login Name: {loginName}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DisplayUserData />
          </AccordionDetails>
      </Accordion>
      <Accordion expanded={expandedPanel === "password"} onChange={handleAccordionChange("password")}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography className={classes.heading}>Change Password</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DisplayChangePassword />
          </AccordionDetails>
      </Accordion>
      <Accordion expanded={expandedPanel === "wallet"} onChange={handleAccordionChange("wallet")}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography className={classes.heading}>Wallet Balance: {balance}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Table
                tableHeaderColor="warning"
                tableHead={["Date", "Type", "Amount"]}
                tableData={transactions.map(tRec => {
                    const arr = [tRec.date, tRec.type, tRec.amount]
                    return { data: arr, collapse: [] }
                })}
            />
        </AccordionDetails>
      </Accordion>
      </div>
      );
  }



  return (
    <div className={classes.root}>
      <ShowProfile/>
      <ChildComp p1={password}/>    
    </div>
  );
};


