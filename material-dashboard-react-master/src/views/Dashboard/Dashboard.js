import React from "react";
import axios from "axios";
// react plugin for creating charts

// @material-ui/core
import { useEffect, useState } from 'react';
import { makeStyles } from "@material-ui/core/styles";

// @material-ui/icons
import SportsHandballIcon from '@material-ui/icons/SportsHandball';
import TimelineIcon from '@material-ui/icons/Timeline';
import GroupIcon from '@material-ui/icons/Group';

import Update from "@material-ui/icons/Update";

import Accessibility from "@material-ui/icons/Accessibility";


// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";


import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";

import socketIOClient from "socket.io-client";
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
// import {Redirect} from 'react-router-dom';

//  const ENDPOINT = "https://happy-home-ipl-2020.herokuapp.com/";
const ENDPOINT = "http://localhost:4000";



const useStyles = makeStyles(styles);


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
      // console.log(element)
      const { displayName, userName, grandScore, rank } = element;
      //const {rank,displayName,userName,grandScore}=element;
      // return { data: Object.values({ rank, displayName, userName, displayName, grandScore }), collapse: [] }
      return { data: Object.values({ rank, displayName, userName, grandScore }), collapse: [] }
    });

    return arr;
  }

  axios.get(`/stat/sendmydashboard/${localStorage.getItem("gid")}`);
  useEffect(() => {

    // if (!localStorage.getItem("uid"))
    //   return  <Redirect  to="/signIn" />

    socket.on("connect", () => {
      console.log("dashboard connected");
      socket.on("rank", (rank) => {
        // console.log(localStorage.getItem("uid"))
        const allRank = rank.filter(x => x.gid === parseInt(localStorage.getItem("gid")));
        const userDetails = allRank.filter(x => x.uid === parseInt(localStorage.getItem("uid")));

        if (userDetails.length > 0) {
          // if details of current user found (current user is a member of group 1)
          // console.log("Data available");
          setRank(userDetails[0].rank);
          setScore(userDetails[0].grandScore)
          setRankArray(tableData(allRank));
        } else if (localStorage.getItem("admin") === "true") {
          // current user is not member of the group but is ADMIN. Thus show the rank details
          setRankArray(tableData(allRank));
        }

      });

      socket.on("maxRun", (maxRun) => {

        const allMaxRun = maxRun.filter(x => x.gid === parseInt(localStorage.getItem("gid")));
        const runDetails = allMaxRun.filter(x => x.uid === parseInt(localStorage.getItem("uid")));
        // console.log(runDetails)
        if (runDetails.length > 0) {
          setMostRuns(runDetails[0])
        }

      });

      socket.on("maxWicket", (maxWicket) => {
        const allMaxWicket = maxWicket.filter(x => x.gid === parseInt(localStorage.getItem("gid")));
        const wicketDetails = allMaxWicket.filter(x => x.uid === parseInt(localStorage.getItem("uid")));
        // console.log(wicketDetails);
        if (wicketDetails.length > 0) {
          setMostwickets(wicketDetails[0]);
        }

      });
    });



  }, [rankArray]);

  function ShowUserBoard() {
    if (localStorage.getItem("ismember") === "true")
      return(
      <GridContainer>
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
                  {localStorage.getItem("groupName")}
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
                {localStorage.getItem("tournament")}
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
              <h3 className={classes.cardTitle}>{mostRuns ? mostRuns.maxRunPlayerName : ""}</h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <Accessibility />
                {mostRuns ? mostRuns.maxRun : ""}
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
              <h3 className={classes.cardTitle}>{mostWickets ? mostWickets.maxWicketPlayerName : ""}</h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <SportsHandballIcon />
                {mostWickets ? mostWickets.maxWicket : ""}
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
      )
    else
        return(<div></div>);        // no display if not a member
  } 

  function ShowUserRank() {
    if ((localStorage.getItem("ismember") === "true") || (localStorage.getItem("admin") === "true"))
    return(
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
    )
    else 
    return (
      <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader color="warning">
            <h4 className={classes.cardTitleWhite}>Not a member of this group</h4>
          </CardHeader>
        </Card>
      </GridItem>
    </GridContainer>
    )
  }

  const classes = useStyles();
  return (
    <div>
      <ShowUserBoard />
      <ShowUserRank />
    </div>
  );
}
