import React from "react";
import PropTypes from "prop-types";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { spacing } from '@material-ui/system';
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
import Wallet from "views/Wallet/Wallet.js"
import JoinGroup from "views/Group/JoinGroup.js"
import GroupDetails from "views/Group/GroupDetails.js"
import GroupMember from "views/Group/GroupMember.js"
import ChangePassword from "views/Login/ChangePassword.js"
import { useHistory } from "react-router-dom";
import {cdRefresh, specialSetPos} from "views/functions.js"
import AddGroupMember from "views/Group/AddGroupMember.js"
import Avatar from "@material-ui/core/Avatar"
import Button from "@material-ui/core/Button";
import IconButton from '@material-ui/core/IconButton';
import Grid from "@material-ui/core/Grid";
import GridItem from "components/Grid/GridItem.js";
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PersonIcon from '@material-ui/icons/Person';
import DashboardIcon from "@material-ui/icons/Dashboard";
import GroupIcon from '@material-ui/icons/Group';
// icons
import ExitToAppIcon from '@material-ui/icons/ExitToApp';



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
  label: {
    fontSize: '0.75em',
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
    color: theme.palette.common.white,
  },
}));

var myTabPosition = 0;


export function setTab(num) {
  //myTabPosition = num;
  localStorage.setItem("tabpos", num);
  cdRefresh();
}

const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5"
  }
})(props => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom"
    }}
    transformOrigin={{
      vertical: "top"
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);




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



  const [value, setValue] = React.useState(getTabPos());
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const ExitCric = () => {
    setAnchorEl(null);
    localStorage.setItem("uid", "");
    // localStorage.setItem("newTabPos", "0)
    cdRefresh();  
  };

  const ShowProfile = () => {
    setAnchorEl(null);
   setTab(106);
    // localStorage.setItem("newTabPos", "0)
    // cdRefresh();  
  };

  const ShowChangePassword = () => {
    setAnchorEl(null);
    setTab(108);
    // localStorage.setItem("newTabPos", "0)
    // cdRefresh();  
  };

  const ShowGroup = () => {
    setAnchorEl(null);
    setTab(107);
  };

  const ShowWallet = () => {
    setAnchorEl(null);
    setTab(109);
  };

  function Logout() {
    const history = useHistory();
    localStorage.setItem("uid", "");
    cdRefresh();  
  }

  function UserButton() {
    return (
    <IconButton 
      color="secondary"
      aria-haspopup="true"
      aria-controls="customized-menu" 
      aria-label="add to shopping cart" 
      variant="contained"
      onClick={handleClick}
    >
      <PersonIcon />
    </IconButton>
    );
  }

  function UserMenuItem(props) {
    return (
      <StyledMenuItem onClick={props.clickfunction}>
      <ListItemText className={classes.label}  primary={props.name} />
    </StyledMenuItem>

    );
  }
  function UserMenu() {
    // setAnchorEl(true);
    return (
      <div>
      <StyledMenu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <UserMenuItem clickfunction={ShowProfile} name="Profile"/>
        <UserMenuItem clickfunction={ShowGroup} name="Group"/>
        <UserMenuItem clickfunction={ShowWallet} name="Wallet"/>
        <UserMenuItem clickfunction={ShowChangePassword} name="Password"/>
        <UserMenuItem clickfunction={ExitCric} name="Logout"/>
      </StyledMenu>
        </div>
    );
  }

  const handleChange = (event, newValue) => {
    if (newValue !== value) {
      localStorage.setItem("tabpos", newValue);
      setValue(newValue);
    }
  };

  console.log(`value is ${value}`);
  return (
    <div className={classes.root}>
      <AppBar position="static" >
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="simple tabs example"
        >
          <Tab  m={0} className={classes.tabIcon} icon={<UserButton />}  {...a11yProps(0)} />
          <Tab  m={0} className={classes.label} label="Dashboard" {...a11yProps(1)} />
          <Tab  m={0} className={classes.label} label="Stats" {...a11yProps(2)} />
          <Tab  m={0} className={classes.label} label="Match" {...a11yProps(3)} /> 
          <Tab  m={0} className={classes.label} label="Captain"  {...a11yProps(4)} />
          <Tab  m={0} className={classes.label} label="Team" {...a11yProps(5)} />  
          <Tab  m={0} className={classes.label} label="Auction" {...a11yProps(6)} />  
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}><UserMenu /></TabPanel>
      <TabPanel value={value} index={1}><Dash/></TabPanel>
      <TabPanel value={value} index={2}><Stats/></TabPanel>
      <TabPanel value={value} index={3}><Match/></TabPanel>
      <TabPanel value={value} index={4}><Captain/></TabPanel>
      <TabPanel value={value} index={5}><MyTeam/></TabPanel>
      <TabPanel value={value} index={6}><Auction/></TabPanel>
      <TabPanel value={value} index={101}><NewGroup /></TabPanel>
      <TabPanel value={value} index={102}><GroupDetails /></TabPanel>
      <TabPanel value={value} index={103}><GroupMember /></TabPanel>
      <TabPanel value={value} index={104}><AddGroupMember /></TabPanel>
      <TabPanel value={value} index={105}><JoinGroup /></TabPanel>
      <TabPanel value={value} index={106}><Profile /></TabPanel>
      <TabPanel value={value} index={107}><Group /></TabPanel>
      <TabPanel value={value} index={108}><ChangePassword /></TabPanel>
      <TabPanel value={value} index={109}><Wallet /></TabPanel>
    </div>
  );
}
