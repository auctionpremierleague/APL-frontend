import React, { useEffect, useState, useContext, Component } from 'react';
import axios from "axios";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import DoneIcon from '@material-ui/icons/Done';

// import Typography from '@material-ui/core/Typography';

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
import CardBody from "components/Card/CardBody.js";
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
    const [myGroupTableData, setMyGroupTableData] = useState([]);
    const [hasatleast1Group, setUserHasGroup] = useState(false);
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
            // var mygroup  = 1;
            var myUrl = `/group/memberof/${localStorage.getItem("uid")}`;
            const teamResponse = await axios.get(myUrl);
            var hasgroup = false;
            if (teamResponse.data[0].groups.length > 0) {
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


    const handleOwnerChange = (event) => {
        setSelectedOwner(event.target.value);
        setSelectedPlayerValue(event.target.value);
    };


    async function sellPlayer() {

        console.log(`Selected Player length: ${selectedPlayerValue.length}`);
        if (selectedPlayerValue.length === 0) {
            setPlayerStatus("Group not selected");
            return;
        }
        console.log(selectWhat);
        var usrcmd = selectWhat.toUpperCase();
        console.log(usrcmd);
        if (usrcmd === "SELECT") {
            myGroupTableData.forEach( ggg => {
                if (ggg.groupName.slice(-1) === "*") {
                    ggg.groupName = ggg.groupName.slice(0, -1);
                }
                if (ggg.groupName === selectedPlayerValue) {
                    window.localStorage.setItem("gid", ggg.gid.toString());
                    window.localStorage.setItem("groupName", ggg.groupName);
                    ggg.groupName = ggg.groupName.concat("*");
                }
                // console.log(`After ${ggg.groupName}`)
            })
            setMyGroupTableData(myGroupTableData);
            // update details of user on local storage for other to access lastest
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
            setUser({ uid: myUID, admin: response.data.admin });
        }
        setConfirmDialogOpen(false);
        setBackDropOpen(true);
    }

    
    class CricButton extends Component {
        handleClick() {
          setSelectWhat(this.props.label);
            setOpen(true); 
        }
        render() {
          return <Button variant="contained" color="secondary" size="small"
          className={classes.button}onClick={() => this.handleClick()}>{this.props.label}</Button>;
        }
      }


    function ShowGroupButtons() {
        if (hasatleast1Group)
            return (
            <div>
                <CricButton label="Select" />
                <CricButton label="New Group" />
                <CricButton label="Add Member" />
            </div> )
        else 
            return (
                <CricButton label="New Group" />
            )
    }

    function ShowGroupTable() {
        // console.log("In Group Table");
        return (
            <Grid container justify="center" alignItems="center">
                <Grid item xs={12}>
                    <div>
                        <Grid container justify="center" alignItems="center" >
                            <GridItem xs={12} sm={12} md={12} lg={12} >
                                <Card profile>
                                    <CardBody profile>
                                    <h3 className={classes.cardTitle}>Group Information</h3>
                                        <Table
                                            tableHeaderColor="warning"
                                            tableHead={["Group Name", "Franchise", "Tournament", "Admin"]}
                                            tableData={myGroupTableData.map(element => {
                                                const arr = [element.groupName, element.displayName, element.tournament, element.admin]
                                                return { data: arr, collapse: [] }
                                            })}
                                        />
                                        <ShowGroupButtons/>
                                    </CardBody>
                                </Card>
                            </GridItem>
                        </Grid>
                    </div>
                </Grid>
            </Grid>
        )
    }

    function RtlIcon() {
        return(
        <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
        )
    }

    function CricDreamGroupSetting() {
    // console.log("In cricdream group setting");
    // console.log(myGroupTableData);
        return <div className={classes.root}>
            <ShowGroupTable />
            <Dialog aria-labelledby="simple-dialog-title" open={backDropOpen}
                onClose={() => setBackDropOpen(false)} >
                <DialogTitle id="simple-dialog-title" className={classes.sold}>{playerStatus}</DialogTitle>
            </Dialog>
            <Drawer variant="persistent" anchor="right" open={open} 
                classes={{ paper: classes.drawerPaper, }}>
                <RtlIcon />
                {/* <IconButton onClick={handleDrawerClose}>
                    {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton> */}
                <div>
                    <FormControl className={classes.formControl}>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={selectedOwner}
                            displayEmpty
                            onChange={handleOwnerChange}>
                                {myGroupTableData.map(item => <MenuItem key={item.gid} value={item.groupName}>{item.groupName}</MenuItem>)}
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

    return (
    <div>  
        <CricDreamGroupSetting/>
    </div>
    );

}
