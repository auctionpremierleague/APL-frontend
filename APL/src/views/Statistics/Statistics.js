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
// import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import socketIOClient from "socket.io-client";
import { NoGroup, DisplayPageHeader } from 'CustomComponents/CustomComponents.js';
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

  function ShowStats() {  
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
    return <NoGroup/>;
};


