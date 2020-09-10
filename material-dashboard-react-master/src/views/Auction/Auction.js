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
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import Table from "components/Table/Table.js";
import Grid from "@material-ui/core/Grid";
import avatar from "assets/img/faces/marc.jpg";
import GridItem from "components/Grid/GridItem.js";

import Drawer from '@material-ui/core/Drawer';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import IconButton from '@material-ui/core/IconButton';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import CheckSharpIcon from '@material-ui/icons/CheckSharp';
import ClearSharpIcon from '@material-ui/icons/ClearSharp';
import Avatar from "@material-ui/core/Avatar"


import Card from "components/Card/Card.js";
import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";



import Input from '@material-ui/core/Input';


import { UserContext } from "../../UserContext";
import GridContainer from 'components/Grid/GridContainer';
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

    const [playersList, setPlayersList] = useState([]);
    const [playerName, setPlayerName] = useState("");
    const [index, setIndex] = useState(0);
    const [playerImage, setPlayerImage] = useState("");
    const [team, setTeam] = useState("");
    const [role, setRole] = useState("");
    const [battingStyle, setBattingStyle] = useState("");
    const [bowlingStyle, setBowlingStyle] = useState("");
    const [open, setOpen] = useState(false);
    const [drawerContent, setDrawerContent] = useState("Info");

    const [selectedOwner, setSelectedOwner] = useState(null);

    const [backDropOpen, setBackDropOpen] = useState(false);
    const [playerStatus, setPlayerStatus] = useState();
    const [AuctionTableData, setAuctionTableData] = useState([]);


    const handleDrawerClose = () => {
        setOpen(false);
    };

    useEffect(() => {


        const socket = socketIOClient(ENDPOINT);
        socket.on("connect", () => {


            console.log("client connected");

            if (user && !user.admin) {
                socket.on("playerChange", async (newPlayerDetails, index, balanceDetails) => {

                    const { role, Team, battingStyle, bowlingStyle, pid, fullName } = newPlayerDetails
                    setPlayerImage(`${process.env.PUBLIC_URL}/${pid}.JPG`);
                    setRole(role)
                    setTeam(Team)
                    setBattingStyle(battingStyle)
                    setBowlingStyle(bowlingStyle)
                    setPlayerName(fullName)
                    setIndex(index)
                    setAuctionTableData(balanceDetails);
                });
            }
            socket.on("auctionStart", async ({ state, playerDetails ,balanceDetails}) => {
                console.log(state)

                const { role, Team, battingStyle, bowlingStyle, fullName, pid } = playerDetails;

                setAuctionStatus(state);
                setPlayerImage(`${process.env.PUBLIC_URL}/${pid}.JPG`);
                setRole(role)
                setTeam(Team)
                setBattingStyle(battingStyle)
                setBowlingStyle(bowlingStyle)
                setPlayerName(fullName)
                setIndex(0)
                setAuctionTableData(balanceDetails)
            })
        })

        const a = async () => {
            const response = await axios.get("/group/getauctionstatus/1");

            setAuctionStatus(response.data);
            if (response.data === "RUNNING") {

                await startAuction();

            }
        }

        a();


    }, [])




    const sendAuctionPlayer = async ({ pid, role, battingStyle, bowlingStyle, fullName, Team }) => {
        await axios.get(`/group/setauctionplayer/1/${pid}`);

        setPlayerImage(`${process.env.PUBLIC_URL}/${pid}.JPG`);
        setRole(role)
        setTeam(Team)
        setBattingStyle(battingStyle)
        setBowlingStyle(bowlingStyle)
        setPlayerName(fullName)


    }

    const startAuction = async () => {



        if (auctionStatus === "PENDING") {
            const response = await axios.get("/group/setauctionstatus/1/RUNNING");
            if (response.data) {
                setAuctionStatus("RUNNING");
            }
        }

        const playerListResponse = await axios.get('/player')
        setPlayersList(playerListResponse.data);

        const balanceData = await axios.get(user && user.admin ? "/user/balance/all" : `/user/balance/${user && user.uid ? user.uid : "all"}`);
        setAuctionTableData(balanceData.data);

        if (auctionStatus === "PENDING") {
            setIndex(0)
            await sendAuctionPlayer(playerListResponse.data[0]);
        } else {
            const pid = await axios.get("/group/getauctionplayer/1");

            const i = playerListResponse.data.findIndex(player => player.pid === pid.data);

            await sendAuctionPlayer(playerListResponse.data[i]);
            setRole(playerListResponse.data[i].role)
            setTeam(playerListResponse.data[i].Team)
            setBattingStyle(playerListResponse.data[i].battingStyle)
            setBowlingStyle(playerListResponse.data[i].bowlingStyle)
            setPlayerName(playerListResponse.data[i].fullName)
            setIndex(i)
        }

    }
    const handleOwnerChange = (event) => {
        setSelectedOwner(event.target.value);
    };


    async function sellPlayer() {


        const amount = document.getElementById("standard-required").value;
        let response = await fetch(`/auction/add/1/${selectedOwner}/${playersList[index].pid}/${amount}`);
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

        setBackDropOpen(true)
    }

    function Image() {
        return <React.Fragment>
            <img className={classes.image}

                alt="Contemplative Reptile"

                src={playerImage}
                title="Contemplative Reptile"
            />
        </React.Fragment>
    }

    function PlayerInfo() {
        return <React.Fragment>
            <Typography >
                Team : {team}
            </Typography>
            <Typography >
                Role : {role}
            </Typography>
            <Typography >
                Bat : {battingStyle}
            </Typography>
            <Typography >
                Bowl : {bowlingStyle}
            </Typography>
        </React.Fragment>
    }

    function AdminAuction() {
        return <div className={classes.root}>


            <Grid container alignContent="center" alignItems="center"
            >
                {user && user.admin ? <Grid item xs={3} >
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        className={classes.button}
                        startIcon={<NavigateBeforeIcon />}
                        onClick={() => {
                            sendAuctionPlayer(playersList[index - 1]);

                            setIndex(index - 1)
                        }}>

                    </Button>
                </Grid> : ""}


                <Grid item xs={6}>

                    <div  >


                        <Image />
                        <InfoOutlinedIcon onClick={() => { setOpen(true) }} />
                        <Typography >
                            {playerName}
                        </Typography>
                        {user && user.admin ? <div> <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            className={classes.button}
                            startIcon={<CheckSharpIcon />}
                            onClick={() => { setOpen(true); setDrawerContent("franchiseInfo"); }}>
                            SOLD
    </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                className={classes.button}
                                startIcon={<ClearSharpIcon />}
                                onClick={() => setIndex(index - 1)}>
                                UNSOLD
    </Button></div> : ""}



                        {/* <TextField id="outlined-basic" label="Outlined" variant="outlined" /> */}

                    </div>

                </Grid>

                {user && user.admin ? <Grid item xs={3} >
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        className={classes.button}
                        endIcon={<NavigateNextIcon />}
                        onClick={() => {


                            sendAuctionPlayer(playersList[index + 1]);

                            setIndex(index + 1)

                        }}>

                    </Button>
                </Grid> : ""}

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
                {drawerContent === "Info" ? <PlayerInfo /> : <div> <FormControl className={classes.formControl}>

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
                        onClick={() => sellPlayer()}>
                        Confirm
</Button></div>}

            </Drawer>


        </div>
    }

    function AdminPending() {
        return <Button variant="contained"
            color="secondary"
            size="small"
            className={classes.button}
            startIcon={<NavigateBeforeIcon />}
            onClick={() => startAuction()}>Start Auction</Button>
    }

    function UserAuctionPending() {
        return <Typography>Auction has not been started by Admin! <br /> Auction is Coming !!</Typography>
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

        auctionStatus === "PENDING" ? user && user.admin ? <AdminPending /> : <UserAuctionPending /> : user && user.admin ? <AdminAuction /> : <UserAuction />


    );

}
