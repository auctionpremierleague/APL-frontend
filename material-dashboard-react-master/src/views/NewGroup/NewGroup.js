import React, { useState, useEffect } from 'react';
// import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';

import DialogTitle from '@material-ui/core/DialogTitle';
// import Link from '@material-ui/core/Link';
// import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { useHistory } from "react-router-dom";

import axios from "axios";
import MenuItem from '@material-ui/core/MenuItem';
import Select from "@material-ui/core/Select";
// import { UserContext } from "../../UserContext";
// import { StepLabel } from '@material-ui/core';



const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  cancel: {
    margin: theme.spacing(20, 0, 2),
  },
  customLabelStyle: {
    fontSize: "24px"
  },
}));

const handleSubmit = e => {
  e.preventDefault();
};
// const handleCancel = e => {
//   history.push("/admin/mygroup")
// };


export default function NewGroup() {
  const classes = useStyles();
  const history = useHistory();
  const [groupName, setGroupName] = useState("");
  const [bidAmount, setBidAmount] = useState("200");
  const [open, setOpen] = useState(false)
  const [tournamentData, setTournamentData] = useState([{tournament: "IPL2020"}, 
    {tournament: "ENGAUST20"},
    {tournament: "ENGPAKT20"}]);
  const [errorMessage, setErrorMessage] = useState("");
  // const { setUser } = useContext(UserContext);

  useEffect(() => {
    if (window.localStorage.getItem("xxxuid")) {
      // setUser({ uid: window.localStorage.getItem("uid"), admin: window.localStorage.getItem("admin") })
      history.push("/admin")
    } 
  })

  const handleClick = async () => {
    let response = ""
    try { 
      response = await axios.get(`/user/login/pppp/xxxx`); 
    }
    catch (err) {
      setOpen(true)
    }

    var myVal = parseInt(bidAmount)
    if (isNaN(myVal)) myVal = 0;
    console.log(`Value is ${myVal}`)
    var errMsg = "";
    if (groupName.length === 0)       errMsg = "Group Name cannot be blank";
    else if (myVal < 200)  errMsg = "Maximum BidAmount should be greater than 200";
    else if (selectedTournament.length === 0) errMsg = "Tournamenet has to be selected";
    else {
      // all data looks okay. JUst check if duplicate group name
      errMsg = "All is fine";
    }
    setErrorMessage(errMsg);
    setOpen(true);
}

  const [selectedTournament, SetSelectedTournament] = useState("");
  const handleSelectedTournament = (event) => {
    SetSelectedTournament(event.target.value);
  };

  return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          {/* <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar> */}
          <Typography component="h1" variant="h5">Create New Group</Typography>
          <h3> </h3>
          <form className={classes.form} onSubmit={handleSubmit} noValidate>
            <TextField
              // autoComplete="fname"
              variant="outlined"
              required
              fullWidth
              name="groupName"
              // id="groupName"
              label="Group Name"
              autoFocus
              onChange={(event) => setGroupName(event.target.value)}
            />
            <h3></h3>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="maxBidAmount"
              label="Maximum Bid Amount"
              type="number"
              id="maxBidAmount"
              autoFocus
              // autoComplete="current-maxBidAmount"
              value={bidAmount}
              onChange={(event) => setBidAmount(event.target.value)}
            />
            <h3></h3>
            <label classes={{label: classes.customLabelStyle}}>Tournament</label>
            <Select labelId='tournament' id='tournament'
              variant="outlined"
              label="Tournament Name"
              name="tournamentName"
              id="tournamentName"
              fullWidth
              required
              value={selectedTournament}
                displayEmpty onChange={handleSelectedTournament}>
                {tournamentData.map(x =>
                  <MenuItem key={x.tournament} value={x.tournament}>{x.tournament}</MenuItem>)}
            </Select>
            <h3></h3>
            <Button variant="contained" color="secondary" size="small"
                    className={classes.button} onClick={handleClick}>Submit
            </Button>
            <label>                     </label>
            <Button variant="contained" color="secondary" size="small"
                    className={classes.button} onClick={() => { history.push("/admin/mygroup") }}>Cancel
            </Button>
            {/* <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={handleClick}
            >
              Submit
          </Button>
          <Button
              type="cancel"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.cancel}
              onClick={handleCancel}
            >
              Cancel
          </Button> */}
          </form>
        </div>

        <Dialog aria-labelledby="simple-dialog-title" open={open}
          onClose={() => setOpen(false)} >
          <DialogTitle id="simple-dialog-title" >{errorMessage}</DialogTitle>


        </Dialog>

      </Container>
  );
}
