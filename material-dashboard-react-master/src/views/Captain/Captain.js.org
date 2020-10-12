import React, { useEffect, useState, useContext } from 'react';
import axios from "axios";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';


import MenuItem from '@material-ui/core/MenuItem';

import FormControl from '@material-ui/core/FormControl';


import DoneIcon from '@material-ui/icons/Done';

import Typography from '@material-ui/core/Typography';

// import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
// import NavigateNextIcon from '@material-ui/icons/NavigateNext';
//import Container from "@material-ui/core/Container";

import Select from "@material-ui/core/Select";
import Table from "components/Table/Table.js";
import Grid from "@material-ui/core/Grid";
import Button from '@material-ui/core/Button';

import DialogActions from '@material-ui/core/DialogActions';
// import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';


import GridItem from "components/Grid/GridItem.js";

import Drawer from '@material-ui/core/Drawer';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import IconButton from '@material-ui/core/IconButton';
// import CheckSharpIcon from '@material-ui/icons/CheckSharp';
// import ClearSharpIcon from '@material-ui/icons/ClearSharp';
// import Avatar from "@material-ui/core/Avatar"


import Card from "components/Card/Card.js";
// import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";



// import Input from '@material-ui/core/Input';


import { UserContext } from "../../UserContext";

// import socketIOClient from "socket.io-client";

// const ENDPOINT = "https://happy-home-ipl-2020.herokuapp.com/";
// const ENDPOINT = "http://localhost:4000";

const drawerWidth = 100;
const useStyles = makeStyles((theme) => ({
    margin: {
        margin: theme.spacing(1),
    },
    image: {
        height: "200px"
    },
    container: {
        backgroundImage: "url(\"../RCB/5334.jpg\")",
        backgroundSize: 'cover'
    }, drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-start',
    },
    sold: {
        color: "green"
    }, cardCategoryWhite: {
        color: "rgba(255,255,255,.62)",
        margin: "0",
        fontSize: "14px",
        marginTop: "0",
        marginBottom: "0"
    },
    cardTitleWhite: {
        color: "#FFFFFF",
        marginTop: "0px",
        minHeight: "auto",
        fontWeight: "300",
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: "3px",
        textDecoration: "none"
    }, large: {
        width: theme.spacing(12),
        height: theme.spacing(12),
    },
}));




export default function ImgMediaCard() {

    window.onbeforeunload = () => setUser(null)

    const { setUser } = useContext(UserContext);



    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [selectedOwner, setSelectedOwner] = useState(null);

    const [backDropOpen, setBackDropOpen] = useState(false);
    const [playerStatus, setPlayerStatus] = useState();
    const [captainTableData, setCaptainTableData] = useState([{desc: "Captain", name: ""},
        {desc: "ViceCaptain", name: ""}]);
    const [myTeamTableData, setMyTeamTableData] = useState([]);
    const [isUserMemberOfGroup, setGroupMember] = useState(false);
    const [tournamentStated, setTournamentStarted] = useState(false);
    const [selectWhat, setSelectWhat] = useState("Captain");
    const [selectedPlayerValue, setSelectedPlayerValue] = useState("");

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleModalClose = () => {
        setConfirmDialogOpen(false);
    };

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
            var response = await axios.get(`/user/getcaptain/${mygroup}/${localStorage.getItem("uid")}`);
            // var isGroupMember = false;
            if (response.data.length > 0) {
                captainTableData[0].name = response.data[0].captainName;
                captainTableData[1].name = response.data[0].viceCaptainName;
            }

            response = await axios.get(`/group/gamestarted/${localStorage.getItem("gid")}`);
            gameStarted = (response.data.length > 0);
            if (!gameStarted) {
                // get list of player purchased by user for aelecting captain / vice captain
                var myUrl = `/user/myteamwos/${mygroup}/${localStorage.getItem("uid")}`;
                const teamResponse = await axios.get(myUrl);
                // console.log(teamResponse.data);
                console.log(teamResponse.data[0].players);
                setMyTeamTableData(teamResponse.data[0].players);
            }         
            setCaptainTableData(captainTableData);
            console.log(captainTableData)
            // gameStarted = false;
            console.log(`'game started ${gameStarted}`);
            setTournamentStarted(gameStarted);
            //setTournamentStarted(false);  // for testing
            setGroupMember(true);

        }

        a();
    }, [])


    const handleOwnerChange = (event) => {
        setSelectedOwner(event.target.value);
        setSelectedPlayerValue(event.target.value);
    };


    async function sellPlayer() {

        console.log(`Selected Player: ${selectedPlayerValue}`);
        // update Captain or Vice captain name
        var pidx =  myTeamTableData.findIndex(x => x.playerName === selectedPlayerValue)
        var myUrl = `/user/${selectWhat.toLowerCase()}/${localStorage.getItem("uid")}/${myTeamTableData[pidx].pid}`
        console.log(myUrl);
       
        let response = await fetch(myUrl);
        if (response.status === 200) {
            var tmp = captainTableData;
            var idx = (selectWhat.toUpperCase() === "CAPTAIN") ? 0 : 1; 
            tmp[idx].name = selectedPlayerValue;
            setCaptainTableData(tmp);
            setPlayerStatus("updated");
            console.log("Done");
        } else {
            console.log(response.data);
            console.log(response.error);
            setPlayerStatus("Could not update");
        }

        setConfirmDialogOpen(false);
        setBackDropOpen(true);
    }


    function DisplayCaptainButtons() {
        if ((isUserMemberOfGroup) && (!tournamentStated)) {
            return (<div>
            <Button
                variant="contained"
                color="secondary"
                size="small"
                className={classes.button}
                onClick={() => { setSelectWhat("Captain"); setOpen(true); }}>
                Set Captain
            </Button>
            <Button
                variant="contained"
                color="secondary"
                size="small"
                className={classes.button}
                onClick={() => {  setSelectWhat("ViceCaptain"); setOpen(true); }}>
                Set ViceCaptain
            </Button>
            </div>);
        } else {
            return <div></div>
        }
    }

    function DisplayCaptainTable() {
        if (isUserMemberOfGroup) {
            return (
                <Grid container justify="center" alignItems="center">
                    <Grid item xs={12}>
                        <div>
                            <Grid container justify="center" alignItems="center" >
                                <GridItem xs={12} sm={12} md={12} lg={12} >
                                    <Card profile>
                                        <CardBody profile>
                                        <h3 className={classes.cardTitle}>Captain and Vice Captain ({localStorage.getItem("groupName")})</h3>
                                            <Table
                                                tableHeaderColor="warning"
                                                tableHead={["Description", "Player Name"]}
                                                tableData={captainTableData.map(element => {
                                                    const arr = [element.desc, element.name]
                                                    return { data: arr, collapse: [] }
                                                })}
                                            />
                                            <DisplayCaptainButtons />
                                        </CardBody>
                                    </Card>
                                </GridItem>
                            </Grid>
                        </div>
                    </Grid>
                </Grid>
            )    
        } else {
        return(
            <Grid container justify="center" alignItems="center" >
                <h3 className={classes.cardTitle}>Not a member of the Group</h3>
            </Grid>)
        }
    }
        
    function CricDreamCaptainSetting() {
        console.log("In admin auction");
        // console.log(myTeamTableData);
        return <div className={classes.root}>
            <DisplayCaptainTable />
            <Dialog aria-labelledby="simple-dialog-title" open={backDropOpen}
                onClose={() => setBackDropOpen(false)} >
                <DialogTitle id="simple-dialog-title" className={classes.sold}>{playerStatus}</DialogTitle>
            </Dialog>
            <Drawer
                variant="persistent"
                anchor="right"
                open={open}
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <IconButton onClick={handleDrawerClose}>
                    {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
                <div>
                    <FormControl className={classes.formControl}>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={selectedOwner}
                            displayEmpty
                            onChange={handleOwnerChange}>
                                {myTeamTableData.map(item => <MenuItem key={item.pid} value={item.playerName}>{item.playerName}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        className={classes.button}
                        startIcon={<DoneIcon />}
                        onClick={() => { setConfirmDialogOpen(true) }}>
                        Confirm
                    </Button>
                </div>
            </Drawer>

            <Dialog
                open={confirmDialogOpen}
                onClose={handleModalClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{`Are you sure you want to set ${selectedPlayerValue} as ${selectWhat}`}</DialogTitle>
                <DialogActions>
                    <Button onClick={handleModalClose} color="primary" autoFocus>Cancel</Button>
                    <Button onClick={sellPlayer} color="primary">Set</Button>
                </DialogActions>
            </Dialog>
        </div>
    }

    
    // function StartDisplay() {
    //     if (isUserMemberOfGroup)
    //         Show_CaptainTable();
    //     else 
    //         NonMember();
    // }

    return (
        <CricDreamCaptainSetting />
    );

}
