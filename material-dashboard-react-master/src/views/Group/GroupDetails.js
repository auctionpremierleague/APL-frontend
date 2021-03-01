import React, {useEffect, useState ,useContext} from 'react';
// import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
// import TextField from '@material-ui/core/TextField';
// import Link from '@material-ui/core/Link';
// import { Route } from 'react-router-dom';
// import Box from '@material-ui/core/Box';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Table from "components/Table/Table.js";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { UserContext } from "../../UserContext";
import axios from "axios";
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import {red, blue, yellow } from '@material-ui/core/colors';
import { useHistory } from "react-router-dom";
import {BlankArea, DisplayPageHeader, DisplayPrizeTable, MessageToUser} from "CustomComponents/CustomComponents.js"
import { useParams } from "react-router";
// import GroupMember from "views/Group/GroupMember.js"
import { SettingsPowerSharp } from '@material-ui/icons';
import {setTab} from "CustomComponents/CricDreamTabs.js"
import { getPrizeTable, getUserBalance} from "views/functions.js"
import {CopyToClipboard} from 'react-copy-to-clipboard';


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
  heading: {
    fontSize: theme.typography.pxToRem(20),
    fontWeight: theme.typography.fontWeightBold,
    color: blue[700]
  },
  groupCode: {
    fontSize: theme.typography.pxToRem(20),
    fontWeight: theme.typography.fontWeightBold,
    color: yellow[900]
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


export default function GroupDetails() {
  const classes = useStyles();
  const history = useHistory();
  const [registerStatus, setRegisterStatus] = useState(0);
  const [franchiseeName, setFranchiseeName] = useState("");
  const [masterData, setMasterData] = useState({name: "", tournamenet: ""})
  const [minimumMemberCount, setMinimumMemberCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [memberFee, setMemberFee] = useState(50);
  const [prizeTable, setPrizeTable] = useState([]);
  const [memberCountUpdated, setMemberCountUpdated] = useState(0);
  const [memberFeeUpdated, setMemberFeeUpdated] = useState(50);

  // const [myAdminSwitch, setMyAdminSwitch] = useState(localStorage.getItem("gdAdmin") === "true");
  // const [myDefaultSwitch, setMyDefaultSwitch] = useState(localStorage.getItem("gdDefault") === "true");
  // const [myCurrentSwitch, setMyCurrentSwitch] = useState(localStorage.getItem("gdCurrent") === "true");

  const [groupCode, setGroupCode] = useState("");
  const [copyState, setCopyState] = useState({value: '', copied: false});


  const [expandedPanel, setExpandedPanel] = useState("");
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  // const { setUser } = useContext(UserContext);
  const [backDropOpen, setBackDropOpen] = React.useState(false);
  const [userMessage, setUserMessage] = React.useState("");
  const [editNotStarted, setEditNotStarted] = React.useState(true);
  const [disableEdit, setDisableEdit] = React.useState(true);
  const [editButtonText, setEditButtonText] = React.useState("Edit");
  const [memberArray, setMemberArray] = useState([]);
  const [prizeCount, setPrizeCount]  = useState(1);

  async function generatePrizeTable(mCount, mFee, pCount) {
    // console.log(`${mCount}    ${mFee}    ${pCount}`);
    let amt = mCount * mFee;
    // console.log(amt);
    let tmp = await getPrizeTable(pCount, amt)
    // console.log(tmp);
    setPrizeTable(tmp);
    // console.log("Done");
  }

  useEffect(() => {

    const updateGroupDetailData = async () => { 
      //myGroupName = window.localStorage.getItem("gdName")
      const grpResponse = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/group/info/${localStorage.getItem("gdGid")}`);
      setMasterData(grpResponse.data.info);
      // console.log(grpResponse.data.info);
      setMemberCount(grpResponse.data.info.memberCount);
      setMemberFee(grpResponse.data.info.memberFee);
      setMemberCountUpdated(grpResponse.data.info.memberCount);
      setMemberFeeUpdated(grpResponse.data.info.memberFee);
      setPrizeCount(grpResponse.data.info.prizeCount);
      //console.log(grpResponse.data.info._id);
      setCopyState({value: grpResponse.data.info._id})
      setGroupCode(grpResponse.data.info._id);
      // console.log("Calling generate prize table");
      await generatePrizeTable(grpResponse.data.info.memberCount,
        grpResponse.data.info.memberFee,
        grpResponse.data.info.prizeCount);
      setMinimumMemberCount(grpResponse.data.currentCount);
      // edit group details
      //  1) user is owner of the group
      //  2) auction status is pending
      //  2) tournament has not yet started
      if ((grpResponse.data.info.owner == localStorage.getItem("uid")) &&
          (grpResponse.data.info.auctionStatus === "PENDING") &&
          (!grpResponse.data.tournamentStarted))
        setDisableEdit(false);
      
      const sts = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/group/getfranchisename/${localStorage.getItem("uid")}/${localStorage.getItem("gdGid")}`);
      setFranchiseeName(sts.data);
      //setMasterDisplayName(sts.data);
      let memResponse = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/user/group/${localStorage.getItem("gdGid")}`);
        setMemberArray(memResponse.data);
    }
    
    updateGroupDetailData();
    
  }, [])


/**

 */






  
/***
 
  async function updateDefaultGroup(newGid) {
    let sts = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/group/setdefaultgroup/${localStorage.getItem("uid")}/${newGid}`)
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

  function DisplayEditButton() {
    return (
    <div>
      <Button variant="contained" disabled={cannotEditGroup} color="primary" className={classes.button}
        type="submit">
        {editButtonText}
      </Button>
      {/* <Button key={"members"} variant="contained" color="primary"
            className={classes.button} onClick={ShowGroupMembers}>Members
      </Button>
       <Button variant="contained" color="primary" className={classes.button}
          onClick={() => {setTab(process.env.REACT_APP_GROUP)}}
          type="cancel">
        Summary
      </Button>
      <Route  path='/admin/membergroup' component={GroupMember} key="MemberList"/>
      </div>
    );
  }

***/

  /** Display Group members */

  function DisplayGroupMembers() {
  return (
    <Table
    align="center"
    id={localStorage.getItem("gdName")}
    tableHeaderColor="warning"
    tableHead={["Member", "Franchise"]}
    tableData={memberArray.map(x => {
    const arr = [x.userName, x.displayName]
        return { data: arr, collapse: [] }
    })}
    />
  )};


  /*** Manage Franchise display and update  */
  
  async function handleFranchiseName() {
    //console.log(franchiseeName);
    await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/group/setfranchisename/${localStorage.getItem("uid")}/${localStorage.getItem("gdGid")}/${franchiseeName}`);
    //console.log("Acios success");
    // await updateFranchiseName(localStorage.getItem("gdGid"), franchiseeName);
    let clone = [].concat(memberArray);
    let myRec = clone.find(x => x.uid == localStorage.getItem("uid"));
    myRec.displayName = franchiseeName;
    //console.log(myRec);
    setMemberArray(clone);
    // setUserMessage("Successfully updated Franchise details");
    // setExpandedPanel(false);
    // setBackDropOpen(true);
    // setTimeout(() => setBackDropOpen(false), process.env.REACT_APP_MESSAGE_TIME);
    //handleAccordionChange("frachisee");
    setExpandedPanel(false);
    setRegisterStatus(1000);
  }


  function DisplayFranchise() {
    return (
      <div className={classes.filter} align="center">
        <Grid key="gr-group" container justify="center" alignItems="center" >
            <Grid item xs={9} sm={9} md={9} lg={9} >
            <TextField
              autoComplete="fname"
              name="userName"
              variant="outlined"
              fullWidth
              id="userName"
              label="Franchise Name"
              autoFocus
              defaultValue={franchiseeName}
              onChange={(event) => setFranchiseeName(event.target.value)}
            />
            </Grid>
            <Grid item xs={3} sm={3} md={3} lg={3} >
            <Button key="filterbtn" variant="contained" color="primary" size="small"
              className={classes.button} onClick={handleFranchiseName}>Update
            </Button>
            </Grid>
        </Grid>
        <MessageToUser mtuOpen={backDropOpen} mtuClose={setBackDropOpen} mtuMessage={userMessage} />
      </div>
    );
  }

  /***  Prize count and amount  */

  async function writePrizeCout(count) {
    let sts = true;
    try {
      let myURL = `${process.env.REACT_APP_AXIOS_BASEPATH}/group/updateprizecount/${localStorage.getItem("gdGid")}/${localStorage.getItem("uid")}/${count}`;
      let resp = await axios.get(myURL);
      setPrizeCount(count);
      // console.log(`Set prize count to ${count}`);
      await generatePrizeTable(memberCountUpdated, memberFeeUpdated, count);
    } catch (e) {
      console.log(e)
      sts = false;  //setRegisterStatus(3001);
    }
    return sts;
  }

  async function handlePrizeCountChange(event) {
    let newPrizeCount = parseInt(event.target.value);
    // console.log(`New selected prize count is ${newPrizeCount}`)
    let sts = await writePrizeCout(newPrizeCount);
    if (sts) {
      setRegisterStatus(3000);
    } else {
      setRegisterStatus(3001);
    }
  }

  
  function DisplayPrizeRadio(props) {
    let inumber = parseInt(props.number);
    //console.log(`${inumber}  and ${prizeCount}`);
    let disableRadio = true;
    //console.log(`Updated member count ${memberCountUpdated}`);
    // console.log(`${disableEdit} ${inumber}   ${prizeCount} ${memberCountUpdated} `)
    if (!disableEdit) {
      if ((inumber <= memberCountUpdated) && (inumber <= 5))
      // if (prizeCount <= inumber)
        disableRadio = false;
    }
    // console.log(disableRadio);
    return(
      <FormControlLabel
      value={props.number} label={props.number} color="primary" labelPlacement="end" disabled={disableRadio} checked={prizeCount == inumber}
      control={<Radio size="small" color="primary" />}
      />
    );
  } 
  
  function DisplayPrize() {
  // generatePrizeTable(memberCount, memberFee, prizeCount);
  return (
    <div align="center">
    <RadioGroup aria-label="position" name="position" value={prizeCount} onChange={handlePrizeCountChange} row>
      <DisplayPrizeRadio number="1"/>
      <DisplayPrizeRadio number="2"/> 
      <DisplayPrizeRadio number="3"/>
      <DisplayPrizeRadio number="4"/>
      <DisplayPrizeRadio number="5"/>
    </RadioGroup>
    <DisplayPrizeTable tableName={prizeTable}/>
    </div>
  )}

  /** Group details */

  async function handleGroupSubmit()  {
    if (editNotStarted) {
      // console.log("Enable Edit");
      setEditNotStarted(false);
      setEditButtonText("Update");
      setRegisterStatus(0);
    } else {
      // console.log("in update mode")
      try {
        let myURL = `${process.env.REACT_APP_AXIOS_BASEPATH}/group/updatewithoutfee/${localStorage.getItem("gdGid")}/${localStorage.getItem("uid")}/${memberCount}`;
        let resp = await axios.get(myURL);
        setMemberCountUpdated(memberCount);
        if (prizeCount > memberCount) {
          writePrizeCout(memberCount);
          //setPrizeCount(memberCount);
        }
        setRegisterStatus(2000);
        setEditNotStarted(true);
        setExpandedPanel(false);
      } catch (e) {
        console.log(e)
        setRegisterStatus(2001);
      }
      setEditButtonText("Edit");
    }
  }

  function ShowResisterStatus() {
    let myMsg;
    let isError = true;
    switch (registerStatus) {
      case 999:
        myMsg = "Group Details Update not yet implemneted";
        break;
      case 1000:
        myMsg = "Successfully updated Franchisee details";
        isError = false;
        break;
        case 2000:
        myMsg = "Successfully update group details";
        isError = false;
        break;
      case 0:
        myMsg = "";
        isError = false;
        break;
      case 2001:
        myMsg = "Error updating group details";
        break;
      case 3000:
        myMsg = "Successfully update Prize Count";
        isError = false;
        break;
      case 3001:
        myMsg = "Error updating Prize Count";
        break;
      case 200:
        myMsg = `User ${userName} successfully regisitered.`;
        break;
      case 602:
        myMsg = "User Name already in use";
        break;
      case 603:
        myMsg = "Email id already in use";
        break;
      default:
          myMsg = `Unknown Error ${registerStatus}`;
          break;
    }
    return(
        <Typography className={(isError) ? classes.error : classes.root}>{myMsg}</Typography>
    )
  }

  function DisplayGroupCode() {
    let myText = copyState.value
    // console.log("in group code");
    return (
        <div>
          <Typography className={classes.groupCode}>{groupCode}</Typography>
          <BlankArea/>
          <CopyToClipboard text={myText}
              onCopy={() => setCopyState({copied: true})}>
              <button>Copy to clipboard</button>
          </CopyToClipboard>
          {copyState.copied ? <span style={{color: 'blue'}}>Copied.</span> : null}
        </div>       
      )
  }

  function DisplayGroupDetails() {
  let minNumber = `minNumber:${minimumMemberCount}`;
  let minMessage = `Group members cannot be less than ${minimumMemberCount}`
  return(
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
      <ValidatorForm className={classes.form} onSubmit={handleGroupSubmit}>
      <TextValidator
          variant="outlined"
          required
          fullWidth      
          label="Group Name"
          name="username"
          disabled
          value={masterData.name}
      />
      <BlankArea/>
      <TextValidator
          variant="outlined"
          required
          fullWidth      
          label="Tournament"
          name="tournament"
          disabled
          value={masterData.tournament}
      />
      <BlankArea/>
      <TextValidator
          variant="outlined"
          required
          fullWidth      
          // size="small"  
          label="Member Count"
          onChange={(event) => setMemberCount(event.target.value)}
          name="membercount"
          type="number"
          validators={['required', minNumber, 'maxNumber:25']}
          errorMessages={['Member count to be provided', minMessage, 'Group members cannot be more than 25']}
          disabled={editNotStarted}
          value={memberCount}
      />
      <BlankArea/>
      <TextValidator
          variant="outlined"
          required
          fullWidth    
          // size="small"  
          label="MemberFee"
          //onChange={(event) => setMemberFee(event.target.value)}
          name="membercount"
          type="number"
          //validators={['required', 'minNumber:50']}
          //errorMessages={['Member count to be provided', 'Member fee cannot be less than 50']}
          disabled
          value={memberFee}
      />
      <BlankArea/>
      <Button 
        type="submit"
        fullwith
        variant="contained" 
        color="primary"
        disabled={disableEdit}  
        className={classes.button}
      >
        {editButtonText}
      </Button>
    </ValidatorForm>
    </div>
    {/* <ValidComp />     */}
    </Container>
  )}

  function DisplayAccordian() {
  return (
    <div>
    <Accordion expanded={expandedPanel === "frachisee"} onChange={handleAccordionChange("frachisee")}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
            <Typography className={classes.heading}>Update Franchise</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <DisplayFranchise />
        </AccordionDetails>
    </Accordion>
    <Accordion expanded={expandedPanel === "group"} onChange={handleAccordionChange("group")}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
            <Typography className={classes.heading}>Group Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <DisplayGroupDetails />
        </AccordionDetails>
    </Accordion>
    <Accordion expanded={expandedPanel === "prize"} onChange={handleAccordionChange("prize")}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
            <Typography className={classes.heading}>Prize Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
        <DisplayPrize />
      </AccordionDetails>
    </Accordion>
    <Accordion expanded={expandedPanel === "members"} onChange={handleAccordionChange("members")}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
            <Typography className={classes.heading}>Member List</Typography>
        </AccordionSummary>
        <AccordionDetails>
        <DisplayGroupMembers />
      </AccordionDetails>
    </Accordion>
    <Accordion expanded={expandedPanel === "code"} onChange={handleAccordionChange("code")}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
            <Typography className={classes.heading}>Group Code</Typography>
        </AccordionSummary>
        <AccordionDetails>
        <DisplayGroupCode />
      </AccordionDetails>
    </Accordion>
    </div>
  )}

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper} align="center">
        <DisplayPageHeader headerName="Group Details" groupName={masterData.name} tournament={masterData.tournament}/>
        <BlankArea />
        <DisplayAccordian />
        <ShowResisterStatus/>
      </div>
    </Container>
  );
}

