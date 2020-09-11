import React from "react";
// react plugin for creating charts

// @material-ui/core
import { useEffect, useState,useContext } from 'react';
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



import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

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
  const [mostRuns, setMostRuns] = useState();
  const [mostWickets, setMostwickets] = useState();
  const [mvp, SetMvp] = useState();
  const { user } = useContext(UserContext);
  const date=new Date().toDateString() + " " + new Date().toLocaleTimeString();

  const tableData=(rankDetails)=>{
  const arr=  rankDetails.map(element =>{
    const {displayName,userName,grandScore,rank}=element;
    //const {rank,displayName,userName,grandScore}=element;
    return {data:Object.values({rank,displayName,userName,displayName,grandScore}),collapse:[]}
    });

    return  arr;
  }
  useEffect(() => {

    const fetchRank = async () => {
      try {
        
        const rank = await axios.get(`/stat/rank/${user.uid}`);
        const rankDetails = await axios.get(`/stat/rank/all`);
        const maxRuns = await axios.get(`/stat/maxrun/${user.uid}`);
        const maxWickets = await axios.get(`/stat/maxwicket/${user.uid}`);
      
     
       setRankArray(tableData(rankDetails.data));
        setRank(rank.data[0].rank);
        setScore(rank.data[0].grandScore);
        setMostwickets(maxWickets.data[0].maxWicketPlayerName);
        setMostRuns(maxRuns.data[0].maxRunPlayerName)
      } catch (e) {
        console.log(e)
      }
    }

    fetchRank();

  }, []);
  const classes = useStyles();
  return (
    <div>
      { user && !user.admin?<GridContainer>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="warning" stats icon>
              <CardIcon color="warning">
                <GroupIcon></GroupIcon>
              </CardIcon>
              <h2 className={classes.cardCategory}>Rank</h2>
              <h3 className={classes.cardTitle}>
                {rank}
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <Danger>
                  <Warning />
                </Danger>
                <a href="#pablo" onClick={e => e.preventDefault()}>
                  Get more space
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
                <DateRange />
                Last 24 Hours
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
              <h3 className={classes.cardTitle}>{mostRuns}</h3>
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
            <CardHeader color="danger" stats icon>
              <CardIcon color="danger">
                <SportsHandballIcon />
              </CardIcon>
              <p className={classes.cardCategory}>Most Wickets</p>
              <h3 className={classes.cardTitle}>{mostWickets}</h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <LocalOffer />
                Tracked from Github
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>:""}
      
     
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
                tableHead={[ "Rank", "Franchise", "Owner", "Score"]}
                tableData={rankArray}
              />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
