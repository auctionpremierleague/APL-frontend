import React, { useEffect, useState, useContext } from 'react';
import axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
// import DialogTitle from '@material-ui/core/DialogTitle';
// import Dialog from '@material-ui/core/Dialog';


import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import MenuItem from '@material-ui/core/MenuItem';

// import FormControl from '@material-ui/core/FormControl';


// import DoneIcon from '@material-ui/icons/Done';

import Select from "@material-ui/core/Select";
import Button from '@material-ui/core/Button';
// import Table from "components/Table/Table.js";
// import Grid from "@material-ui/core/Grid";
// import GridItem from "components/Grid/GridItem.js";
// import Card from "components/Card/Card.js";
// import CardBody from "components/Card/CardBody.js";


import { UserContext } from "../../UserContext";

const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
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



export default function ImgMediaCard() {

    window.onbeforeunload = () => setUser(null)

    const { setUser } = useContext(UserContext);
    const classes = useStyles();
    // const theme = useTheme();
    // const [open, setOpen] = useState(false);
    // const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    // const [selectedOwner, setSelectedOwner] = useState(null);

    // const [backDropOpen, setBackDropOpen] = useState(false);
    // const [playerStatus, setPlayerStatus] = useState();
    const [captainTableData, setCaptainTableData] = useState([{desc: "Captain", name: ""},
        {desc: "ViceCaptain", name: ""}]);
    const [myTeamTableData, setMyTeamTableData] = useState([]);
    const [isUserMemberOfGroup, setGroupMember] = useState(false);
    const [tournamentStated, setTournamentStarted] = useState(false);
    // const [selectWhat, setSelectWhat] = useState("Captain");
    // const [selectedPlayerValue, setSelectedPlayerValue] = useState("");

    useEffect(() => {
        const a = async () => {
            // get start of tournamnet (i.e. start of 1st match)
            var gameStarted = false;  
            var mygroup  = localStorage.getItem("gid")
            if  ((mygroup === "") || (mygroup === "0")) {
                // handle if not a member of any group
                setGroupMember(false);
                setTournamentStarted(false);
                console.log("Not a member of group. No cap/vice cap")
                return;
            }
          

            // user belong to group. get cpation / vice captian alreasy set
            // let response = ""
            console.log("Calling getcaptain")
            var response = await axios.get(`/user/getcaptain/${mygroup}/${localStorage.getItem("uid")}`);
            // var isGroupMember = false;
            if (response.data.length > 0) {
                captainTableData[0].name = response.data[0].captainName;
                captainTableData[1].name = response.data[0].viceCaptainName;
            }

            response = await axios.get(`/group/gamestarted/${localStorage.getItem("gid")}`);
            gameStarted = (response.data.length > 0);
            // gameStarted = false;
            if (!gameStarted) {
                // get list of player purchased by user for aelecting captain / vice captain
                var myUrl = `/user/myteamwos/${mygroup}/${localStorage.getItem("uid")}`;
                const teamResponse = await axios.get(myUrl);
                setMyTeamTableData(teamResponse.data[0].players);
            }         
            setCaptainTableData(captainTableData);
            setTournamentStarted(gameStarted);
            //setTournamentStarted(false);  // for testing
            setGroupMember(true);

        }

        a();
    }) 

    
    function CvcSummary(props) {
        return (
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
        <Typography className={classes.heading}>{props.desc}</Typography>
        <Typography className={classes.secondaryHeading}>{props.name}</Typography>
        </AccordionSummary>
        );
    }

    const [expandedPanel, setExpandedPanel] = useState(false);
    const handleAccordionChange = (panel) => (event, isExpanded) => {
      setExpandedPanel(isExpanded ? panel : false);
    };
    const [selectedCaptain, SetSelectedCaptain] = useState("");
    const handleSelectedCaptain = (event) => {
        SetSelectedCaptain(event.target.value);
    };
    const [selectedViceCaptain, SetSelectedViceCaptain] = useState("");
    const handleSelectedViceCaptain = (event) => {
        SetSelectedViceCaptain(event.target.value);
    };

    function updateCaptain() {
        captainTableData[0].name = selectedCaptain;
        console.log(captainTableData);
        setCaptainTableData(captainTableData);
        setExpandedPanel(false);
    }

    function updateViceCaptain() {
        captainTableData[1].name = selectedViceCaptain;
        console.log(captainTableData);
        setCaptainTableData(captainTableData);
        setExpandedPanel(false);
    }

    function DisplayCaptainSelectButton() {
        if (tournamentStated) {
            return (<div></div>)
        } else {
            return (
                <div>
                <Select labelId='captain' id='captain'
                    value={selectedCaptain}
                    displayEmpty onChange={handleSelectedCaptain}>
                    {myTeamTableData.map(item => 
                        <MenuItem key={item.pid} value={item.playerName}>{item.playerName}</MenuItem>)}
                </Select>
                <Button variant="contained" color="secondary" size="small"
                    className={classes.button} onClick={updateCaptain}>Update
                </Button>
                </div>
            );
        }
    }

    function DisplayViceCaptainSelectButton() {
        if (tournamentStated) {
            return (<div></div>)
        } else {
            return (
                <div>
                <Select labelId='vicecaptain' id='vicecaptain'
                    value={selectedViceCaptain}
                    displayEmpty onChange={handleSelectedViceCaptain}>
                    {myTeamTableData.map(item => 
                        <MenuItem key={item.pid} value={item.playerName}>{item.playerName}</MenuItem>)}
                </Select>
                <Button variant="contained" color="secondary" size="small"
                    className={classes.button} onClick={updateViceCaptain}>Update
                </Button>
                </div>
            );
        }
    }

    function  ShowCaptainViceCaptain() {
        if (isUserMemberOfGroup) {
            return(
            <div>
            <Accordion expanded={expandedPanel === captainTableData[0].desc} 
                onChange={handleAccordionChange(captainTableData[0].desc)}>
                <CvcSummary desc={captainTableData[0].desc} name={captainTableData[0].name}/>
              <AccordionDetails>
                  <DisplayCaptainSelectButton/>
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expandedPanel === captainTableData[1].desc} 
                onChange={handleAccordionChange(captainTableData[1].desc)}>
                <CvcSummary desc={captainTableData[1].desc} name={captainTableData[1].name}/>
                <AccordionDetails>
                    <DisplayViceCaptainSelectButton/>
                </AccordionDetails>
            </Accordion>
            </div>
            );
        } else {
            return(<div></div>);
        }
    }

    return (
    <div className={classes.root}>
        <h3 align="center">My Captain and Vice Captain ({localStorage.getItem("tournament")})</h3>
        <ShowCaptainViceCaptain/>
    </div>
    );

};
