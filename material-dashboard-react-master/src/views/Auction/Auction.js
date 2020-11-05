import React, { useEffect, useState, useContext } from 'react';
import axios from "axios";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';


import MenuItem from '@material-ui/core/MenuItem';

import FormControl from '@material-ui/core/FormControl';


import DoneIcon from '@material-ui/icons/Done';

import Typography from '@material-ui/core/Typography';

import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
//import Container from "@material-ui/core/Container";

import Select from "@material-ui/core/Select";
import Table from "components/Table/Table.js";
import Grid from "@material-ui/core/Grid";
import Button from '@material-ui/core/Button';

import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';


import GridItem from "components/Grid/GridItem.js";

import Drawer from '@material-ui/core/Drawer';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import IconButton from '@material-ui/core/IconButton';
import CheckSharpIcon from '@material-ui/icons/CheckSharp';
import ClearSharpIcon from '@material-ui/icons/ClearSharp';
import Avatar from "@material-ui/core/Avatar"


import Card from "components/Card/Card.js";
import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";



import Input from '@material-ui/core/Input';


import { UserContext } from "../../UserContext";

import socketIOClient from "socket.io-client";

const ENDPOINT = "https://happy-home-ipl-2020.herokuapp.com/";
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

    const { user, setUser } = useContext(UserContext);



    const classes = useStyles();
    const theme = useTheme();

    const [auctionStatus, setAuctionStatus] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [playerImage, setPlayerImage] = useState("");
    const [team, setTeam] = useState("");
    const [role, setRole] = useState("");
    const [battingStyle, setBattingStyle] = useState("");
    const [bowlingStyle, setBowlingStyle] = useState("");
    const [open, setOpen] = useState(false);

    const [bidAmount, setBidAmount] = useState();

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [pid, setPid] = useState();
    const [selectedOwner, setSelectedOwner] = useState(null);

    const [backDropOpen, setBackDropOpen] = useState(false);
    const [playerStatus, setPlayerStatus] = useState();
    const [AuctionTableData, setAuctionTableData] = useState([]);


    const handleDrawerClose = () => {
        setOpen(false);
    };



    const handleModalClose = () => {
        setConfirmDialogOpen(false);
    };

    useEffect(() => {


        const socket = socketIOClient(ENDPOINT);
        socket.on("connect", () => {

            console.log("client connected");


            socket.on("playerChange", async (newPlayerDetails, balanceDetails) => {

                setAuctionStatus("RUNNING");
                console.log("player change")

                let userBalance = [];
                const { role, Team, battingStyle, bowlingStyle, pid, fullName } = newPlayerDetails;

                console.log(balanceDetails);
                // console.log(user.uid)

                if (localStorage.getItem("admin") === "false") {
                    userBalance = balanceDetails.filter(balance => balance.uid === parseInt(localStorage.getItem("uid"), 10))
                }
                else {
                    userBalance = balanceDetails
                }
                // const userBalance = user && user.admin ? balanceDetails:[balanceDetails.filter(balance => balance.uid === user.uid)]



                console.log(userBalance);
                setPlayerImage(`${process.env.PUBLIC_URL}/${pid}.JPG`);
                setRole(role)
                setTeam(Team)
                setBattingStyle(battingStyle)
                setBowlingStyle(bowlingStyle)
                setPlayerName(fullName)
                setPid(pid)
                setAuctionTableData(userBalance);
            });


        })

        const a = async () => {
            const response = await axios.get("/group/getauctionstatus/1");
            console.log(response.data)
            setAuctionStatus(response.data);

            if (response.data === "RUNNING") {
                await startAuction(response.data);
            }

        }

        a();


    }, [])


    const startAuction = async (status) => {

        if (status === "PENDING") {
            const response = await axios.get("/group/setauctionstatus/1/RUNNING");
            if (response.data) {
                setAuctionStatus("RUNNING");
            }
        }
        if (status === "RUNNING") {
            const response = await axios.get("/group/getauctionplayer/1");
            console.log(response);
        }

    }

    const handleOwnerChange = (event) => {
        setSelectedOwner(event.target.value);
    };


    async function sellPlayer() {


        const amount = document.getElementById("standard-required").value;
        console.log(amount);
        let response = await fetch(`/auction/add/1/${selectedOwner}/${pid}/${bidAmount}`);
        if (response.status === 707) {
            setPlayerStatus("Already Purchased")
        }
        if (response.status === 706) {
            setPlayerStatus("User does not belong to this group");
        }
        if (response.status === 704) {
            setPlayerStatus("Invalid Player")
        }
        if (response.status === 708) {
            setPlayerStatus("Insufficient Balance")
        }
        if (response.status === 200) {
            setPlayerStatus("SOLD");

            const balance = await axios.get("/user/balance/all")
            setAuctionTableData(balance.data);
        }
        setConfirmDialogOpen(false);

        setBackDropOpen(true)
    }


    async function unsellPlayer() {
        await fetch(`/auction/skip/1/${pid}`);

    }




    function AdminAuction() {
        return <div className={classes.root}>


            <Grid container justify="center" alignItems="center">

                <Grid item xs={12}>

                    <div>
                        <Grid container justify="center" alignItems="center" >
                            <GridItem xs={12} sm={12} md={12} lg={12} >
                                <Card profile>
                                    <CardAvatar profile>

                                        <img src={playerImage} alt="..." />

                                    </CardAvatar>
                                    <CardBody profile>

                                        <h3 className={classes.cardTitle}>{playerName}</h3>
                                        <Grid container justify="center" alignItems="center">
                                            <Avatar variant="square" src={`${process.env.PUBLIC_URL}/${team}.JPG`} className={classes.large} />
                                        </Grid>

                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            size="small"
                                            className={classes.button}
                                            startIcon={<CheckSharpIcon />}
                                            onClick={() => { setOpen(true); }}>
                                            SOLD
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            size="small"
                                            className={classes.button}
                                            startIcon={<ClearSharpIcon />}
                                            onClick={() => unsellPlayer()}>
                                            UNSOLD
                                        </Button>

                                    </CardBody>
                                </Card>
                            </GridItem>

                        </Grid>

                    </div>

                </Grid>
            </Grid>
            <Table
                tableHeaderColor="warning"
                tableHead={["Owner", "Player Count", "Balance"]}
                tableData={AuctionTableData.map(element => {
                    const arr = [element.userName, element.playerCount, element.balance]
                    return { data: arr, collapse: [] }
                })}
            />

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
                            onChange={handleOwnerChange}
                        >
                            {AuctionTableData.map(item => <MenuItem key={item.uid} value={item.uid}>{item.userName}</MenuItem>)}

                        </Select>

                    </FormControl>
                    <Input key="hi" id="standard-required" label="Bid Amount" type="number" />
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        className={classes.button}
                        startIcon={<DoneIcon />}
                        onClick={() => { setBidAmount(document.getElementById("standard-required").value); setConfirmDialogOpen(true) }}>
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
                <DialogTitle id="alert-dialog-title">{`Are you sure you want to sell ${playerName} in ${bidAmount}`}</DialogTitle>

                <DialogActions>

                    <Button onClick={handleModalClose} color="primary" autoFocus>
                        Cancel
          </Button>
                    <Button onClick={sellPlayer} color="primary">
                        Sell
          </Button>
                </DialogActions>
            </Dialog>
        </div>
    }

    function AdminPending() {
        return <Button variant="contained"
            color="secondary"
            size="small"
            className={classes.button}
            startIcon={<NavigateBeforeIcon />}
            onClick={() => startAuction("PENDING")}>Start Auction</Button>
    }

    function UserAuctionPending() {
        
        return auctionStatus==="PENDING"? <Typography>Auction has not been started by Admin! <br /> Auction is Coming !!</Typography>:<Typography>Auction has ended</Typography>
    }

    function UserAuction() {
        return <Grid container justify="center"
            alignItems="center" >
            <GridItem xs={12} sm={12} md={4} >
                <Card profile>
                    <CardAvatar profile>

                        <img src={playerImage} alt="..." />

                    </CardAvatar>
                    <CardBody profile>

                        <h3 className={classes.cardTitle}>{playerName}</h3>
                        <Grid container justify="center" alignItems="center">
                            <Avatar variant="square" src={`${process.env.PUBLIC_URL}/${team}.JPG`} className={classes.large} />
                        </Grid>
                        <h4 className={classes.cardCategory}> {role}</h4>
                        <h6 className={classes.description}>
                            {battingStyle}<br />
                            {bowlingStyle}

                        </h6>

                    </CardBody>
                </Card>
            </GridItem>
            <Table
                tableHeaderColor="warning"
                tableHead={["Owner", "Player Count", "Balance"]}
                tableData={AuctionTableData.map(element => {
                    const arr = [element.userName, element.playerCount, element.balance]
                    return { data: arr, collapse: [] }
                })}
            />
        </Grid>
    }
    return (

       ( auctionStatus === "PENDING"||  auctionStatus === "OVER")? localStorage.getItem("admin") === "true" ? <AdminPending /> : <UserAuctionPending /> : localStorage.getItem("admin") === "true" ? <AdminAuction /> : <UserAuction />


    );

}
