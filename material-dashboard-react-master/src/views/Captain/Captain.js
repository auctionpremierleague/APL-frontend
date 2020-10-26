import React, { useEffect, useState, useContext } from 'react';
import axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
// import { Switch, Route, Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Table from "components/Table/Table.js";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import Grid from "@material-ui/core/Grid";
import GridItem from "components/Grid/GridItem.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
// import Accordion from '@material-ui/core/Accordion';
// import AccordionSummary from '@material-ui/core/AccordionSummary';
// import AccordionDetails from '@material-ui/core/AccordionDetails';
// import Typography from '@material-ui/core/Typography';
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useHistory } from "react-router-dom";
import { UserContext } from "../../UserContext";
// import GroupMember from "views/GroupMember/GroupMember.js"
// import { 
//     BrowserRouter as Router, 
//     Route, 
//     Link, 
//     Switch 
// } from 'react-router-dom'; 

const vcPrefix = "vicecaptain-"
const cPrefix = "captain-"


const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
    },
    captain: {
        color: "yellow",
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
    // const [myGroupTableData, setMyGroupTableData] = useState([]);
    // const [hasatleast1Group, setUserHasGroup] = useState(false);
    // const history = useHistory();
    // const [newCurrentGroup, setNewCurrentGroup] = useState(localStorage.getItem("groupName"));
    // const { setUser } = useContext(UserContext);
    // const classes = useStyles();
    const [selectedViceCaptain, SetSelectedViceCaptain] = useState("");
    const [selectedCaptain, SetSelectedCaptain] = useState("");
    const [myTeamTableData, setMyTeamTableData] = useState([]);
    // const [isUserMemberOfGroup, setGroupMember] = useState(false);
    const [tournamentStated, setTournamentStarted] = useState(false);


      
    useEffect(() => {
        const a = async () => {
            // get start of tournamnet (i.e. start of 1st match)
            console.log("Hello");
            var gameStarted = false;  
            var mygroup  = localStorage.getItem("gid")
            if  ((mygroup === "") || (mygroup === "0")) {
                // handle if not a member of any group
                // setGroupMember(false);
                // setTournamentStarted(false);
                // console.log("Not a member of group. No cap/vice cap")
                return;
            }
            // setGroupMember(true);

            console.log("Calling getcaptain")
            var response = await axios.get(`/user/getcaptain/${mygroup}/${localStorage.getItem("uid")}`);
            if (response.data.length > 0) {
                SetSelectedCaptain(response.data[0].captainName);
                SetSelectedViceCaptain(response.data[0].viceCaptainName)
            }
            // setCaptainTableData(captainTableData);
            // get list of player purchased by user for aelecting captain / vice captain
            var myUrl = `/user/myteamwos/${mygroup}/${localStorage.getItem("uid")}`;
            const teamResponse = await axios.get(myUrl);
            setMyTeamTableData(teamResponse.data[0].players);
            console.log(teamResponse.data[0].players) ;

            response = await axios.get(`/group/gamestarted/${localStorage.getItem("gid")}`);
            gameStarted = (response.data.length > 0);
            gameStarted = false;
            setTournamentStarted(gameStarted);
        }
        a();
    }, [])

   
    // function handleSelectedCaptain (newCaptain) {
    function handleSelectedCaptain(newCap) {
        console.log(newCap);
        if (newCap !== myTeamTableData[0].playerName) {
            var myElement = document.getElementById(cPrefix + myTeamTableData[0].playerName);
            console.log(myElement);   //.checked = false;
            myElement.checked = false;
        }
    };

    const handleSelectedViceCaptain = (event) => {
        console.log("vice captain");
    };

    function updateCaptain() {
        console.log("upd captin vc details");
    }

    function DisplayCaptainSelectButton() {
        if (!tournamentStated)
            return (
                <div align="center">
                <Button variant="contained" color="primary" size="small"
                    className={classes.button} onClick={updateCaptain}>Update
                </Button>
                </div>
                );
        else
            return(<br/>);
        }

    function ShowCaptainViceCaptain() {
        return(
            <Grid key="gr-cvc" container justify="center" alignItems="center" >
            <GridItem key="gi-cvc" xs={12} sm={12} md={12} lg={12} >
                <Card key="c-cvc" profile>
                    <CardBody key="cb-cvc" profile>
                        <Table
                            tableKey="t-cvc"
                            id="t-cvc"
                            tableHeaderColor="warning"
                            tableHead={["Player Name", "Captain", "Vice Captain"]}
                            tableData={myTeamTableData.map(x => {
                                const arr = [
                                    x.playerName,
                                    <FormControlLabel 
                                    key={cPrefix+x.playerName}
                                    className={classes.captain} 
                                    value={x.playerName}    
                                    control={<Radio color="primary" key={cPrefix+x.playerName} id={cPrefix+x.playerName} defaultChecked={x.playerName === selectedCaptain}/>}
                                    onClick={() => handleSelectedCaptain(x.playerName)}
                                    />,
                                    <FormControlLabel 
                                    key={vcPrefix+x.playerName}
                                    className={classes.captain} 
                                    value={x.playerName}    
                                    control={<Radio color="primary" key={vcPrefix+x.playerName} id={cPrefix+x.playerName} defaultChecked={x.playerName === selectedViceCaptain}/>}
                                    onClick={() => handleSelectedViceCaptain(x.playerName)}
                                    />
                                ]
                                return { data: arr, collapse: [] }
                            })}
                        />
                    </CardBody>
                </Card>
                <DisplayCaptainSelectButton/>
            </GridItem>
            </Grid>
        );
    };

    if ((localStorage.getItem("gid") !== "") || (localStorage.getItem("gid") !== "0"))
        return (
        <div className={classes.root} key="cpataininfo">
            <h3 align="center">My Captain and Vice Captain ({localStorage.getItem("tournament")})</h3>
            <ShowCaptainViceCaptain/>
        </div>
        );
    else
        return(<div><h3>Not a member of any group</h3></div>)
}
