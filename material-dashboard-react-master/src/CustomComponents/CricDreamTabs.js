import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Group from "views/Group/Group"
import Dash from "views/Dashboard/Dashboard"
import Auction from "views/Auction/Auction"
import Captain from "views/Captain/Captain"
import MyTeam from "views/MyTeam/MyTeam"
import Match from "views/UpcomingMatch/UpcomingMatch"
import Stats from "views/Statistics/Statistics"
import NewGroup from "views/Group/NewGroup.js"
import Profile from "views/Profile/Profile.js"
import JoinGroup from "views/Group/JoinGroup.js"
import GroupDetails from "views/Group/GroupDetails.js"
import GroupMember from "views/Group/GroupMember.js"
import { useHistory } from "react-router-dom";
import {cdRefresh, specialSetPos} from "views/functions.js"
import AddGroupMember from "views/Group/AddGroupMember.js"
import Avatar from "@material-ui/core/Avatar"
import Grid from "@material-ui/core/Grid";
import GridItem from "components/Grid/GridItem.js";

// icons
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import DashboardIcon from "@material-ui/icons/Dashboard";
import GroupIcon from '@material-ui/icons/Group';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    // backgroundColor: theme.palette.background.paper
    backgroundColor: '#eeeeee',
  },
  image: {
    height: "200px"
  },
  large: {
      width: theme.spacing(12),
      height: theme.spacing(12),
  },
  medium: {
      width: theme.spacing(9),
      height: theme.spacing(9),
  },
  tabIcon: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  tab: {
    minWidth: 35, // a number of your choice
    width: 35, // a number of your choice
  },
}));

var myTabPosition = 0;


export function setTab(num) {
  //myTabPosition = num;
  localStorage.setItem("tabpos", num);
  cdRefresh();
}

function Logout() {
  const history = useHistory();
  localStorage.setItem("uid", "");
  // localStorage.setItem("newTabPos", "0)
  cdRefresh();  
  return (<div></div>);
}


function getTabPos() {
  let pos = 0;
  //console.log(`My tab position is ${localStorage.getItem("tabpos")}`)
  if ((localStorage.getItem("tabpos") === null)  ||
        (localStorage.getItem("tabpos") === "") ||
        (localStorage.getItem("tabpos") === "0")) {
        //console.log("Setting TABPOS to 0")
        pos = 0;  
  } else {
    //console.log(`Settab as per setting which is ${localStorage.getItem("tabpos")}`)
    pos = parseInt(localStorage.getItem("tabpos"));
  }
  //console.log(`Tab position ${pos}`);
  return pos;
}


function CricIcon(props) {
  // const useStyles = makeStyles((theme) => ({
  //   infoButton: {
  //       backgroundColor: '#FCDC00',
  //       ":disabled": {
  //           backgroundColor: '#cddc39',
  //       }
  //   },
  //   margin: {
  //       margin: theme.spacing(1),
  //   },
  //   image: {
  //       height: "200px"
  //   },
  //   large: {
  //       width: theme.spacing(12),
  //       height: theme.spacing(12),
  //   },
  //   medium: {
  //       width: theme.spacing(9),
  //       height: theme.spacing(9),
  //   },
  // }));
  const classes = useStyles();  
  return (
    <Avatar variant="square" src={`${process.env.PUBLIC_URL}/image/${props.image}`} className={classes.tabIcon} />
  );
}

export function CricDreamTabs() {
  const classes = useStyles();
  //console.log("in Cric Dream Tabs");
  const [value, setValue] = React.useState(getTabPos());
  // localStorage.setItem("tabpos", "0");
  const handleChange = (event, newValue) => {
    if (newValue !== value) {
      localStorage.setItem("tabpos", newValue);
      setValue(newValue);
    }
  };

  // value={value}
  // onChange={handleChange}
  // indicatorColor="primary"
  // textColor="primary"
  // variant="scrollable"
  // scrollButtons="auto"
  // aria-label="scrollable auto tabs example"
  console.log(`value is ${value}`);
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="simple tabs example"
        >
          <Tab  classes={{ root: classes.tab }} icon={<GroupIcon />}  {...a11yProps(0)} />
          <Tab  classes={{ root: classes.tab }} icon={<DashboardIcon />} {...a11yProps(1)} />
          <Tab  classes={{ root: classes.tab }}  icon={<CricIcon image="auction.jpg" />} {...a11yProps(2)} />  
          <Tab  classes={{ root: classes.tab }}  icon={<CricIcon image="captain.png" />} {...a11yProps(3)} />
          <Tab  classes={{ root: classes.tab }} icon={<CricIcon image="team.jpg" />} {...a11yProps(4)} />  
          <Tab  classes={{ root: classes.tab }} icon={<CricIcon image="match.jpg" />} {...a11yProps(5)} /> 
          <Tab  classes={{ root: classes.tab }} icon={<CricIcon image="statistics.jpg" />} {...a11yProps(6)} />
          <Tab  classes={{ root: classes.tab }} icon={<CricIcon image="profile.png" />} {...a11yProps(7)} />
          <Tab  classes={{ root: classes.tab }} icon={<ExitToAppIcon />}  {...a11yProps(8)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}><Group /></TabPanel>
      <TabPanel value={value} index={1}><Dash/></TabPanel>
      <TabPanel value={value} index={2}><Auction/></TabPanel>
      <TabPanel value={value} index={3}><Captain/></TabPanel>
      <TabPanel value={value} index={4}><MyTeam/></TabPanel>
      <TabPanel value={value} index={5}><Match/></TabPanel>
      <TabPanel value={value} index={6}><Stats/></TabPanel>
      <TabPanel value={value} index={7}><Profile /></TabPanel>
      <TabPanel value={value} index={8}><Logout /></TabPanel>
      <TabPanel value={value} index={101}><NewGroup /></TabPanel>
      <TabPanel value={value} index={102}><GroupDetails /></TabPanel>
      <TabPanel value={value} index={103}><GroupMember /></TabPanel>
      <TabPanel value={value} index={104}><AddGroupMember /></TabPanel>
      <TabPanel value={value} index={105}><JoinGroup /></TabPanel>
    </div>
  );
}
