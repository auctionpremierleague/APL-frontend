import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import GroupIcon from '@material-ui/icons/Group';
import Button from '@material-ui/core/Button';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu'; 
import Divider from '@material-ui/core/Divider';
import {cdRefresh, specialSetPos} from "views/functions.js"
/// cd items import
import Dash from "views/Dashboard/Dashboard"
import Stats from "views/Statistics/Statistics"
import MyTeam from "views/MyTeam/MyTeam"
import Auction from "views/Auction/Auction"
import Captain from "views/Captain/Captain"
import Match from "views/UpcomingMatch/UpcomingMatch"
import Group from "views/Group/Group"
import Wallet from "views/Wallet/Wallet.js"
import Profile from "views/Profile/Profile.js"
import ChangePassword from "views/Login/ChangePassword.js"
import About from "views/APL/About.js"
import ContactUs from "views/APL/ContactUs.js"
import SU_Tournament from "views/SuperUser/Tournament.js" 
import SU_Player from "views/SuperUser/Player.js" 
import NewGroup from "views/Group/NewGroup.js"
import JoinGroup from "views/Group/JoinGroup.js"
import GroupDetails from "views/Group/GroupDetails.js"

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export function setTab(num) {
  //myTabPosition = num;
  console.log(`Menu pos ${num}`);
  localStorage.setItem("menuValue", num);
  cdRefresh();
}

export function CricDreamTabs() {
  const classes = useStyles();
  // for menu 
  const [auth, setAuth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  // for group menu
  const [grpAuth, setGrpAuth] = React.useState(true);
  const [grpAnchorEl, setGrpAnchorEl] = React.useState(null);
  const grpOpen = Boolean(grpAnchorEl);
  const [value, setValue] = React.useState(parseInt(localStorage.getItem("menuValue")));

  console.log(localStorage.getItem("menuValue"));

  const handleChange = (event) => {
    setAuth(event.target.checked);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleGrpMenu = (event) => {
    setGrpAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGrpClose = () => {
    setGrpAnchorEl(null);
  };

  function setMenuValue(num) {
    setValue(num);
    handleClose();
    localStorage.setItem("menuValue", num);
  }

  const handleDash = () => { setMenuValue(1);  }
  const handleStat = () => { setMenuValue(2);  }
  const handleTeam = () => { setMenuValue(3);  }
  const handleMatch = () => { handleClose(); setMenuValue(101);}
  const handleAuction = () => { handleClose(); setMenuValue(102);}
  const handleCaptain = () => { handleClose(); setMenuValue(103);}
  const handleGroup = () => { handleGrpClose(); setMenuValue(104);}
  const handleWallet = () => { handleClose(); setMenuValue(105);}
  const handleProfile = () => { handleClose(); setMenuValue(106);}
  const handlePassword = () => { handleClose(); setMenuValue(107);}
  const handleHelpDesk = () => { handleClose(); setMenuValue(201);}
  const handleContactUs = () => { handleClose(); setMenuValue(202);}
  const handleSuTournament = () => { handleClose(); setMenuValue(301);}
  const handleSuPlayer = () => { handleClose(); setMenuValue(302);}

  const handleGroupNew = () => { handleGrpClose(); setMenuValue(1001);}
  const handleGroupJoin = () => { handleGrpClose(); setMenuValue(1002);}
  const handleGroupDetails = () => { handleGrpClose(); setMenuValue(1003);}

  const handleLogout = () => {
    handleClose();
    localStorage.setItem("uid", "");
    localStorage.setItem("menuValue", process.env.REACT_APP_DASHBOARD);
    cdRefresh();  
  };

  function Show_Supervisor_Options() {
    if (localStorage.getItem("userPlan") == process.env.REACT_APP_SUPERUSER) {  
      return (
        <div>
        <MenuItem onClick={handleSuTournament}>SU Tournament</MenuItem>
        <MenuItem onClick={handleSuPlayer}>SU Player</MenuItem>
        </div>)
    } else {
      return (<div></div>)
    }
  }

  function DisplayCdItems() {
    switch(value) {
      case 1: return <Dash/>; 
      case 2: return <Stats/>;
      case 3: return <MyTeam />;
      case 101: return <Match />;
      case 102: return <Auction />;
      case 103: return <Captain />;
      case 104: return <Group />;
      case 105: return <Wallet />;
      case 106: return <Profile />;
      case 107: return <ChangePassword />;
      case 201: return <About />;
      case 202: return <ContactUs />;
      case 301: return <SU_Tournament />;
      case 302: return <SU_Player />;
      case 1001: return <NewGroup />;
      case 1002: return <JoinGroup />;
      case 1003: return <GroupDetails />;
      default: return  <div></div>;
    }
  }

  return (
    <div className={classes.root}>
      {/* <FormGroup>
        <FormControlLabel
          control={<Switch checked={auth} onChange={handleChange} aria-label="login switch" />}
          label={auth ? 'Logout' : 'Login'}
        />
      </FormGroup> */}
      <AppBar position="static">
        <Toolbar>
          {auth && (
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <MenuIcon style={{ color: "white" }}/>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={handleMatch}>Match</MenuItem>
                <MenuItem onClick={handleCaptain}>Captain</MenuItem>
                <MenuItem onClick={handleAuction}>Auction</MenuItem>
                <Divider />
                {/* <MenuItem onClick={handleGroup}>Group</MenuItem>
                <Divider/> */}
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                <MenuItem onClick={handlePassword}>Password</MenuItem>
                <MenuItem onClick={handleWallet}>Wallet</MenuItem>
                <Show_Supervisor_Options/>
                <Divider/>
                <MenuItem onClick={handleHelpDesk}>How to play</MenuItem>
                <MenuItem onClick={handleContactUs}>Contact Us</MenuItem>       
                <Divider/>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          )}
          {/* <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton> */}
          <Button color="inherit" onClick={handleDash}>DashBoard</Button>
          <Button color="inherit" onClick={handleStat}>Statistics</Button>
          <Button color="inherit" onClick={handleTeam}>Team</Button>
          {/* <Typography variant="h6" className={classes.title}>
            Photos
          </Typography> */}
          {grpAuth && (
            <div>
              <IconButton
                aria-label="account of current group"
                aria-controls="group-appbar"
                aria-haspopup="true"
                onClick={handleGrpMenu}
                color="inherit"
              >
                <GroupIcon style={{ color: "white" }}/>
              </IconButton>
              <Menu
                id="group-appbar"
                anchorEl={grpAnchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={grpOpen}
                onClose={handleGrpClose}
              >
                <MenuItem onClick={handleGroup}>Group</MenuItem>
                <MenuItem onClick={handleGroupDetails}>Group Details</MenuItem>
                <MenuItem onClick={handleGroupJoin}>Join Group</MenuItem>
                <MenuItem onClick={handleGroupNew}>New Group</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <DisplayCdItems/>
    </div>
  );
}