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
import JoinGroup from "views/Group/JoinGroup.js"
import GroupDetails from "views/Group/GroupDetails.js"
import GroupMember from "views/Group/GroupMember.js"
import { useHistory } from "react-router-dom";
import {cdRefresh} from "views/functions.js"
import AddGroupMember from "views/Group/AddGroupMember.js"

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
  }
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
  if ((localStorage.getItem("tabpos") === null)  ||
      (localStorage.getItem("tabpos") === "") ||
      (localStorage.getItem("tabpos") === "0"))
      pos = 0;
  else
    pos = parseInt(localStorage.getItem("tabpos"));
    // console.log(`Tab position ${pos}`);
  return pos;
}

export default function CricDreamTabs() {
  const classes = useStyles();
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
          <Tab label="Group" {...a11yProps(0)} />
          <Tab label="DashBoard" {...a11yProps(1)} />
          <Tab label="Auction" {...a11yProps(2)} />
          <Tab label="Captain" {...a11yProps(3)} />
          <Tab label="Team" {...a11yProps(4)} />
          <Tab label="Match" {...a11yProps(5)} />
          <Tab label="Stats" {...a11yProps(6)} />
          <Tab label="Logout" {...a11yProps(7)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}><Group /></TabPanel>
      <TabPanel value={value} index={1}><Dash/></TabPanel>
      <TabPanel value={value} index={2}><Auction/></TabPanel>
      <TabPanel value={value} index={3}><Captain/></TabPanel>
      <TabPanel value={value} index={4}><MyTeam/></TabPanel>
      <TabPanel value={value} index={5}><Match/></TabPanel>
      <TabPanel value={value} index={6}><Stats/></TabPanel>
      <TabPanel value={value} index={7}><Logout/></TabPanel>
      <TabPanel value={value} index={101}><NewGroup /></TabPanel>
      <TabPanel value={value} index={102}><GroupDetails /></TabPanel>
      <TabPanel value={value} index={103}><GroupMember /></TabPanel>
      <TabPanel value={value} index={104}><AddGroupMember /></TabPanel>
      <TabPanel value={value} index={105}><JoinGroup /></TabPanel>
    </div>
  );
}
