import React, { useEffect, useState, useContext } from 'react';
import axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
// import DialogTitle from '@material-ui/core/DialogTitle';
// import Dialog from '@material-ui/core/Dialog';
// import MenuItem from '@material-ui/core/MenuItem';
// import FormControl from '@material-ui/core/FormControl';
// import DoneIcon from '@material-ui/icons/Done';

// import Typography from '@material-ui/core/Typography';

// import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
// import NavigateNextIcon from '@material-ui/icons/NavigateNext';
//import Container from "@material-ui/core/Container";

// import Select from "@material-ui/core/Select";
// import Table from "components/Table/Table.js";
// import Grid from "@material-ui/core/Grid";
// import Button from '@material-ui/core/Button';

// import DialogActions from '@material-ui/core/DialogActions';
// import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';

import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// import GridItem from "components/Grid/GridItem.js";
// import Drawer from '@material-ui/core/Drawer';
// import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
// import ChevronRightIcon from '@material-ui/icons/ChevronRight';
// import IconButton from '@material-ui/core/IconButton';
// import CheckSharpIcon from '@material-ui/icons/CheckSharp';
// import ClearSharpIcon from '@material-ui/icons/ClearSharp';
// import Avatar from "@material-ui/core/Avatar"
// import Card from "components/Card/Card.js";
// import CardBody from "components/Card/CardBody.js";
import { UserContext } from "../../UserContext";

const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
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


export default function Group() {

    window.onbeforeunload = () => setUser(null)
    const { setUser } = useContext(UserContext);
    const classes = useStyles();
    const [myGroupTableData, setMyGroupTableData] = useState([]);
    const [hasatleast1Group, setUserHasGroup] = useState(false);
    // const theme = useTheme(); 
    // const [open, setOpen] = useState(false);
    // const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    // const [selectedOwner, setSelectedOwner] = useState(null);
    // const [backDropOpen, setBackDropOpen] = useState(false);
    // const [playerStatus, setPlayerStatus] = useState();
    // const [selectWhat, setSelectWhat] = useState("Captain");
    // const [selectedPlayerValue, setSelectedPlayerValue] = useState("");

    // const handleDrawerClose = () => {
    //     setOpen(false);
    // };

    // const handleModalClose = () => {
    //     setConfirmDialogOpen(false);
    // };

    useEffect(() => {
        const a = async () => {
            // get start of tournamnet (i.e. start of 1st match)
            // var mygroup  = 1;
            window.localStorage.setItem("groupMember", "");
            var myUrl = `/group/memberof/${localStorage.getItem("uid")}`;
            const teamResponse = await axios.get(myUrl);
            var hasgroup = false;
            if (teamResponse.data[0].groups.length > 0) {
                // console.log(teamResponse);
                hasgroup = true;
                var currgrp = parseInt(localStorage.getItem("gid"));
                var tmpidx = teamResponse.data[0].groups.findIndex(x => x.gid === currgrp);
                if (tmpidx >= 0) {
                    teamResponse.data[0].groups[tmpidx].groupName =
                    teamResponse.data[0].groups[tmpidx].groupName.concat("*");
                }
                setMyGroupTableData(teamResponse.data[0].groups);
                // console.log(teamResponse.data[0].groups);
            }
            setUserHasGroup(hasgroup);
        }

        a();
    }, [])

    async function  updateCurrentGroup() {
        // use has select another group as current group
        var newCurrent = expandedPanel;
        if (newCurrent.slice(-1) === "*")
            newCurrent = newCurrent.slice(0, -1);
        console.log(` New selection is ${newCurrent}`);

        myGroupTableData.forEach( ggg => {
            // remove asterix from old groyup name
            if (ggg.groupName.slice(-1) === "*") {
                ggg.groupName = ggg.groupName.slice(0, -1);
            }
            // set asterix to new current group
            if (ggg.groupName === newCurrent) {
                window.localStorage.setItem("gid", ggg.gid.toString());
                // window.localStorage.setItem("groupName", ggg.groupName);
                ggg.groupName = ggg.groupName.concat("*");
            }
        });

        // get data of new current group from backend
        var myUID = localStorage.getItem("uid");
        var response = await axios.get(`/group/current/${localStorage.getItem("gid")}/${myUID}`);
        // SAMPLE OUTPUT
        // {"uid":"8","gid":2,"displayName":"Salgia Super Stars",
        // "groupName":"Happy Home Society Grp 2","tournament":"ENGAUST20","ismember":true,"admin":true}
        // window.localStorage.setItem("uid", myUID)
        // window.localStorage.setItem("gid", response.data.gid);
        window.localStorage.setItem("displayName", response.data.displayName);
        window.localStorage.setItem("groupName", response.data.groupName);
        window.localStorage.setItem("tournament", response.data.tournament);
        window.localStorage.setItem("ismember", response.data.ismember);
        window.localStorage.setItem("admin", response.data.admin)
        setUser({ uid: myUID, admin: response.data.admin })    

        setMyGroupTableData(myGroupTableData);
        setExpandedPanel(false);
    }

    function handleShowMember() {
        localStorage.setItem("displayGroupMember", "");
        localStorage.setItem("displayGroupAdmin", "false");
        var newCurrent = expandedPanel;
        if (newCurrent.slice(-1) === "*")
            newCurrent = newCurrent.slice(0, -1);

        myGroupTableData.forEach( ggg => {
            var x = ggg.groupName;
            if (x.slice(-1) === "*") {
                x = x.slice(0, -1);
            }
            // set asterix to new current group
            if (x === newCurrent) {
                window.localStorage.setItem("gdGid", ggg.gid.toString());
                window.localStorage.setItem("gdName", ggg.groupName)
                window.localStorage.setItem("gdAdmin", ggg.admin.toString());
            }
        });
        // console.log(localStorage.getItem("displayGroupMember"));
        // console.log(localStorage.getItem("displayGroupAdmin"));
        // console.log("Settings done");
    }

    const [expandedPanel, setExpandedPanel] = useState(false);
    const handleAccordionChange = (panel) => (event, isExpanded) => {
      setExpandedPanel(isExpanded ? panel : false);
    };  
    function ShowAllGroups() {
        return (myGroupTableData.map(element =>
            <Accordion expanded={expandedPanel === element.groupName} onChange={handleAccordionChange(element.groupName)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                    <Typography className={classes.heading}>{element.groupName}</Typography>
                    <Typography className={classes.secondaryHeading}>{element.tournament} ({element.admin})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                <Button variant="contained" color="secondary" size="small"
                    className={classes.button} onClick={updateCurrentGroup}>Select
                </Button>
                <Button variant="contained" color="secondary" size="small"
                    className={classes.button} onClick={handleShowMember}>Members
                </Button>
                </AccordionDetails>
            </Accordion>
        ));
    }

    function NewGroupButton() {
        return (<Link align="center" to='admin/createnewgroup' >Create New Group</Link>) 
    }

    if (hasatleast1Group)
        return (
        <div key="allgroup">  
            {/* <CricDreamGroupSetting/> */}
        <h3 align="center">Group List of {localStorage.getItem("displayName")}</h3>
            <ShowAllGroups/>
            <NewGroupButton/>            
       </div>
        );
    else
        return(
            <div key="noGroup">
                <h3 align="center">Not a member of any Group</h3>
                <NewGroupButton/>            
            </div>)

}
