import React, { useEffect, useState } from 'react';
import { makeStyles,useTheme } from '@material-ui/core/styles';
//import Card from '@material-ui/core/Card';
//import CardActionArea from '@material-ui/core/CardActionArea';
//import CardActions from '@material-ui/core/CardActions';
//import CardContent from '@material-ui/core/CardContent';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
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
const drawerWidth = 100;
const useStyles = makeStyles((theme) => ({
    margin: {
        margin: theme.spacing(1),
    },
    image:{
        height:"200px"
    },
    container: {
        backgroundImage: "url(\"../RCB/5334.jpg\")",
        backgroundSize: 'cover'
    },drawer: {
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
    const [team,setTeam]=useState("");
    const [role,setRole]=useState("");
    const [battingStyle,setBattingStyle]=useState("");
    const[bowlingStyle,setBowlingStyle]=useState("");
    const[open,setOpen]=useState(false);
    const[drawerContent,setDrawerContent]=useState("Info");

    const handleDrawerClose = () => {
        setOpen(false);
      };
    useEffect(() => {
        if (playersList[index]) {
            setPlayerName(playersList[index].name)
            setPlayerImage(`../${playersList[index].Team}/${playersList[index].pid}.jpg`);
            setTeam(playersList[index].Team);
            setRole(playersList[index].role);
            setBattingStyle(playersList[index].battingStyle);
            setBowlingStyle(playersList[index].bowlingStyle)
            setNext(true)
        }

    }, [index, playersList, next])


    if (playersList.length === 0) {
        fetch('http://192.168.29.191:4000/players', {
            method: "GET"
        }).then(res => {
            res.json().then(j => {
                setPlayersList(j);
                setIndex(0)
            });
        });
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

    function PlayerInfo(){
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

                <Grid item  xs={3} >
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        className={classes.button}
                        startIcon={<NavigateBeforeIcon />}
                        onClick={() => setIndex(index - 1)}>

                    </Button>
                </Grid>

                <Grid item  lg={6} xs={6}>
                    <Slide direction="left" in={next} mountOnEnter unmountOnExit>
                        <div  >
                      
                         
                            <Image />
                            <InfoOutlinedIcon onClick={()=>{setOpen(true)}}/>
                            <Typography >
                                {playerName}
                            </Typography>

                            <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        className={classes.button}
                        startIcon={<CheckSharpIcon />}
                        onClick={() => {setOpen(true);setDrawerContent("franchiseInfo");}}>
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
                            

                    <TextField id="outlined-basic" label="Outlined" variant="outlined" />

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
           {drawerContent==="Info"?<PlayerInfo/>:<PlayerInfo/>}
                            
            </Drawer>
        </div>
    );

}
