import React, { useEffect, useState } from 'react';
import axios from "axios";

import Grid from "@material-ui/core/Grid";
import Table from "components/Table/Table.js";
import GridItem from "components/Grid/GridItem.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";

import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { makeStyles, useTheme } from '@material-ui/core/styles';
// import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import socketIOClient from "socket.io-client";

// const ENDPOINT = "https://happy-home-ipl-2020.herokuapp.com/";
const ENDPOINT = "http://localhost:4000";

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
  const classes = useStyles();
  const [teamArray, setTeamArray] = useState([]);
  const socket = socketIOClient(ENDPOINT);
  axios.get(`/stat/sendmystat/${localStorage.getItem("gid")}`);

  useEffect(() => {  
    socket.on("connect", () => {
      console.log("stat connected")
      socket.on("brief", (stat) => {
        var gStat = stat.filter(x => x.gid === parseInt(localStorage.getItem("gid")));
        if (gStat.length > 0) {
          setTeamArray(gStat)
        }
      })
    });

  }, [teamArray])

  function DisplayTeamData() {
      return(
        <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.heading}>Accordion 1</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
            sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      )
  }

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
  return (
    <div className={classes.root}>
      <h3 Statistics of IPL2020/>
      <ShowStats/>
    </div>
  );

};


