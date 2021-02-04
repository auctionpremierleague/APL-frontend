import React, { useEffect, useState, useContext } from 'react';
import axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
// import { Switch, Route } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
import Table from "components/Table/Table.js";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import Grid from "@material-ui/core/Grid";
// import GridItem from "components/Grid/GridItem.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
// import Accordion from '@material-ui/core/Accordion';
// import AccordionSummary from '@material-ui/core/AccordionSummary';
// import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useHistory } from "react-router-dom";
import { UserContext } from "../../UserContext";
import { cdCurrent, cdDefault, hasGroup, getUserBalance} from "views/functions.js"
import {BlankArea, NothingToDisplay, DisplayBalance} from "CustomComponents/CustomComponents.js"
import {red, blue, green } from '@material-ui/core/colors';
import {setTab} from "CustomComponents/CricDreamTabs.js"
const rPrefix = "radio-";

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


export default function Group() {

    // window.onbeforeunload = () => setUser(null)
    // const { setUser } = useContext(UserContext);
    const classes = useStyles();
    const [myGroupTableData, setMyGroupTableData] = useState([]);
    const [newCurrentGroup, setNewCurrentGroup] = useState(localStorage.getItem("groupName"));
    const [newDefaultGroup, setNewDefaultGroup] = useState("");
    // const history = useHistory();
    const [balance, setBalance] = useState(0);

      
    useEffect(() => {
        const a = async () => {
            let myBalance = await getUserBalance();
            setBalance(myBalance);
            // console.log(myBalance); 

            window.localStorage.setItem("groupMember", "");
            var myUrl = `${process.env.REACT_APP_AXIOS_BASEPATH}/group/memberof/${localStorage.getItem("uid")}`;
            const response = await axios.get(myUrl);
            // console.log(response.data[0].groups);
            let setnew = true;
            if (hasGroup()) {
                // just check if current group is part of group list 
                let tmp = response.data[0].groups.find(x => x.gid == localStorage.getItem("gid"));
                if (tmp) setnew = false;
                let gRec = response.data[0].groups.find(x => x.defaultGroup === true);
                if (gRec) {
                    setNewDefaultGroup(gRec.groupName);
                }
            }
            // console.log(`Set new is ${setnew}`);
            if (setnew) {
                if (response.data[0].groups.length > 0) {
                    var myGroup = response.data[0].groups[0];
                    // console.log(myGroup);
                    localStorage.setItem("gid", myGroup.gid.toString());
                    localStorage.setItem("groupName", myGroup.groupName);
                    localStorage.setItem("tournament", myGroup.tournament);
                    localStorage.setItem("admin", false)
                    setNewCurrentGroup(myGroup.name);
                } else {
                    localStorage.setItem("gid", "");
                    localStorage.setItem("groupName", "");
                    localStorage.setItem("tournament", "");
                    localStorage.setItem("admin", false)
                    setNewCurrentGroup("");
                }
            }
            setMyGroupTableData(response.data[0].groups);
            // console.log(response.data[0].groups);
            }
        a();
    }, [])


    function handleGroupDetails(grpName) {
        // console.log(`Show group details of ${grpName}`)
        var ggg =   myGroupTableData.find(x => x.groupName === grpName);
        //console.log(ggg);
        window.localStorage.setItem("gdGid", ggg.gid.toString());
        // window.localStorage.setItem("gdName", ggg.groupName)
        // window.localStorage.setItem("gdDisplay", ggg.displayName)
        // window.localStorage.setItem("gdAdmin", ggg.admin);
        // window.localStorage.setItem("gdCurrent", (newCurrentGroup === ggg.groupName) ? "true" : "false");
        // window.localStorage.setItem("gdDefault", ggg.defaultGroup);
        // window.localStorage.setItem("gdTournament", ggg.tournament);
        setTab(102);
    }



    function handleNewGroup() {
        setTab(parseInt(process.env.REACT_APP_BASEPOS) + parseInt(process.env.REACT_APP_NEWGROUP));
    };

    function handleJoinGroup() {
        localStorage.setItem("joinGroupCode", "");       
        setTab(parseInt(process.env.REACT_APP_BASEPOS) + parseInt(process.env.REACT_APP_JOINGROUP));
    };


    function DisplayGroupHeader() {
        return (
        <Grid key="gr-group" container justify="center" alignItems="center" >
            <Grid item key="gi-group" xs={8} sm={8} md={8} lg={8} >
            <Typography className={classes.header}>Group Name</Typography>
            </Grid>
            <Grid item key="gi-group" xs={2} sm={2} md={2} lg={2} >
            <Typography className={classes.header}>Curr</Typography>
            </Grid>
            <Grid item key="gi-group" xs={2} sm={2} md={2} lg={2} >
            <Typography className={classes.header}>Def</Typography>
            </Grid>
        </Grid>
        );
    }

    function handleNewCurrentGroup(grpName) {
        // console.log(grpName);
        setNewCurrentGroup(grpName);
        let gRec = myGroupTableData.find( x => x.groupName === grpName);
        // console.log(gRec);
        localStorage.setItem("gid", gRec.gid);
        localStorage.setItem("groupName", gRec.groupName);
        localStorage.setItem("tournament", gRec.tournament);
        localStorage.setItem("admin", gRec.admin);
    };
    

    async function handleNewDefaultGroup(grpName) {
        // console.log(grpName);
        let gRec = myGroupTableData.find( x => x.groupName === grpName);
        // console.log(gRec);
        let newGid = gRec.gid;
        // console.log(newGid);
        let sts = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/group/setdefaultgroup/${localStorage.getItem("uid")}/${newGid}`);
        setNewDefaultGroup(grpName);
    };

    function DisplayGroupData() {
        // console.log(myGroupTableData);
        return (
        myGroupTableData.map( (x, index) => {
        return (
            <Grid key={x.groupName} container justify="center" alignItems="center" >
            <Grid item key={x.groupName} xs={8} sm={8} md={8} lg={8} >
                <Link href="#" onClick={() => handleGroupDetails(x.groupName)} variant="body2">
                <Typography>{x.groupName}</Typography>
                </Link>
            </Grid>
            <Grid item justify="center" alignContent="center" alignItems="center" key={x.groupName} xs={2} sm={2} md={2} lg={2} >
                <FormControlLabel 
                    key={"Curr"+x.groupName}
                    id={"Curr"+x.groupName}
                    className={classes.info} 
                    control={<Radio color="primary" defaultChecked={x.playerName === newCurrentGroup}/>}
                    onClick={() => handleNewCurrentGroup(x.groupName)}
                    checked={newCurrentGroup === x.groupName}
                />
            </Grid>
            <Grid item justify="center" alignContent="center" alignItems="center" xs={2} sm={2} md={2} lg={2} >
                <FormControlLabel 
                    key={"Def"+x.groupName}
                    id={"Def"+x.groupName}
                    className={classes.info} 
                    control={<Radio color="primary" defaultChecked={x.playerName === newDefaultGroup}/>}
                    onClick={() => handleNewDefaultGroup(x.groupName)}
                    checked={newDefaultGroup === x.groupName}
                />
            </Grid>
        </Grid>
        )}))
    }

    function  ShowAllGroups() {
        return(
        <Card key="c-group" profile>
        <CardBody key="cb-group" profile>
        <DisplayGroupHeader />
        <DisplayGroupData />
        </CardBody>
        </Card>
        );
    }

    function ShowPageHeader() {
    let curr =  "Curr - Current Group  / Def - Default Group";
    let msg = "Click on group name for details";
    return(
        <div className={classes.root} align="center">
            <h3>My Groups</h3>
            <Typography className={classes.messageText}>{curr}</Typography>
            <Typography className={classes.messageText}>{msg}</Typography>
        </div>
    )}

    return (
        <div className={classes.root} align="center" key="groupinfo">
            <DisplayBalance balance={balance} />
            <ShowPageHeader />
            <ShowAllGroups />
            <Button key={"create"} variant="contained" color="primary" size="small"
                className={classes.button} onClick={handleNewGroup}>New Group
            </Button>
            <Button key={"progile"} variant="contained" color="primary" size="small"
               className={classes.button} onClick={handleJoinGroup}>Join Group
            </Button>
        </div>
        );
    
}

