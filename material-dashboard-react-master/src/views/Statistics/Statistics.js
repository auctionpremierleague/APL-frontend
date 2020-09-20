import React, { useEffect, useState, useContext } from 'react';
import axios from "axios";


import Grid from "@material-ui/core/Grid";
import Table from "components/Table/Table.js";

import { makeStyles, useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';


import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

import socketIOClient from "socket.io-client";

const ENDPOINT = "https://happy-home-ipl-2020.herokuapp.com/";
// const ENDPOINT = "http://localhost:4000";

export default function App() {

  const useStyles = makeStyles(styles);

  const [teamArray, setTeamArray] = useState([]);


  const socket = socketIOClient(ENDPOINT);


  axios.get("stat/sendmystat")
  useEffect(() => {

  
    socket.on("connect", () => {

      console.log("stat connected")
      socket.on("brief", (stat) => {
        console.log(stat)
        setTeamArray(stat)
      })
    });

  }, [teamArray])


  return (teamArray.map(team =>
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="flex-start"
    >


      <Grid item xs={2}>

      </Grid>

      <Grid item xs={6}>
        <Typography>{team.displayName}</Typography>
        <Table
          tableHeaderColor="warning"
          tableHead={["Player Name", "Score"]}
          tableData={team.playerStat.map(player => {
            const arr = [player.playerName, player.playerScore]

            return { data: arr, collapse: [] }
          })}
        />
      </Grid>


      <Grid item xs={4}>

      </Grid>

    </Grid>

  ));
  // <Grid
  //   container
  //   direction="row"
  //   justify="center"
  //   alignItems="center"
  // >
  //   <Card>
  //     <CardHeader color="warning">
  //       <h4 className={classes.cardTitleWhite}>Franchise Score Board</h4>
  //       <p className={classes.cardCategoryWhite}>

  //       </p>
  //     </CardHeader>
  //     <CardBody>
  //       <Table
  //         tableHeaderColor="warning"
  //         tableHead={["", "Fanchise", "Owner", "Score"]}
  //         tableData={teamArray.map(team => {
  //           const arr = [<Collapsible />, team.displayName, team.userName, team.userScore]

  //           return {
  //             data: arr, collapse: [<Collapse in={open} timeout="auto" unmountOnExit>
  //              hii
  //             </Collapse>]
  //           }
  //         })}
  // tableData={[{
  //   data: [<IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
  //     {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
  //   </IconButton>], collapse: [<Collapse in={open} timeout="auto" unmountOnExit><Typography variant="h6" gutterBottom component="div">
  //     History
  //   </Typography></Collapse>]
  // }]}
  //       />
  //     </CardBody>
  //   </Card>
  // </Grid>

};


