import React, {useEffect, useState ,useContext} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
// import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import { Route } from 'react-router-dom';
// import Grid from '@material-ui/core/Grid';
// import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { UserContext } from "../../UserContext";
import axios from "axios";
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import red from '@material-ui/core/colors/red';
import blue from '@material-ui/core/colors/blue';
import { useHistory } from "react-router-dom";
import {validateSpecialCharacters, validateEmail} from "views/functions.js";
import {BlankArea, DisplayPageHeader, MessageToUser} from "CustomComponents/CustomComponents.js"
import { useParams } from "react-router";
import GroupMember from "views/Group/GroupMember.js"
import { SettingsPowerSharp } from '@material-ui/icons';
import {setTab} from "CustomComponents/CricDreamTabs.js"

// const [myGroupName, setMyGroupName] = useState("");

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
  groupName:  {
    // right: 0,
    fontSize: '12px',
    color: blue[700],
    // position: 'absolute',
    alignItems: 'center',
    marginTop: '0px',
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

var myGroupName = "";

class ChildComp extends React.Component {

  componentDidMount()  {
    // custom rule will have name 'isPasswordMatch'
    // ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
    //   return (value === this.props.p1)
    // });

    // ValidatorForm.addValidationRule('minLength', (value) => {
    //   return (value.length >= 6)
    // });

    ValidatorForm.addValidationRule('noSpecialCharacters', (value) => {
      return validateSpecialCharacters(value);
    });

    // ValidatorForm.addValidationRule('isEmailOK', (value) => {
    //   return validateEmail(value);
    // });
  }

  
  componentWillUnmount() {
    // remove rule when it is not needed
    // ValidatorForm.removeValidationRule('isPasswordMatch');
    // ValidatorForm.removeValidationRule('isEmailOK');
    // ValidatorForm.removeValidationRule('minLength');
    ValidatorForm.removeValidationRule('noSpecialCharacters');   
  }

  render() {
    return <br/>;
  }

}


export default function GroupDetails() {
const classes = useStyles();
const history = useHistory();
const [registerStatus, setRegisterStatus] = useState(0);

const [franchiseeName, setFranchiseeName] = useState("");
//const [masterDisplayName, setMasterDisplayName] = useState("");

const [myAdminSwitch, setMyAdminSwitch] = useState(localStorage.getItem("gdAdmin") === "true");
const [myDefaultSwitch, setMyDefaultSwitch] = useState(localStorage.getItem("gdDefault") === "true");
const [myCurrentSwitch, setMyCurrentSwitch] = useState(localStorage.getItem("gdCurrent") === "true");

// const { setUser } = useContext(UserContext);
const [backDropOpen, setBackDropOpen] = React.useState(false);
const [userMessage, setUserMessage] = React.useState("");


  useEffect(() => {

    const updateGroupDetailData = async () => { 
      //myGroupName = window.localStorage.getItem("gdName")
      const sts = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/group/getfranchisename/${localStorage.getItem("uid")}/${localStorage.getItem("gdGid")}`);
      setFranchiseeName(sts.data);
      //setMasterDisplayName(sts.data);

      // setMyAdminSwitch(window.localStorage.getItem("gdAdmin") === "true");
      // setMyCurrentSwitch(window.localStorage.getItem("gdCurrent") === "true");
      // setMasterCurrentSwitch(window.localStorage.getItem("gdCurrent").toLowerCase() === "true");
      // setMyDefaultSwitch(window.localStorage.getItem("gdDefault") === "true");
      // setMasterDefaultSwitch(window.localStorage.getItem("gdDefault").toLowerCase() === "true");
    }
  
    updateGroupDetailData();
    
  }, [])

  async function updateFranchiseName(newGid, newName) {
    let sts = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/group/setfranchisename/${localStorage.getItem("uid")}/${newGid}/${newName}`);
  }


  async function updateDefaultGroup(newGid) {
    let sts = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/group/setdefaultgroup/${localStorage.getItem("uid")}/${newGid}`)
  }

  const handleSubmit = async() => {
  }


  function ShowResisterStatus() {
    let myMsg;
    switch (registerStatus) {
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
          myMsg = "";
          break;
    }
    return(
        <Typography className={(registerStatus === 200) ? classes.root : classes.error}>{myMsg}</Typography>
    )
  }

  function AdminSwitch() {
    return (
        <Typography component="div">GroupAdmin: 
         <Switch color="primary" checked={myAdminSwitch} name="adminSw" inputProps={{ 'aria-label': 'primary checkbox' }}/>
        </Typography>
    )
  }

  function handleCurrent() {
    //   console.log(myCurrentSwitch);
    if (!myCurrentSwitch) {
        // var myElement;
        // window.localStorage.setItem("gdGid", ggg.gid.toString());
        // window.localStorage.setItem("gdName", ggg.groupName)
        // window.localStorage.setItem("gdDisplay", ggg.displayName)
        // window.localStorage.setItem("gdAdmin", ggg.admin.toString());
        // window.localStorage.setItem("gdCurrent", (newCurrentGroup === ggg.groupName) ? "true" : "false");
        // window.localStorage.setItem("gdDefault", ggg.defaultGroup.toString());
        // window.localStorage.setItem("gdTournament", ggg.tournament);
        localStorage.setItem("gid", localStorage.getItem("gdGid"));
        localStorage.setItem("groupName", localStorage.getItem("gdName"));
        // localStorage.setItem("displayName", franchiseeName);
        localStorage.setItem("tournament", localStorage.getItem("gdTournament"));
        localStorage.setItem("admin", localStorage.getItem("gdAdmin"))
        // setUser({ uid: localStorage.getItem("uid"), admin: (localStorage.getItem("admin").toLowerCase() === "true")})    
        setMyCurrentSwitch(true);
    }
  }

  function CurrentSwitch() {
    return (
        <Typography component="div">Set Current : 
        <Switch color="primary" checked={myCurrentSwitch} onChange={handleCurrent} name="adminSw" inputProps={{ 'aria-label': 'primary checkbox' }}/>
        </Typography>
    )
  }

  async function handleDefault() {
    if (!myDefaultSwitch) {
      await updateDefaultGroup(localStorage.getItem("gdGid"));
      setMyDefaultSwitch(true);
    }
  }

  function DefaultSwitch() {
      return (
          <Typography component="div">Set Default : 
          <Switch color="primary" checked={myDefaultSwitch} onChange={handleDefault} name="adminSw" inputProps={{ 'aria-label': 'primary checkbox' }}/>
          </Typography>
      );
}

  function DisplaySwitch() {
    return (
      <div>
        <AdminSwitch />
        <CurrentSwitch />
        <DefaultSwitch />
      </div>
    )
  }

  function ShowGroupMembers() {
    // history.push("/admin/membergroup");        
    setTab(103);
  };

  function DisplayButtons() {
    return (
    <div>
      {/* <Button variant="contained" color="primary" className={classes.button}
        type="submit">
        Update
      </Button> */}
      <Button key={"members"} variant="contained" color="primary"
            className={classes.button} onClick={ShowGroupMembers}>Members
      </Button>
      {/* <Button variant="contained" color="primary" className={classes.button}
          onClick={() => {setTab(0)}}
          type="cancel">
        Done
      </Button>
      <Route  path='/admin/membergroup' component={GroupMember} key="MemberList"/> */}
      </div>
    );
  }

  function DisplayHeader() {
    return (
      <div align="center">
        <Typography component="h1" variant="h5">Group Details</Typography>
        <DisplayGroupName groupName={myGroupName}/>
      </div>
    );
  }

  async function handleFranchiseName() {
    const newName = document.getElementById("franchise").value;
    if (newName !== franchiseeName) {
      // console.log(`New display name ${newName}`);
      setFranchiseeName(newName);
      await updateFranchiseName(localStorage.getItem("gdGid"), newName);
      setUserMessage("Successfully updated Franchise details");
      setBackDropOpen(true);
      setTimeout(() => setBackDropOpen(false), process.env.REACT_APP_MESSAGE_TIME);
    }

  }

  function DisplayFranchise() {
    // console.log(`Frnachise is ${franchiseeName}`);
    return (
      <div className={classes.filter} align="center">
        <TextField className={classes.filter} id="franchise" margin="none" size="small" defaultValue={franchiseeName}/>        
        <Button key="filterbtn" variant="contained" color="primary" size="small"
          className={classes.button} onClick={handleFranchiseName}>set Franchise
        </Button>
        <MessageToUser mtuOpen={backDropOpen} mtuClose={setBackDropOpen} mtuMessage={userMessage} />
      </div>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper} align="center">
        {/* <DisplayHeader/> */}
    <DisplayPageHeader headerName="Group Details" groupName={localStorage.getItem("gdName")} tournament={localStorage.getItem("gdTournament")}/>
     <BlankArea/>
    <ValidatorForm className={classes.form} onSubmit={handleSubmit}>
      <DisplayFranchise/>
      {/* <TextValidator
          variant="outlined"
        //   required
          fullWidth      
          label="Franchise Name"
          onChange={(event) => setFranchiseeName(event.target.value)}
          name="displayname"
          validators={['noSpecialCharacters']}
          errorMessages={['Special characters not permitted']}
          value={franchiseeName}
      /> */}
      <BlankArea/>
      <DisplaySwitch/>
      <BlankArea/>
      <ShowResisterStatus/>
      <DisplayButtons/>
    </ValidatorForm>
    </div>
    {/* <ChildComp />     */}
    </Container>
  );
}

