import React, { useEffect, useState, useContext } from 'react';
import axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
// import { Switch, Route, Link } from 'react-router-dom';
import Table from "components/Table/Table.js";
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import Box from '@material-ui/core/Box';
import { UserContext } from "../../UserContext";
import { NoGroup, DisplayPageHeader, MessageToUser } from 'CustomComponents/CustomComponents.js';
import { hasGroup } from 'views/functions';
import { red, blue } from '@material-ui/core/colors';
import { updateLanguageServiceSourceFile } from 'typescript';
import { BlankArea } from 'CustomComponents/CustomComponents';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from "@material-ui/core/CardActions";
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import {setTab} from "CustomComponents/CricDreamTabs.js"

const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
    },
    ngCard: {
      fontSize: theme.typography.pxToRem(16),
      fontWeight: theme.typography.fontWeightBold,
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
    error:  {
        // right: 0,
        fontSize: '12px',
        color: red[700],
        alignItems: 'center',
        marginTop: '0px',
    },
    updatemsg:  {
        // right: 0,
        fontSize: '12px',
        color: blue[700],
        // position: 'absolute',
        alignItems: 'center',
        marginTop: '0px',
    },
    hdrText:  {
        // right: 0,
        // fontSize: '12px',
        // color: red[700],
        // // position: 'absolute',
        align: 'center',
        marginTop: '0px',
        marginBottom: '0px',
    },

    }));



export default function Home() {

    window.onbeforeunload = () => setUser("")
    // const { setUser } = useContext(UserContext);
    const classes = useStyles();
    const [tournamentList, setTournamentList] = useState([]);
    const [registerStatus, setRegisterStatus] = useState(0);

    useEffect(() => {
        const a = async () => {
            var response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/tournament/list/notstarted`); 
            setTournamentList(response.data);
            //SetSelectedTournament(response.data[0].name);
        }
        a();
    }, [])

    function ShowResisterStatus() {
        // console.log(`Status is ${registerStatus}`);
        let myMsg;
        let errmsg = true;
        switch (registerStatus) { 
          case 200:
            myMsg = "Successfully updated Captain / ViceCaptain details";
            errmsg = false;
            break;
          case 0:
            myMsg = "";
            errmsg = false;
            break;
          default:
            myMsg = "Error updating Captain / ViceCaptain details";
            break;
        }
        let myClass = (errmsg) ? classes.error : classes.root;
        return(
          <div>
            <Typography align="center" className={myClass}>{myMsg}</Typography>
          </div>
        );
    }
    
    function handleCreate(tName) {
      localStorage.setItem("cGroup", tName);
      //console.log(`New group create ${tName}`);
      setTab(1001);
    }

    function handleJoin() {
      //console.log("Join group");
      setTab(1002);
    }


    function ShowTournamentCards() {
    return (tournamentList.map(x =>
        <div>
        {/* <Box borderColor="primary" borderRadius={16} border={2}> */}
        <Box borderColor="primary" border={1}>
        <Card gutterBottom>
        <CardContent>
        <Typography className={classes.ngCard} align="center">{x.name}</Typography>
        </CardContent>
        <CardActions>
        <Grid key="gr-group" container justify="center" alignItems="center" >
          <Grid item xs={4} sm={4} md={4} lg={4} >
            <Button  
              align="left"
              variant="contained"
              size="small" color="primary"
              className={classes.submit}
              onClick={() => handleCreate(x.name)  }>
              New Group
            </Button>
          </Grid>
          <Grid item xs={4} sm={4} md={4} lg={4} />
          <Grid item xs={4} sm={4} md={4} lg={4} >
            <Button 
              align="right"
              variant="contained"
              size="small" color="primary"
              className={classes.submit}
              onClick={handleJoin}>
              Join Group
            </Button>
          </Grid>
        </Grid>
        </CardActions>
        </Card>
        </Box>
        <BlankArea/>
        </div>
        ))      
    }

    return (
    <div className={classes.root} key="uctournament">
    <BlankArea/>
    <DisplayPageHeader headerName="Upcoming Tournament" groupName="" tournament=""/>
    <BlankArea/>
    <ShowTournamentCards/>
    </div>
    );
    }
