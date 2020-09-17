import React from "react";
// react plugin for creating charts

// @material-ui/core
import { useEffect, useState, useContext } from 'react';
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";

// @material-ui/icons
import SportsHandballIcon from '@material-ui/icons/SportsHandball';
import TimelineIcon from '@material-ui/icons/Timeline';
import GroupIcon from '@material-ui/icons/Group';
import Warning from "@material-ui/icons/Warning";
import DateRange from "@material-ui/icons/DateRange";
import LocalOffer from "@material-ui/icons/LocalOffer";
import Update from "@material-ui/icons/Update";

import Accessibility from "@material-ui/icons/Accessibility";


// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";

import Danger from "components/Typography/Danger.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";


import { UserContext } from "../../UserContext";

import socketIOClient from "socket.io-client";
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

const ENDPOINT = "https://happy-home-ipl-2020.herokuapp.com/";
// const ENDPOINT = "http://localhost:4000";



const useStyles = makeStyles(styles);
const uid = 8;

const getMVP = (stats) => {

  const mvp = stats.reduce((prev, current) => (prev.playerScrore > current.playerScrore) ? prev : current, "");
  return mvp.pid;
}


export default function Dashboard() {

  const [rankArray, setRankArray] = useState([]);
  const [rank, setRank] = useState();
  const [score, setScore] = useState(0);
  const [mostRuns, setMostRuns] = useState({});
  const [mostWickets, setMostwickets] = useState({});
  // const [mvp, SetMvp] = useState();
  // const { user } = useContext(UserContext);
  const date = new Date().toDateString() + " " + new Date().toLocaleTimeString();
  const socket = socketIOClient(ENDPOINT);



  const tableData = (rankDetails) => {
    const arr = rankDetails.map(element => {
      const { displayName, userName, grandScore, rank } = element;
      //const {rank,displayName,userName,grandScore}=element;
      return { data: Object.values({ rank, displayName, userName, displayName, grandScore }), collapse: [] }
    });

    return arr;
  }
  useEffect(() => {

    socket.on("connect", () => {
      console.log("dashboard connected");
      socket.on("rank", (rank) => {
        console.log(rank)
        if (rank.length) {
          setRank(rank[localStorage.getItem("uid")].rank);
          setScore(rank[localStorage.getItem("uid")].grandScore)
          setRankArray(tableData(rank));
        }

      });

      socket.on("maxRun", (maxRun) => {

        if (maxRun.length) { setMostRuns(maxRun[localStorage.getItem("uid")]) }

      });

      socket.on("maxWicket", (maxWicket) => {
        if (maxWicket.length) { setMostwickets(maxWicket[localStorage.getItem("uid")]) }

      });
    });



  }, [rankArray]);
  const classes = useStyles();
  return (
    <div>
      { localStorage.getItem("admin") === "false" ? <GridContainer>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="warning" stats icon>
              <CardIcon color="warning">
                <GroupIcon />
              </CardIcon>
              <h2 className={classes.cardCategory}>Rank</h2>
              <h3 className={classes.cardTitle}>
                {rank}
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <GroupIcon />
                <a href="#pablo" onClick={e => e.preventDefault()}>
                  IPL 2020
                </a>
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="success" stats icon>
              <CardIcon color="success">
                <TimelineIcon />
              </CardIcon>
              <p className={classes.cardCategory}>Total Points</p>
              <h3 className={classes.cardTitle}>{score}</h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <Update />
                Just Updated
              </div>
            </CardFooter>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="info" stats icon>
              <CardIcon color="info">
                <Accessibility />
              </CardIcon>
              <p className={classes.cardCategory}>Most Runs</p>
              <h3 className={classes.cardTitle}>{mostRuns.maxRunPlayerName}</h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <Accessibility />
                {mostRuns.maxRun}
              </div>
            </CardFooter>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="danger" stats icon>
              <CardIcon color="danger">
                <SportsHandballIcon />
              </CardIcon>
              <p className={classes.cardCategory}>Most Wickets</p>
              <h3 className={classes.cardTitle}>{mostWickets.maxWicketPlayerName}</h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <SportsHandballIcon />
                {mostWickets.maxWicket}
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer> : ""}


      <GridContainer>

        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="warning">
              <h4 className={classes.cardTitleWhite}>Franchise Score Board</h4>
              <p className={classes.cardCategoryWhite}>
                {`Updated as of ${date}`}
              </p>
            </CardHeader>
            <CardBody>
              <Table
                tableHeaderColor="warning"
                tableHead={["Rank", "Franchise", "Owner", "Score"]}
                tableData={rankArray}
              />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
