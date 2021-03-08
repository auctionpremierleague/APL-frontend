import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Grid from "@material-ui/core/Grid";
import Table from "components/Table/Table.js";
import GridItem from "components/Grid/GridItem.js";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core/styles';
import {BlankArea} from "CustomComponents/CustomComponents.js"
// import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
//import socketIOClient from "socket.io-client";
import { DisplayPageHeader, DisplayVersion } from 'CustomComponents/CustomComponents.js';
import {currentAPLVersion, latestAPLVersion} from "views/functions.js";
import { blue, red } from '@material-ui/core/colors';



const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  card: {
    backgroundColor: '#B3E5FC',
  },
  t20Card: {
    backgroundColor: '#D3D3D3',
  },
  odiCard: {
    backgroundColor: '#B3E5FC',
  },
  testCard: {
    backgroundColor: '#FFC0CB',
  },
  note: {
    fontWeight: theme.typography.fontWeightBold,
    fontStyle: "italic",
  },
  heading: {
    fontSize: theme.typography.pxToRem(20),
    fontWeight: theme.typography.fontWeightBold,
    color: blue[800],
  },
  bold: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightBold,
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    backgroundColor: red[500],
  },
}));
  

export default function About() { 
  const classes = useStyles();
  // const [expanded, setExpanded] = React.useState(false);
   const [matchType, setMatchType] = useState("T20");
   const [currentVersion, setCurrentVersion] = useState(9.9);
   const [latestVersion, setLatestVersion] = useState(8.8);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };


  useEffect(() => {  
    const getVersion = async () => { 
      let v1 = await currentAPLVersion();
      let v2 = await latestAPLVersion();
      setCurrentVersion(v1);
      setLatestVersion(v2);   
    }
    getVersion()
  }, []);


  const [expandedPanel, setExpandedPanel] = useState(false);
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    // console.log({ event, isExpanded });
    setExpandedPanel(isExpanded ? panel : false);
  };
  
  function DisplayImage(props) {
    let imageName = `${process.env.PUBLIC_URL}/about/${props.image}`
    return (
    <div>
    <CardMedia className={classes.media} image={imageName} title={props.title} />
    <BlankArea/>
    </div>
    )
  }

  function ShowGif() {
    let logo=`${process.env.PUBLIC_URL}/animation/sample.gif`;
    return(
    <img src={logo} alt="loading..." />
    )
  };

  function Note() {
    return (
    <Typography className={classes.note}>Note:</Typography>
    )}

  function DisplayBold(props) {
  return (
    <Typography className={classes.bold} paragraph>{props.message}</Typography>  
  )}

  function DisplayHeader(props) {
  return(
    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
    <Typography className={classes.heading}>{props.header}</Typography>
    </AccordionSummary>   
  )}
  
  function DisplayPoint(props) {
  return (
  <div>
  <Grid key={props.akey} container>
  <Grid item xs={8} sm={8} md={8} lg={8} >
  <Typography>{props.akey}</Typography>
  {/* <Typography paragraph>{props.value}</Typography> */}
  </Grid>
  <Grid item xs={4} sm={4} md={4} lg={4} >
  <Typography>{props.value}</Typography>
  </Grid>
  </Grid>
  </div> 
  )}

  function DisplayMatchType() {
  //console.log(matchType);
  return(
    <Grid key="matchtype" align="center" container>
    <Grid item xs={4} sm={4} md={4} lg={4} >
    <Button key="mt_t20" variant="contained" color="primary" size="small"
    className={classes.button} onClick={() => {setMatchType("T20")}}>T20
    </Button>
    </Grid>
    <Grid item xs={4} sm={4} md={4} lg={4} >
    <Button key="mt_odi" variant="contained" color="primary" size="small"
    className={classes.button} onClick={() => {setMatchType("ODI")}}>ODI
    </Button>
    </Grid>
    <Grid item xs={4} sm={4} md={4} lg={4} >
    <Button key="mt_test" variant="contained" color="primary" size="small"
    className={classes.button} onClick={() => {setMatchType("TEST")}}>TEST
    </Button>
    </Grid>
    </Grid>      
  )};

  function PS_Header(props) {
  return(<h4 align="center">{props.header}</h4>)
  }

  function T20_PointSystem() {
  return (
    <Card className={classes.t20Card}>
    <CardContent>
    <PS_Header header="T20 Point system" />
    <DisplayBold message="Batting Points:" />
    <DisplayPoint akey="● Run" value="1 point"/>
    <DisplayPoint akey="● Boundary bonus" value="1 point" />
    <DisplayPoint akey="● Six bonus" value="2 point" />
    <DisplayPoint akey="● Half century bonus" value="20 point" />
    <DisplayPoint akey="● Century bonus" value="50 point" />
    <DisplayPoint akey="● Double century bonus" value="100 point" />
    <DisplayPoint akey="● Duck Penalty" value="-2 point" />
    <Note/>
    <Typography paragraph>
    If any player scores century in a match will only 
    get bonus point of century no extra 
    bonus point for half-century.
    Same rule applies for Double century.
    </Typography>
    <DisplayBold message="Bowling Points:"/>
    <DisplayPoint akey="● Wicket (except runout)" value="25 point" />
    <DisplayPoint akey="● 3 wicket bonus" value="20 point" />
    <DisplayPoint akey="● 5 wicket bonus" value="50 point" />
    <DisplayPoint akey="● Maiden Over bonus" value="20 point" />
    <Note/>
    <Typography paragraph>
    If any player gets 5 wicket in a match only the bonus point of 5 wicket haul is awarded. No extra bonus points for 3 wicket haul. 
    </Typography>
    <DisplayBold message="Fielding Points:"/>
    <DisplayPoint akey="● Catch" value="4 point" />
    <DisplayPoint akey="● Run out" value="4 point" />
    <DisplayPoint akey="● Stumping" value="6 point" />
    <BlankArea/>
    <DisplayBold message="Economy Points:"/>
    <DisplayPoint akey="● Runs/over <= 6.0" value="2 point" />
    <DisplayPoint akey="● Runs/over >= 9.0" value="-2 point" />
    <Note/>
    <Typography paragraph>
    Minimum 2 over need to be bowled by player to check economy.
    </Typography>
    <DisplayBold message="Performance Points:"/>
    <DisplayPoint akey="● Man of the Match " value="20 point" />
    <DisplayPoint akey="● Tournament Max Runs" value="100 point" />
    <DisplayPoint akey="● Tournament Max Wickets" value="100 point" />
    <BlankArea/>
    <DisplayBold message="Captain and ViceCaptain:"/>
    <DisplayPoint akey="● Caption" value="2x point" />
    <DisplayPoint akey="● ViceCaption" value="1.5x point" />
    <Note/>
    <Typography paragraph>
    Only points of runs and wickets will considered for 2x for Captain and 1.5x for ViceCaptain.
    </Typography>
    </CardContent>
    </Card>
  )}

  function ODI_PointSystem() {
  return(
    <Card className={classes.odiCard}>
    <CardContent>
    <PS_Header header="ODI Point system" />
    <DisplayBold message="Batting Points:" />
    <DisplayPoint akey="● Run" value="1 point"/>
    <DisplayPoint akey="● Boundary bonus" value="1 point" />
    <DisplayPoint akey="● Six bonus" value="2 point" />
    <DisplayPoint akey="● Half century bonus" value="20 point" />
    <DisplayPoint akey="● Century bonus" value="50 point" />
    <DisplayPoint akey="● Double century bonus" value="100 point" />
    <DisplayPoint akey="● Duck Penalty" value="-2 point" />
    <Note/>
    <Typography paragraph>
    If any player scores century in a match will only 
    get bonus point of century no extra 
    bonus point for half-century.
    Same rule applies for Double century.
    </Typography>
    <DisplayBold message="Bowling Points:"/>
    <DisplayPoint akey="● Wicket (except runout)" value="25 point" />
    <DisplayPoint akey="● 4 wicket bonus" value="20 point" />
    <DisplayPoint akey="● 5 wicket bonus" value="50 point" />
    <DisplayPoint akey="● Maiden Over bonus" value="10 point" />
    <Note/>
    <Typography paragraph>
    If any player gets 5 wicket in a match only the bonus point of 5 wicket haul is awarded. No extra bonus points for 4 wicket haul. 
    </Typography>
    <DisplayBold message="Fielding Points:"/>
    <DisplayPoint akey="● Catch" value="4 point" />
    <DisplayPoint akey="● Run out" value="4 point" />
    <DisplayPoint akey="● Stumping" value="6 point" />
    <BlankArea/>
    <DisplayBold message="Economy Points:"/>
    <DisplayPoint akey="● Runs/over <= 4.0" value="2 point" />
    <DisplayPoint akey="● Runs/over >= 7.0" value="-2 point" />
    <Note/>
    <Typography paragraph>
    Minimum 2 over need to be bowled by player to check economy.
    </Typography>
    <DisplayBold message="Performance Points:"/>
    <DisplayPoint akey="● Man of the Match " value="20 point" />
    <DisplayPoint akey="● Tournament Max Runs" value="100 point" />
    <DisplayPoint akey="● Tournament Max Wickets" value="100 point" />
    <BlankArea/>
    <DisplayBold message="Captain and ViceCaptain:"/>
    <DisplayPoint akey="● Caption" value="2x point" />
    <DisplayPoint akey="● ViceCaption" value="1.5x point" />
    <Note/>
    <Typography paragraph>
    Only points of runs and wickets will considered for 2x for Captain and 1.5x for ViceCaptain.
    </Typography>
    </CardContent>
    </Card>
  )}

  function TEST_PointSystem() {
    return(
      <Card className={classes.testCard}>
      <CardContent>
      <PS_Header header="TEST Point system" />
      <DisplayBold message="Batting Points:" />
      <DisplayPoint akey="● Run" value="1 point"/>
      <DisplayPoint akey="● Boundary bonus" value="1 point" />
      <DisplayPoint akey="● Six bonus" value="2 point" />
      <DisplayPoint akey="● Half century bonus" value="10 point" />
      <DisplayPoint akey="● Century bonus" value="50 point" />
      <DisplayPoint akey="● Double century bonus" value="100 point" />
      <DisplayPoint akey="● Duck Penalty" value="-2 point" />
      <Note/>
      <Typography paragraph>
      If any player scores century in a match will only 
      get bonus point of century no extra 
      bonus point for half-century.
      Same rule applies for Double century.
      </Typography>
      <DisplayBold message="Bowling Points:"/>
      <DisplayPoint akey="● Wicket (except runout)" value="25 point" />
      <DisplayPoint akey="● 4 wicket bonus" value="20 point" />
      <DisplayPoint akey="● 5 wicket bonus" value="50 point" />
      <Note/>
      <Typography paragraph>
      If any player gets 5 wicket in a match only the bonus point of 5 wicket haul is awarded. No extra bonus points for 4 wicket haul. 
      </Typography>
      <DisplayBold message="Fielding Points:"/>
      <DisplayPoint akey="● Catch" value="4 point" />
      <DisplayPoint akey="● Run out" value="4 point" />
      <DisplayPoint akey="● Stumping" value="6 point" />
      <BlankArea/>
      <DisplayBold message="Performance Points:"/>
      <DisplayPoint akey="● Man of the Match " value="20 point" />
      <DisplayPoint akey="● Tournament Max Runs" value="100 point" />
      <DisplayPoint akey="● Tournament Max Wickets" value="100 point" />
      <BlankArea/>
      <DisplayBold message="Captain and ViceCaptain:"/>
      <DisplayPoint akey="● Caption" value="2x point" />
      <DisplayPoint akey="● ViceCaption" value="1.5x point" />
      <Note/>
      <Typography paragraph>
      Only points of runs and wickets will considered for 2x for Captain and 1.5x for ViceCaptain.
      </Typography>
      </CardContent>
      </Card>
      )}
  
  function PointSystem() {
  //console.log("In Point System");
  if (matchType === "TEST") {
    return (<div><DisplayMatchType /><TEST_PointSystem /></div>); 
  } else if (matchType === "ODI") {
    return (<div><DisplayMatchType /><ODI_PointSystem /></div>); 
  } else if (matchType === "T20") {
    return (<div><DisplayMatchType /><T20_PointSystem /></div>); 
  } else {
    return (<h5>Unknown match type</h5>); 
  }}
  
  function AboutAPL() {
  return (
    <Card className={classes.card}>
    <CardContent>
    <DisplayImage image="APLLOGO1.JPG" title="About Auction Premier League" />
    <Typography paragraph>
      Auction Premier League is one of its kind application which lets you create group, auction players to create your own franchise.
      </Typography>
    <Typography paragraph>
      You can create your own group with your friends and family and each of you can own a franchise and have a league of your own just like major leagues.
      </Typography>
    <Typography paragraph>
      During  tournaments every player of your team will fetch you points as he performs in the matches and  your standing on the scoreboard will change accordingly.
      </Typography>
    <Typography paragraph>
      So why wait? Create your own franchise and make watching cricket more enjoying and interesting!!!
      </Typography>
    </CardContent>
    </Card>
  )}

  function HowtoPlay() {
    return (
      <Card className={classes.card}>
      <CardContent>
      <Typography paragraph>
      You need a Group to play along with friends and/or family.  One among you will create the Group and provide the GroupCode to others so that they can join the group using GroupCode.
      </Typography>
      <DisplayBold message="Create New Group" />
      <DisplayImage image="CREATENEWGROUP.JPG"/>
      <Typography paragraph>
      Click on Menu button, Select Group and then click on “New Group”.
      </Typography>
      <DisplayImage image="NEWGROUPDETAILS.JPG"/>
      <Typography paragraph>
      Provide your Group Name.
      </Typography>
      <Typography paragraph>
      Select number of member allowed in the group. The minimum number of members can be between 2 and 15.
      </Typography>
      <Typography paragraph>
      Select Group joining fee for each member. The minimum fee is 50.  User creating/joining group should be the fee amount in the wallet.
      </Typography>
      <Typography paragraph>
      APL keeps on adding the new tournaments. You need to select the tournament for you group.
      </Typography>
      <Typography paragraph>
      Finally click on “Create” to create the group. User who creates the group automatically becomes Administrator (or Owner) of that group.
      </Typography>
      <DisplayImage image="AFTERGROUPCREATE1.JPG"/>
      <Typography paragraph>
      Once group is successfully created, user can select the number of prizes (between 1 and 5).
      </Typography>
      <Typography paragraph>
      APL provides unique Group Code which can be copied. This can be shared with your friends so that they can join the group.
      </Typography>
      <DisplayBold message="Join Group" />
      <DisplayImage image="JOINGROUP.JPG"/>
      <Typography paragraph>
      One can join the group using Group Code (shared by your friend). The only requirement to join the group is Group Code and wallet balance.
      </Typography>
      <Typography paragraph>
      Click on Menu button, Select Group and then click on “Join Group”.
      </Typography>
      <Typography paragraph>
      Enter Group Code and Click “Join Group”
      </Typography>
      <DisplayBold message="Multiple Groups" />
      <DisplayImage image="MULTIPLEGROUP.JPG"/>
      <Typography paragraph>
      You can be member of many groups. Pages like Dashboard,  Auction,  Myteam,  Stats shows information of only 1 group which you set it as current group  (By selecting  “Current”).
      </Typography>
      {/* <Typography paragraph>
      You can also configure the group to be selected as current group on Login. This is be done by setting the group as default group (By selecting “Def”).
      </Typography> */}
      <DisplayBold message="Group Details" />
      <DisplayImage image="GROUPDETAILS.JPG"/>
      <Typography paragraph>
      If you want details of any group just click on the group name. In the “Group Details” user can update their Franchisee name.
      </Typography>
      <Typography paragraph>
      Group Admin has the permission to update group details. This can be done clicking “Edit” Button.
      </Typography>
      <Typography paragraph>
      Group Admin can also change the number of prizes in the range of 1 to 5.
      </Typography>
      <Typography paragraph>
      Group code is avaiable for the user to copy and share it with friends / family to join the group.
      </Typography>
      <DisplayBold message="Auction" />
      <Typography paragraph>
      Once all the members have joined the group, the next step is to purchase tournament players by Auction. All the members are provided 1000 points to purchase players. Note Auction will not start till all member has join as admin decided.
      </Typography>
      <Typography paragraph>
      Click on “Auction”.
      </Typography>
      <Typography paragraph>
      In this Group Admin will be able to view button “Start Auction”. Other  members will get message “Auction yet to start”.
      </Typography>
      <Typography paragraph>
      Once auction is started, player’s details will be shown for auction. Members can bid using button for 5, 10, 15, 20, 25, 50, 70, 75, 100, and 200.
      </Typography>
      <Typography paragraph>
      Once bid amount is not increasing, Admin can sell the player to highest bidder using “Sold” button. The highest bidder will own this player and the bid amount will be deducted from the points.
      </Typography>
      <Typography paragraph>
      If no member is interested in buying the player, Admin can click on “Unsold” button to skip auction for this player.
      </Typography>
      <Typography paragraph>
      Once auction is complete, Admin will click on “Stop Auction” button. After this, all group members will get message indicating end of Auction.
      </Typography>
      <Typography paragraph>
      All the members will can view the players purchased during auction by clicking on “My Team” tab.
      </Typography>
      <DisplayBold message="Select Captain and Vice Captain" />
      <Typography paragraph>
      Click on “Captain” tab.
      </Typography>
      <Typography paragraph>
      Once all the members have created the team by purchasing players during Auction, User can select any player as Captain and Vice Captain.
      </Typography>
      </CardContent>
      </Card>
    )}
  
  return (
    <div className={classes.root}>
      {/* <ShowGif /> */}
      <DisplayPageHeader headerName="Help Desk" groupName="" tournament=""/>
      <BlankArea/>
      {/* <DisplayVersion text="Current APL Version" version={currentVersion}/>
      <DisplayVersion text="Latest APL  Version" version={latestVersion}/>
      <BlankArea/> */}
      <Accordion expanded={expandedPanel === "about"} onChange={handleAccordionChange("about")}>
        <DisplayHeader header="Auction Permier League"/>
        <AccordionDetails>
        <AboutAPL />
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expandedPanel === "HowtoPlay"} onChange={handleAccordionChange("HowtoPlay")}>
        <DisplayHeader header="How to Play" />
        <AccordionDetails>
        <HowtoPlay />
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expandedPanel === "pointsystem"} onChange={handleAccordionChange("pointsystem")}>
        <DisplayHeader header="Point System"/>
        <AccordionDetails>
        {/* <DisplayMatchType /> */}
        <PointSystem />
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

