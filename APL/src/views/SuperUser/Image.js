import React, { useEffect, useState, useContext } from 'react';
import axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
// import Switch from "@material-ui/core/Switch";
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import Select from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
// import Table from "components/Table/Table.js";
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Radio from '@material-ui/core/Radio';
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import Grid from "@material-ui/core/Grid";
import GridItem from "components/Grid/GridItem.js";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Avatar from "@material-ui/core/Avatar"
//import CardAvatar from "components/Card/CardAvatar.js";
// import { useHistory } from "react-router-dom";
// import { UserContext } from "../../UserContext";
import { getImageName } from "views/functions.js"
import {DisplayPageHeader, ValidComp, BlankArea} from "CustomComponents/CustomComponents.js"
import {red, blue } from '@material-ui/core/colors';
import { cricTeamName, encrypt } from 'views/functions';
// import {setTab} from "CustomComponents/CricDreamTabs.js"
// const rPrefix = "radio-";
const specialChars = /[!@#$%^&*()+\=\[\]{};':"\\|<>\/?]+/;


const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
    }, 
    info: {
        color: blue[700],
    },     
    header: {
        color: '#D84315',
    }, 
    error:  {
      // right: 0,
      fontSize: '12px',
      color: red[700],
      // position: 'absolute',
      alignItems: 'center',
      marginTop: '0px',
  },    
    messageText: {
          color: '#4CC417',
          fontSize: 12,
          // backgroundColor: green[700],
    },
    symbolText: {
        color: '#4CC417',
        // backgroundColor: green[700],
    },
    button: {
        margin: theme.spacing(0, 1, 0),
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      flexBasis: '33.33%',
      flexShrink: 0,
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },
  }));


export default function SU_Image() {
  const [imageType, setImageType] = useState("PLAYERIMAGE");
  const [imageTypeList, setImageTypeList] = useState(["PLAYERIMAGE", "TEAMIMAGE"]);
  const [imageName, setImageName] = useState("")
  const [playerPid, setPlayerPid] = useState(0);
  const [teamName, setTeamName] = useState("");
  const [dirName, setDirName] = useState("");
  const [fileName, setFileName] = useState("");
  //var fileInput = React.createRef();
  
  const [masterTeamList, setMasterTeamList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [currTeam, setCurrTeam] = useState("CHENNAI SUPER KINGS");
  const [playerList, setPlayerList] = useState([]);
  const [registerStatus, setRegisterStatus] = useState(0);
  const [labelNumber, setLabelNumber] = useState(0);
  const [filterPlayerList, setFilterPlayerList] = useState([]);
  const [filterPlayerName, setFilterPlayerName] = useState("");
  const classes = useStyles();
  const [playerCount, setPlayerCount] = useState(0);
  const [updatePlayer, setUpdatePlayer] = useState("");
  useEffect(() => {
      const a = async () => {
        // var tourres = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/tournament/list/enabled/`);
        // setTournamentList(tourres.data);
        // var teamres = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/team/list/`);
        // //console.log(teamres.data);  
        // setMasterTeamList(teamres.data);
        // let tmp = teamres.data.filter(x => x.tournament === tournamentName);
        // // console.log(tmp);
        // setTeamList(tmp);
      }
      a();
  }, [])

  function ShowResisterStatus() {
    // console.log(`Status is ${registerStatus}`);
    let myMsg;
    let errmsg = true;
    switch (registerStatus) {
      case 101:
        myMsg = 'Player id cannot be 0';
        break;
      case 102:
        myMsg = 'Invalid player id';
        break;
      case 111:
        myMsg = 'Team name cannot be blank';
        break;
      case 112:
        myMsg = 'Invalid team name';
        break;
      case 99:
        myMsg = `Error updating players of team ${currTeam}.`;
        break;
      case 2000:
        myMsg = `Updated ${playerList.length} players of ${currTeam}.`;
        errmsg = false;
        break;
      case 2001:
        myMsg = 'Tournament name cannot be blank';
        break;
      case 2002:
        myMsg = 'Tournament Type cannot be blank';
        break;
      case 2003:
        myMsg = 'Minimum 2 teams required for tournament';
        break;
      case 2004:
        myMsg = 'Team name cannot be blank';
        break;
      case 2005:
        myMsg = 'DUplicate Team name';
        break;
      case 2006:
        myMsg = 'DUplicate Tournamenet name';
        break;
      case 2007:
        myMsg = 'Error updating team name';
        break;
      case 2100:
        myMsg = `Selected Tournament ${tournamentName}`;
        errmsg = false;
        break;
      case 2101:
        myMsg = `Selected Team ${currTeam}`;
        errmsg = false;
        break;
      case 2102:
        myMsg = `Fetched ${playerCount} players from database`;
        errmsg = false;
        break;
      case 2103:
        myMsg = `Details of ${updatePlayer} updated`;
        errmsg = false;
        break;
      case 9001:
        myMsg = 'Player ID cannnot be zero';
        break;
      case 9002:
        myMsg = 'Player Name cannnot be blank';
        break;
      case 9003:
        myMsg = 'Duplicate Player Id';
        break;
      case 9004:
        myMsg = 'Duplicate Player Name';
        break;
      case 9005:
        myMsg = 'Player ID has to be number';
        break;
      case 9006:
        myMsg = 'Special characters found in player details';
        break;
      case 0:
        myMsg = ``;
        errmsg = false;
        break;      
      default:
        myMsg = `Unknown error code ${registerStatus}`;
        break;
    }
    let myClass = (errmsg) ? classes.error : classes.root;
    return(
      <div>
        <Typography className={myClass}>{myMsg}</Typography>
      </div>
    );
  }

  function ShowPlayerCount() {
  return (
    <Typography className={classes.root}>{`Player Count: ${playerCount}`}</Typography>
  )}


  function getPlayerLabel() {
    let newNum = labelNumber + 1;
    setLabelNumber(newNum);
    let tmp = `PLAYER${newNum}`;
    // console.log(tmp);
    return tmp;
  }
  
  const [expandedPanel, setExpandedPanel] = useState(false);
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    // console.log({ event, isExpanded });
    setExpandedPanel(isExpanded ? panel : false);
  };
  
  function ShowPlayerImage(props) {
    return(
    <Avatar variant="square" src={`${props.pid}.JPG`} className={classes.medium} />    
    )
  } 
  
  async function handleFilter(label) {
    const chkstr = document.getElementById(label).value.toUpperCase();
    //console.log(chkstr);
    if (chkstr.length > 0) {
      let resp = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/player/allfilter/${chkstr}`);
      //console.log(resp.data);
      setFilterPlayerList(resp.data)
      if (resp.data.length > 0) {
        setFilterPlayerName(resp.data[0].name);
      }
    } else {
      setFilterPlayerList([]);
    }      
  }
  
  function handleSelectPlayer(label) {
    // console.log(label);
    let newData = filterPlayerList.find(x => x.name ===filterPlayerName );
    // console.log(newData);
    document.getElementById(`PID_${label}`).value= newData.pid;
    document.getElementById(`NAME_${label}`).value= newData.name;
    document.getElementById(`ROLE_${label}`).value= newData.role;
    document.getElementById(`BAT_${label}`).value= newData.battingStyle;
    document.getElementById(`BOWL_${label}`).value= newData.bowlingStyle;
    // let nameLabel = `${props.myPlayer.label}`;
    // let roleLabel = `ROLE_${props.myPlayer.label}`;
    // let batLabel = `BAT_${props.myPlayer.label}`;
    // let bowlLabel = `BOWL_${props.myPlayer.label}`;
  }

  function ExistingPlayer(props) {
    let filterLabel=`FILTER_${props.myPlayer.label}`;
    let fPlayerLabel = `FPLAYER_${props.myPlayer.label}`;
    return (    
      <div key="existing">
      <TextField className={classes.filter} 
        variant="outlined"
        id={filterLabel} margin="none" size="small" />        
      <Button key="filterbtn" variant="contained" color="primary" size="small"
        className={classes.button} onClick={(event) => handleFilter(filterLabel)}>Filter
      </Button>
      <BlankArea />
      <Select labelId='pname' variant="outlined" required fullWidth
        label="Player" name="pname"
        id={fPlayerLabel}
        value={filterPlayerName}
        onChange={(event) => setFilterPlayerName(event.target.value)}
        >
        {filterPlayerList.map(x =>
        <MenuItem key={x.name} value={x.name}>{x.name}</MenuItem>)}
      </Select>
      <Button variant="contained" color="primary" size="small"
        onClick={() => { handleSelectPlayer(props.myPlayer.label) }}
        className={classes.button}>Select
      </Button>
    </div>      
    )
  }
  
  
      
  async function handleSubmit() {
    console.log(`Image Type is ${imageType}`);
    let myText = ""
    if (imageType === "PLAYERIMAGE") {
      if (playerPid === 0)  { setRegisterStatus(101); return; }
      try {
        await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/player/detail/${playerPid}`)
        myText = playerPid.toString();
      } catch(e) {
        console.log(e);
        setRegisterStatus(102);
        return;
      }
    } else {
      if (teamName.length === 0) { setRegisterStatus(111); return; }
      try {
        await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/team/detail/${teamName}`)
        myText = teamName
      } catch(e) {
        console.log(e);
        setRegisterStatus(112);
        return;
      }
    }
    console.log("get image of ", myText);
    try {
      let tmp = fileName.split("\\");
      tmp = encrypt(tmp[tmp.length-1]);
      await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/apl/getfile/${tmp}`);
      setRegisterStatus(200);
    } catch (e) {
      console.log(e);
      setRegisterStatus(121);
    }
  }



  //-----------------------
  // CLEAR
 


  // select tournament and filters teams of the given tournament
  function selectTournamentName(myTournament) {
    console.log(`Selected ${myTournament}`)
    let tmp = masterTeamList.filter(x => x.tournament === myTournament);
    // console.log(tmp);
    setTeamList(tmp);
    let team1 = (tmp.length > 0) ? tmp[0].name : "";
    // console.log(team1);
    setCurrTeam(team1);
    setTournamentName(myTournament);
    setPlayerList([]);
    setPlayerCount(0);
    setRegisterStatus(2100);
  }

  async function handleFetchPlayers() {
    // console.log("get Player List");
    try {
      let myURL = `${process.env.REACT_APP_AXIOS_BASEPATH}/player/tteam/${tournamentName}/${currTeam}`
      let resp = await axios.get(myURL);
      let tmp = resp.data;
      let n  = labelNumber + 1;
      tmp.forEach(ttt => {
        ttt.label = `PLAYER${n}`;
        ++n;
      })
      //console.log(n)
      setLabelNumber(n);
      // console.log(tmp);      
      setPlayerList(tmp);
      setPlayerCount(tmp.length);
      setRegisterStatus(2102);
    } catch(e) {
      console.log("In error")
    }
  }

  function selectCurrTeam(myTeam) {
    setCurrTeam(myTeam)
    setPlayerList([]);
    setPlayerCount(0);
    setRegisterStatus(2101);
  }


  function DisplayPlayer() {
    return (playerList.map(ppp =>
    <Accordion expanded={expandedPanel === ppp.label} onChange={handleAccordionChange(ppp.label)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
        <Grid container justify="center" alignItems="center" >
            <GridItem xs={9} sm={9} md={9} lg={9} >
            <Typography className={classes.heading}>{ppp.name} ({ppp.pid})</Typography>
            </GridItem>
            <GridItem xs={3} sm={3} md={3} lg={3} >
              <ShowPlayerImage pid={ppp.pid} />
            </GridItem>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <PlayerDetails myPlayer={ppp} />
      </AccordionDetails>
    </Accordion>
    ));
  }
  
  function PlayerDetails(props) {
    // let myLabel=`FILTER_${props.myPlayer.label}`;
    let pidLabel = `PID_${props.myPlayer.label}`;
    let nameLabel = `NAME_${props.myPlayer.label}`;
    let roleLabel = `ROLE_${props.myPlayer.label}`;
    let batLabel = `BAT_${props.myPlayer.label}`;
    let bowlLabel = `BOWL_${props.myPlayer.label}`;
    return (    
      <div key="existing" align="center">
      <ExistingPlayer myPlayer={props.myPlayer}/>
      <Card profile>                    
      <CardBody profile>
      <TextField className={classes.filter} 
        color="primary"
        variant="outlined"
        label="Player ID"
        id={pidLabel} margin="none" type="number"
        defaultValue={props.myPlayer.pid}  
      />        
      <BlankArea/>
      <TextField className={classes.filter} 
        color="primary"
        variant="outlined"
        label="Player Name"
        id={nameLabel} margin="none" 
        defaultValue={props.myPlayer.name}  
      />        
      <BlankArea/>
      <TextField className={classes.filter} 
        color="primary"
        variant="outlined"
        label="Player Role"
        id={roleLabel} margin="none" 
        defaultValue={props.myPlayer.role}  
      />        
      <BlankArea/>
      <TextField className={classes.filter} 
        color="primary"
        variant="outlined"
        label="Batting Style"
        id={batLabel} margin="none" 
        defaultValue={props.myPlayer.battingStyle}  
      />        
      <BlankArea/>
      <TextField className={classes.filter} 
        color="primary"
        variant="outlined"
        label="Bowling Style"
        id={bowlLabel} margin="none" 
        defaultValue={props.myPlayer.bowlingStyle}  
      />        
      <BlankArea/>
      <Grid container justify="center" alignItems="center" >
        <GridItem xs={6} sm={6} md={6} lg={6} >
          <Button variant="contained" color="primary" 
            onClick={() => { handleUpdatePlayer(props.myPlayer.label) }}
            className={classes.button}>Update
          </Button>
        </GridItem>
        <GridItem xs={6} sm={6} md={6} lg={6} >
          <Button variant="contained" color="primary" 
            onClick={() => { handleDeletePlayer(props.myPlayer.pid) }}
            className={classes.button}>Remove
          </Button>
        </GridItem>
        </Grid>
        </CardBody>
      </Card>
    </div>      
    )}

  function handleUpdatePlayer(label) {
    // console.log(label);
    let tPid = document.getElementById("PID_"+label).value.trim();
    if (isNaN(tPid)) {
      setRegisterStatus(9005);
      return;
    }
    let tName = document.getElementById("NAME_"+label).value.trim();
    if(specialChars.test(tName)){
      setRegisterStatus(9006);
      return;
    }
    let tRole = document.getElementById("ROLE_"+label).value.trim();
    if(specialChars.test(tRole)){
      setRegisterStatus(9006);
      return;
    }
    let tBat = document.getElementById("BAT_"+label).value.trim();
    if(specialChars.test(tBat)){
      setRegisterStatus(9006);
      return;
    }
    let tBowl = document.getElementById("BOWL_"+label).value.trim();
    if(specialChars.test(tBowl)){
      setRegisterStatus(9006);
      return;
    }

    let clone = [].concat(playerList);
    let myPid = parseInt(tPid);
    // check if duplicate entry
    let tTmp = clone.filter(x => x.pid === myPid);
    if (tTmp) {
      setRegisterStatus(9003);
      return;
    }
    let ppp = clone.find(x => x.label === label);
    ppp.pid = myPid; 
    ppp.name = tName;
    ppp.fullName = tName;
    ppp.role = tRole;
    ppp.battingStyle = tBat; 
    ppp.bowlingStyle = tBowl;
    //console.log(ppp);
    setUpdatePlayer(tName)
    setPlayerList(clone);
    setPlayerCount(clone.length);
    //handleAccordionChange("");
    setExpandedPanel(false);
    setRegisterStatus(2103)
    // console.log("Update player details over");
  }

  function handleDeletePlayer(pid) {
    let clone = playerList.filter(x => x.pid !== pid);
    setPlayerList(clone);
    setPlayerCount(clone.length);
    handleAccordionChange("");
  }

  var newPlayerData = {label: "", pid: 0, name: "", fullName: "", Team: "",  tournament: "",
    role: "NA", bowlingStyle:  "NA", battingStyle: "NA" 
  };


  function handleAddNewPlayer() {
    newPlayerData.pid = 0;
    newPlayerData.name = "NA"
    newPlayerData.fullName = "NA";
    newPlayerData.tournament = tournamentName;
    newPlayerData.Team = currTeam;
    let clone = [].concat(playerList);  
    newPlayerData.label = getPlayerLabel();
    //console.log(newPlayerData);
    clone.push(newPlayerData);
    setPlayerList(clone);
    setPlayerCount(clone.length);
    handleAccordionChange(newPlayerData.name);
    setExpandedPanel(true);
  }
  
  function GetImageName() {
    if (imageType == "PLAYERIMAGE") {
      return (
        <TextField
          autoComplete="fname"
          name="playerpid"
          variant="outlined"
          required
          fullWidth
          id="playerpid"
          label="Player Pid"
          autoFocus
          value={playerPid}
          type="number"
          onChange={(event) => setPlayerPid(event.target.value)}
        />
      )
    } else {
      return (
        <TextField
          autoComplete="fname"
          name="teamName"
          variant="outlined"
          required
          fullWidth
          id="teamName"
          label="Team Name"
          autoFocus
          value={teamName}
          // type="number"
          onChange={(event) => setTeamName(event.target.value)}
        />
      )
    }
  }

  /// MAIN BLOCK 2 parts
  /// 1) Get tournament, Team and fetch players
  /// 2) Display Player list
  return (
  <div className={classes.paper} align="center" key="groupinfo">
      <DisplayPageHeader headerName="Load New Image" groupName="" tournament=""/>
      <Container component="main" maxWidth="xs">
      <CssBaseline />
      <ValidatorForm className={classes.form}>  
      {/* onSubmit={handleSubmit}> */}
      <BlankArea/>
      <Select labelId='tname' id='tname'
        variant="outlined"
        required
        fullWidth
        label="Image of"
        name="iname"
        id="iname"
        value={imageType}
        inputProps={{
          name: 'Type',
          id: 'filled-age-native-simple',
        }}
        //displayEmpty 
        onChange={(event) => setImageType(event.target.value)}
      >
      {imageTypeList.map(x =>
        <MenuItem key={x} value={x}>{x}</MenuItem>)}
      </Select>
      <BlankArea/>
      <GetImageName/>
      <BlankArea/>
      <TextField
          autoComplete="fname"
          name="fileName"
          variant="outlined"
          required
          fullWidth
          id="fileName"
          label="File Name"
          autoFocus
          value={dirName}
          type="directory"
          onChange={(event) => setDirName(event.target.value)}
        />
      <BlankArea/>
      <TextField
          autoComplete="fname"
          name="fileName"
          variant="outlined"
          required
          fullWidth
          id="fileName"
          label="File Name"
          autoFocus
          value={fileName}
          type="file"
          onChange={(event) => setFileName(event.target.value)}
        />
      <BlankArea/>

      {/* <Select labelId='team' id='team'
        variant="outlined"
        required
        fullWidth
        label="Team"
        name="team"
        id="team"
        value={currTeam}
        inputProps={{
          name: 'Team',
          id: 'filled-age-native-simple',
        }}
        onChange={(event) => selectCurrTeam(event.target.value)}
      >
      {teamList.map(x =>
        <MenuItem key={x.name} value={x.name}>{x.name}</MenuItem>)}
      </Select>
      <BlankArea/>
      <Button key={"create"} variant="contained" color="primary" 
          onClick={() => { handleFetchPlayers() }}
          className={classes.button}>Fetch Players
      </Button>
      <BlankArea/>
      <DisplayPageHeader headerName="Player List" groupName="" tournament=""/>
      <BlankArea/>
      <ShowPlayerCount />
      <DisplayPlayer />
      <Typography className={classes.root}>
      <Link href="#" onClick={handleAddNewPlayer} variant="body2">Add New Player</Link>
      </Typography>
      <ShowResisterStatus/>
      <BlankArea/> */}
      <ShowResisterStatus/>
      <BlankArea/>
      <Button type="submit" key={"create"} variant="contained" color="primary" 
          onClick={() => { handleSubmit() }}
          className={classes.button}>Load Image
      </Button>
      </ValidatorForm>
      <ValidComp />   
      </Container>
  </div>
  );    
}

