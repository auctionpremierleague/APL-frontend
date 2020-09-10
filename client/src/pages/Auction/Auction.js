import React, { useEffect, useState ,useContext} from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Backdrop from "@material-ui/core/Backdrop";
//import Card from '@material-ui/core/Card';
//import CardActionArea from '@material-ui/core/CardActionArea';
//import CardActions from '@material-ui/core/CardActions';
//import CardContent from '@material-ui/core/CardContent';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
import DoneIcon from '@material-ui/icons/Done';
//import CardMedia from '@material-ui/core/CardMedia';
//import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
//import Paper from '@material-ui/core/Paper';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
//import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Drawer from '@material-ui/core/Drawer';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import IconButton from '@material-ui/core/IconButton';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import CheckSharpIcon from '@material-ui/icons/CheckSharp';
import ClearSharpIcon from '@material-ui/icons/ClearSharp';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
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
    }
}));


export default function ImgMediaCard() {
    const classes = useStyles();
    const theme = useTheme();

   
    const [next, setNext] = useState(false)
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
    const [ownerArr, setOwnerArr] = useState([]);
    const [selectedOwner, setSelectedOwner] = useState(8);
    const [bidAmount, setBidAmount] = useState(0);
    const [backDropOpen, setBackDropOpen] = useState(false);
    const [playerStatus, setPlayerStatus] = useState();
    const handleDrawerClose = (event) => {
        setOpen(false);
    };
    useEffect(() => {
        if (playersList[index]) {
            setPlayerName(playersList[index].name)
            setPlayerImage(`../${playersList[index].pid}.jpg`);
            setTeam(playersList[index].Team);
            setRole(playersList[index].role);
            setBattingStyle(playersList[index].battingStyle);
            setBowlingStyle(playersList[index].bowlingStyle)
            setNext(true)
        }

    }, [index, playersList, next])


    if (playersList.length === 0) {
        Promise.all([fetch('http://localhost:4000/player'
        ), fetch("http://localhost:4000/user/group/1")]).then(res => {
            console.log(res)
            res[0].clone().json().then(j => {
                setPlayersList(j);
                setIndex(0)
            });
            res[1].clone().json().then(data => setOwnerArr(data))
        });
    }

    const handleOwnerChange = (event) => {
        setSelectedOwner(event.target.value);
    };
    const handleBidAmountChange = (event) => {
        //event.preventDefault();
        setBidAmount(event.target.value);
    };

    async function sellPlayer() {

        let response = await fetch(`http://localhost:4000/auction/add/1/${selectedOwner}/${playersList[index].pid}/${bidAmount}`);
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
        if (response.status ===200) {
            setPlayerStatus("SOLD")
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
    return (
        <div className={classes.root}>
            <Grid container alignContent="center" alignItems="center"
            >

                <Grid item xs={3} >
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        className={classes.button}
                        startIcon={<NavigateBeforeIcon />}
                        onClick={() => setIndex(index - 1)}>

                    </Button>
                </Grid>

                <Grid item lg={6} xs={6}>
                    <Slide direction="left" in={next} mountOnEnter unmountOnExit>
                        <div  >


                            <Image />
                            <InfoOutlinedIcon onClick={() => { setOpen(true) }} />
                            <Typography >
                                {playerName}
                            </Typography>

                            <Button
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
                    </Button>


                            {/* <TextField id="outlined-basic" label="Outlined" variant="outlined" /> */}

                        </div>
                    </Slide >
                </Grid>
                <Grid item xs={3} >
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        className={classes.button}
                        endIcon={<NavigateNextIcon />}
                        onClick={() => setIndex(index + 1)}>

                    </Button>
                </Grid>
            </Grid>


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
                {drawerContent === "Info"  ? <PlayerInfo /> : <div> <FormControl className={classes.formControl}>

                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedOwner}
                        displayEmpty
                        onChange={handleOwnerChange}
                    >
                        {ownerArr.map(item => <MenuItem key={item.uid} value={item.uid}>{item.displayName}</MenuItem>)}

                    </Select>

                </FormControl>
                    <Input key="hi" id="standard-required" label="Bid Amount" type="number" value={bidAmount} onChange={handleBidAmountChange} />
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
    );

}
