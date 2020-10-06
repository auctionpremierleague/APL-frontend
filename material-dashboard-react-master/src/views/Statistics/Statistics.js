import React, { useEffect, useState } from 'react';
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import Table from "components/Table/Table.js";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


// import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

import socketIOClient from "socket.io-client";

const ENDPOINT = "https://happy-home-ipl-2020.herokuapp.com/";
// const ENDPOINT = "http://localhost:4000";

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

export default function App() {

  // const useStyles = makeStyles(styles);
  const classes = useStyles(); 
  const [teamArray, setTeamArray] = useState([]);
  const socket = socketIOClient(ENDPOINT);


  axios.get("stat/sendmystat")
  useEffect(() => {
  
    socket.on("connect", () => {
      console.log("stat connected")
      socket.on("brief", (stat) => {
        // console.log(stat)
        setTeamArray(stat)
      })
    });

  }, [teamArray])

  const [expandedPanel, setExpandedPanel] = useState(false);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    console.log({ event, isExpanded });
    setExpandedPanel(isExpanded ? panel : false);
  };

  function ShowStats() {
    return (teamArray.map(team =>
      <Accordion expanded={expandedPanel === team.displayName} onChange={handleAccordionChange(team.displayName)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
          <Typography className={classes.heading}>{team.displayName} ({team.userScore})</Typography>
        </AccordionSummary>
        <AccordionDetails>
        <Grid item xs={6}>
          <Table
            tableHeaderColor="warning"
            tableHead={["Player Name", "Score"]}
            tableData={team.playerStat.map(player => {
              const arr = [player.playerName, player.playerScore]
              return { data: arr, collapse: [] }
            })}
          />
      </Grid>
        </AccordionDetails>
      </Accordion>
    ));
  }

  return (
    <div className={classes.root}>
      <ShowStats/>
    </div>
  );

  // return (teamArray.map(team =>
  //   <Grid
  //     container
  //     direction="row"
  //     justify="center"
  //     alignItems="flex-start"
  //   >
  //     <Grid item xs={2}>
  //     </Grid>
  //     <Grid item xs={6}>
  //       <Typography>{team.displayName}</Typography>
  //       <Table
  //         tableHeaderColor="warning"
  //         tableHead={["Player Name", "Score"]}
  //         tableData={team.playerStat.map(player => {
  //           const arr = [player.playerName, player.playerScore]
  //           return { data: arr, collapse: [] }
  //         })}
  //       />
  //     </Grid>
  //     <Grid item xs={4}>
  //     </Grid>
  //   </Grid>
  // ));

};


