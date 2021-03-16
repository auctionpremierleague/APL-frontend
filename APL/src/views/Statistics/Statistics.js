import React, { useEffect, useState } from 'react';
import Grid from "@material-ui/core/Grid";
import Table from "components/Table/Table.js";
import GridItem from "components/Grid/GridItem.js";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
// import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import {red, blue, green, yellow} from '@material-ui/core/colors';

import socketIOClient from "socket.io-client";
import { NoGroup, DisplayPageHeader, 
  ShowCreateGroup, ShowJoinGroup, ShowAuctionGroup, ShowCaptainGroup, ShowMultipleGroup
} from 'CustomComponents/CustomComponents.js';
// import {socketPoint} from "views/functions.js";

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));
  

function leavingStatistics(myConn) {
  console.log("Leaving Statistics wah wah ");
  myConn.disconnect();
}

export default function Stats() { 
  const classes = useStyles();
  const [teamArray, setTeamArray] = useState([]);

  useEffect(() => {  
    const makeconnection = async () => {
      await socket.connect();
    }

    const socket = socketIOClient(process.env.REACT_APP_ENDPOINT);

    makeconnection();

    socket.on("connect", () => {
      // console.log(`STATS gis ${localStorage.getItem("gid")}`);
      var sendMessage = {page: "STAT", gid: localStorage.getItem("gid"), uid: localStorage.getItem("uid") };
      socket.emit("page", sendMessage);
      // console.log("stat connected")

      socket.on("brief", (stat) => {
        var gStat = stat.filter(x => x.gid === parseInt(localStorage.getItem("gid")));
        if (gStat.length > 0) {
          setTeamArray(gStat)
          // console.log(gStat);
        }
      })
    });

    return () => {
      // componentwillunmount in functional component.
      // Anything in here is fired on component unmount.
      leavingStatistics(socket);
    }
  }, []);


  const [expandedPanel, setExpandedPanel] = useState(false);
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    // console.log({ event, isExpanded });
    setExpandedPanel(isExpanded ? panel : false);
  };

  const [noGroupPanel, setNGExpandedPanel] = useState(false);
  const handleNoGroupChange = (panel) => (event, isExpanded) => {
    // console.log({ event, isExpanded });
    setNGExpandedPanel(isExpanded ? panel : false);
  };

  const NGStyles = makeStyles((theme) => ({
    ngHeader: {
      fontSize: theme.typography.pxToRem(18),
      fontWeight: theme.typography.fontWeightBold,
    },
    ngCard: {
      backgroundColor: '#B3E5FC',
    },
  }));
  
  
  function ShowNoGroup() {
    const classes = NGStyles();
    return (
      <Card className={classes.ngCard}>
      <CardContent>
      <Typography paragraph>
      Welcome to Aution Premier League (APL).
      </Typography>
      <Typography paragraph>
      You need to be a member of the group. You can Create New Group by clicking on "Group Icon" (on right hand side) and select "New Group".
      </Typography>
      <Typography paragraph>
      If your friend has created the group and shared the groupcode, just click on "Group Icon" (on right hand side) and select "Join Group".
      </Typography>
      <Typography paragraph>
      Once you join the group, enjoy the game. Auction Players, select Captain and Vice Captain.
      </Typography>
      <Typography paragraph>
      Once the tournament starts, APL will automatically assign the points based on performance of players.
      </Typography>
      <Typography paragraph>
      Dashbord will show the details of your group and Stats will show the point allocation.
      </Typography>
      <Accordion expanded={noGroupPanel === "CREATE"} onChange={handleNoGroupChange("CREATE")}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
      <Typography className={classes.ngHeader}>Create Group</Typography>
      </AccordionSummary>
      <AccordionDetails><ShowCreateGroup/></AccordionDetails>
      </Accordion>
      <Accordion expanded={noGroupPanel === "JOIN"} onChange={handleNoGroupChange("JOIN")}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
      <Typography className={classes.ngHeader}>Join Group</Typography>
      </AccordionSummary>
      <AccordionDetails><ShowJoinGroup/></AccordionDetails>
      </Accordion>
      <Accordion expanded={noGroupPanel === "AUCTION"} onChange={handleNoGroupChange("AUCTION")}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
      <Typography className={classes.ngHeader}>Auction</Typography>
      </AccordionSummary>
      <AccordionDetails><ShowAuctionGroup/></AccordionDetails>
      </Accordion>
      <Accordion expanded={noGroupPanel === "CAPTAIN"} onChange={handleNoGroupChange("CAPTAIN")}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
      <Typography className={classes.ngHeader}>Captain and ViceCaptain</Typography>
      </AccordionSummary>
      <AccordionDetails><ShowCaptainGroup/></AccordionDetails>
      </Accordion>
      <Accordion expanded={noGroupPanel === "MULTIPLE"} onChange={handleNoGroupChange("MULTIPLE")}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
      <Typography className={classes.ngHeader}>Multiple Group</Typography>
      </AccordionSummary>
      <AccordionDetails><ShowMultipleGroup/></AccordionDetails>
      </Accordion>
      </CardContent>
      </Card>
    )
  };
  
  function ShowStats() {  
      // console.log(teamArray);
      return (teamArray.map(team =>
      <Accordion expanded={expandedPanel === team.displayName} onChange={handleAccordionChange(team.displayName)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography className={classes.heading}>{team.displayName} ({team.userScore})</Typography>
          </AccordionSummary>
          <AccordionDetails>
              <Grid container justify="center" alignItems="center" >
                  <GridItem xs={12} sm={12} md={12} lg={12} >
                      <Table
                          tableHeaderColor="warning"
                          tableHead={["Player Name", "Score"]}
                          tableData={team.playerStat.map(player => {
                              const arr = [player.playerName, player.playerScore]
                              return { data: arr, collapse: [] }
                          })}
                      />
                  </GridItem>
              </Grid>
          </AccordionDetails>
      </Accordion>
      ))
  }
  if (localStorage.getItem("tournament").length > 0)
  return (
    <div className={classes.root}>
      <DisplayPageHeader headerName="Statistics" groupName={localStorage.getItem("groupName")} tournament={localStorage.getItem("tournament")}/>
      <ShowStats/>
    </div>
  );
  else
    return <ShowNoGroup/>;
};


