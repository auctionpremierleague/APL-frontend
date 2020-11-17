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
import NoGroup from 'CustomComponents/NoGroup.js';
import { UserContext } from "../../UserContext";
import socketIOClient from "socket.io-client";

const ENDPOINT = "https://happy-home-ipl-2020.herokuapp.com/";
// const ENDPOINT = "http://localhost:4000";

const drawerWidth = 100;
const useStyles = makeStyles((theme) => ({
    infoButton: {
        backgroundColor: '#FCDC00'
    },
    margin: {
        margin: theme.spacing(1),
    },
    image: {
        height: "200px"
    },
    container: {
        backgroundImage: "url(\"./sample.JPG\")",
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
    }, 
    cardCategoryWhite: {
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
        marginBottom: "0px",
        textDecoration: "none"
    }, 
    large: {
        width: theme.spacing(12),
        height: theme.spacing(12),
    },
    medium: {
        width: theme.spacing(9),
        height: theme.spacing(9),
    },
    playerinfo: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 0),
        justifyContent: 'flex-start',
    },
}));


function leavingAuction(myConn) {
    console.log("Leaving Auction wah wah ");
    myConn.disconnect();
  }
  
  

export default function Auction() {

    window.onbeforeunload = () => setUser(null)

    const { user, setUser } = useContext(UserContext);
    const classes = useStyles();
    const theme = useTheme();
    const [playerId, setPid] = useState(0);
    const [auctionStatus, setAuctionStatus] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [playerImage, setPlayerImage] = useState("");
    const [team, setTeam] = useState("");
    const [role, setRole] = useState("");
    const [battingStyle, setBattingStyle] = useState("");
    const [bowlingStyle, setBowlingStyle] = useState("");
    const [open, setOpen] = useState(false);

    const [bidAmount, setBidAmount] = useState(0);
    const [bidUser, setBidUser] = useState("");

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
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

    console.log(`Dangerous ${playerId}`)
    useEffect(() => {
        var sendMessage = {page: "AUCT", gid: localStorage.getItem("gid"), uid: localStorage.getItem("uid") };
        const makeconnection = async () => {
          await sockConn.connect();
          sockConn.emit("page", sendMessage);
        }
    
        var sockConn = socketIOClient(ENDPOINT);
        makeconnection();
        sockConn.on("connect", () => {
            console.log("client connected");
            sockConn.emit("page", sendMessage);
            sockConn.on("newBid", (grec) => {
                console.log("new bid reveived");
                setBidAmount(grec.auctionBid);
                setBidUser(grec.currentBidUser);
            });
            sockConn.on("playerChange", async (newPlayerDetails, balanceDetails) => {
                console.log("Player Changed");
                console.log(`New: ${newPlayerDetails.pid}  Old: ${playerId} `)
                if (newPlayerDetails.pid != playerId) {
                    setAuctionStatus("RUNNING");
                    let userBalance = [];
                    // const { role, Team, battingStyle, bowlingStyle, pid, fullName } = newPlayerDetails;
                    // first set PID so that display is better
                    setPid(newPlayerDetails.pid)
                    // console.log(balanceDetails);
                    if (localStorage.getItem("admin") === "false") {
                        userBalance = balanceDetails.filter(balance => balance.uid === parseInt(localStorage.getItem("uid"), 10))
                    }
                    else {
                        userBalance = balanceDetails
                    }
                    setAuctionTableData(userBalance);
                    // console.log(userBalance);
                    setRole(newPlayerDetails.role)
                    setTeam(newPlayerDetails.Team)
                    setBattingStyle(newPlayerDetails.battingStyle)
                    setBowlingStyle(newPlayerDetails.bowlingStyle)
                    setPlayerName(newPlayerDetails.fullName)
                    console.log("player change")
                    console.log(`finally New player is ${newPlayerDetails.pid}`)
                    let tmp = `${process.env.PUBLIC_URL}/${newPlayerDetails.pid}.JPG`
                    if (playerImage != tmp) {
                        console.log("Different image")
                        setPlayerImage(`${process.env.PUBLIC_URL}/${newPlayerDetails.pid}.JPG`);
                    } else
                        console.log("Same player image")
                }
            });
        })

        const a = async () => {
            console.log("Calling get auction status");
            const response = await axios.get(`/group/getauctionstatus/${localStorage.getItem("gid")}`);
            console.log(response.data)
            setAuctionStatus(response.data);
            const response1 = await axios.get(`/auction/getbid/${localStorage.getItem("gid")}`);
            console.log("GETBID");
            console.log(response1.data)
            if (response1.status === 200) {
                setBidAmount(response1.data.auctionBid)
                setBidUser(response1.data.currentBidUser);
            }
            // setAuctionStatus(response.data);
            // if (response.data === "RUNNING") {
            //     await startAuction(response.data);
            // }
        }
        a();
        return () => {
            // componentwillunmount in functional component.
            // Anything in here is fired on component unmount.
            leavingAuction(sockConn);
        }
    }, []);


    const org_startAuction = async (status) => {
        if (status === "PENDING") {
            const response = await axios.get(`/group/setauctionstatus/${localStorage.getItem("gid")}/RUNNING`);
            if (response.data) {
                setAuctionStatus("RUNNING");
            }
        } else if (status === "RUNNING") {
            const response = await axios.get(`/group/getauctionplayer/${localStorage.getItem("gid")}`);
            // console.log(response);
        }
    }

    const handleOwnerChange = (event) => {
        setSelectedOwner(event.target.value);
    };


    async function sellPlayer() {
        const amount = document.getElementById("standard-required").value;
        console.log(amount);
        let response = await fetch(`/auction/add/${localStorage.getItem("gid")}/${selectedOwner}/${playerId}/${bidAmount}`);
        var msg;
        switch (response.status) { 
            case 707: msg = "Already Purchased"; break;
            case 706: msg = "User does not belong to this group"; break;
            case 704: msg = "Invalid Player"; break;
            case 708: msg = "Insufficient Balance"; break;
            case 200: msg = "Sold"; break;
            default:  msg = `unknown error ${response.status}`; break;
        }
        setPlayerStatus(msg);
        if (response.status === 200) {
            const balance = await axios.get(`/user/balance/${localStorage.getItem("gid")}/all`);
            setAuctionTableData(balance.data);
        }
        setConfirmDialogOpen(false);
        setBackDropOpen(true);
    }

    async function skipPlayer() {
        await fetch(`/auction/skip/${localStorage.getItem("gid")}/${playerId}`);
    }

    function AdminAuction() {
        console.log(`Pid from admin auction ${playerId}`)
        return (<div className={classes.root}>
            <ShowGroupName/>
            <Grid container justify="center" alignItems="center" >
                <GridItem xs={12} sm={12} md={12} lg={12} >
                    <ShowPlayerAvatar pName={playerName} pImage={playerImage} pTeamLogo={team} /> 
                    <ShowValueButtons />
                    <ShowAdminButtons/>
                </GridItem>
            </Grid>
            <ShowBalance/>
            <ShowDialog/>
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
                    <SelctNewOwner/>

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
        );
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

    function ShowPlayerAvatar(props) {
        return (
            <div key="playerInfo">
                <Card profile>                    
                    <CardAvatar profile>
                        <img src={props.pImage} alt="..." />
                    </CardAvatar>
                    <CardBody profile>
                        <h6 className={classes.cardTitle}>{props.pName}</h6>
                        <Grid container justify="center" alignItems="center">
                            <Avatar variant="square" src={`${process.env.PUBLIC_URL}/${props.pTeamLogo}.JPG`} className={classes.medium} />
                        {/* <h4 className={classes.cardCategory}>{role}</h4> */}
                        </Grid>
                        <div align="center">
                            <h6 align="center">
                            {role}<br/>
                            {battingStyle}<br />
                            {bowlingStyle}
                        </h6></div>
                    </CardBody>
                    {/* <Typography>Current Bid Amount: {bidAmount}</Typography> */}
                </Card>
            </div>
        );
    }

    function ShowBalance() {
        return (
            <Table tableHeaderColor="warning" align="center"
                tableHead={["Owner", "Player Count", "Balance"]}
                tableData={AuctionTableData.map(x => {
                    const arr = [x.userName, x.playerCount, x.balance]
                    return { data: arr, collapse: [] }
                })}/>
        );
    }

    async function handleMyBid(newBid) {
        // /nextbid/:groupId/:userId/:bidAmount
        var value = parseInt(newBid) + parseInt(bidAmount);

        console.log(localStorage.getItem("gid"));
        console.log(localStorage.getItem("uid"));
        console.log(value);        
        let myURL=`/auction/nextbid/${localStorage.getItem("gid")}/${localStorage.getItem("uid")}/${value}`;
        console.log(myURL);
        var resp = await axios(myURL);
        console.log(`Bid for value ${newBid}`)
        // setBidAmount();
    }

    function BidButton(props) {
        let btnMsg, btnDisable, btnSize;
        if (props.value === "AMOUNT") {
            btnMsg = `Current Bid Amount:  ${bidAmount}`;
            btnDisable = true;
            btnSize = "medium";
        } else if (props.value === "NAME") {
            btnMsg = `Bid by :  ${bidUser}`;
            btnDisable = true;
            btnSize = "medium";
        } else {
            let newValue = parseInt(bidAmount) + parseInt(props.value);
            if (newValue <= 1000) {
                btnMsg = newValue.toString();
                btnDisable = false;
            } else {
                btnMsg = "---"
                btnDisable = true;
            }
            btnSize = "small";
        }
        if (btnDisable)
            return (
            <Button variant="contained"  size="small" 
            className={classes.infoButton}
            disabled={true}
            onClick={() => { handleMyBid(props.value); }}>
            {btnMsg}
            </Button>
            );
        else
        return (
            <Button variant="contained" color="primary" size="small" 
            className={classes.button}
            // disabled={btnDisable}
            onClick={() => { handleMyBid(props.value); }}>
            {btnMsg}
            </Button>
            );

    }

    // function ShowCurrentBid() {
    //     return (
    //         <div align ="center">
    //             <Typography>Current Bid Amount: {bidAmount}</Typography>
    //             <DisplayPendingButton/>
    //         </div>
    //     );
    // }

    function ShowValueButtons() {
        if (auctionStatus === "RUNNING")
            return (
            <div>
                <div align="center">
                    <BidButton value="AMOUNT"/>
                </div>
                <div align="center">
                    <BidButton value="NAME"/>
                </div>
                <div align="center">
                    <BidButton value="1" />
                    <BidButton value="2" />
                    <BidButton value="3" />
                    <BidButton value="4" />
                    <BidButton value="5" />
                </div>
                <div align="center">
                    <BidButton value="10" />
                    <BidButton value="15" />
                    <BidButton value="20" />
                    <BidButton value="25" />
                    <BidButton value="50" />
                </div>
            </div>);
        else
            return(<div></div>);
    }

    function ShowAdminButtons() {
        if (localStorage.getItem("admin").toLocaleLowerCase() === "true")
            return(
            <div align="center" key="playerAuctionButton">
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    className={classes.button}
                    // startIcon={<CheckSharpIcon />}
                    disabled={bidAmount === 0}
                    onClick={() => { setOpen(true); }}>
                    SOLD
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    className={classes.button}
                    // startIcon={<ClearSharpIcon />}
                    disabled={bidAmount !== 0}
                    onClick={() => skipPlayer()}>
                    UNSOLD
                </Button>
            </div>
            );
        else 
            return(<div></div>);
    }

    function ShowDialog() {
        return (
        <Dialog aria-labelledby="simple-dialog-title" open={backDropOpen}
            onClose={() => setBackDropOpen(false)} >
            <DialogTitle id="simple-dialog-title" className={classes.sold}>{playerStatus}</DialogTitle>
        </Dialog>
        );
    }

    function SelctNewOwner() {
        return (
        <Select labelId="demo-simple-select-label" id="demo-simple-select"
            value={selectedOwner}
            displayEmpty
            onChange={handleOwnerChange}>
            {AuctionTableData.map(item => <MenuItem key={item.uid} value={item.uid}>{item.userName}</MenuItem>)}
        </Select>
        );
    }

    function ShowGroupName() {
        return(
            <div>
                <h3 align="center">Auction ({localStorage.getItem("groupName")})</h3>
                <br/>
            </div>
        );
    }

    function UserAuction() {
        return (
        <Grid container justify="center" alignItems="center" >
        <ShowGroupName/>
        <GridItem xs={12} sm={12} md={4} >
            <ShowPlayerAvatar pName={playerName} pImage={playerImage} pTeamLogo={team} /> 
            <ShowBalance/>
        </GridItem>
        </Grid>
        );
    }

    const startAuction = async () => {
        const response = await axios.get(`/group/setauctionstatus/${localStorage.getItem("gid")}/RUNNING`);
        if (response.data) {
            setAuctionStatus("RUNNING");
        }
    }

    function DisplayPendingButton() {
        /* if current starting pending.
        */ 
        return <Button variant="contained"
            color="primary"
            size="small"
            className={classes.button}
            disabled={localStorage.getItem("admin") !== "true"}            
            // startIcon={<NavigateBeforeIcon />}
            onClick={() => startAuction("PENDING")}>Start Auction</Button>
    }

    function DisplayPending() {
        return (
            <div align ="center">
                <Typography>Auction has not yet started</Typography>
                <DisplayPendingButton/>
            </div>
        );
    }

    if ((localStorage.getItem("gid") !== "") && (localStorage.getItem("gid") !== "0")) {
        if ( auctionStatus === "PENDING") {
            return <DisplayPending/>
        } else if (auctionStatus === "OVER") {
            return <div>Auction is over</div>
        } else if (auctionStatus === "RUNNING") {
            return (<AdminAuction />); 
        } else {
            return (<div></div>);
        } 
    } else
        return <NoGroup/>;
}
