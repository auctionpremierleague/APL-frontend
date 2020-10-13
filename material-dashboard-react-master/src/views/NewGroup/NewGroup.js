import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';

import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { useHistory } from "react-router-dom";

import axios from "axios";
import MenuItem from '@material-ui/core/MenuItem';
import Select from "@material-ui/core/Select";
// import Label from "@material-ui/core/Select";


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
  errMessage: {
    fontSize: "12px",
    color: "red",
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
  const [errorMessage, setErrorMessage] = useState("");
  const [tournamentData, setTournamentData] = useState([]);
  // const { setUser } = useContext(UserContext);

  useEffect(() => {

    const a = async () => {
      if (tournamentData.length === 0) {
        var response = await axios.get(`/tournament/list/running`); 
        // console.log("Getting tournament list");
        // console.log(response.data);
        setTournamentData(response.data);
      }
    };    
    a();
    
  })

  const handleClick = async () => {
    // let response = ""
    // try { 
    //   response = await axios.get(`/user/login/pppp/xxxx`); 
    // }
    // catch (err) {
    //   setOpen(true)
    // }

    // Basic Validation
    var errCount = 0;
    if (groupName.length === 0)  {
      setErrorGroupName("Group Name cannot be blank");     //errMsg = "Group Name cannot be blank";
      ++errCount;
    } else
      setErrorGroupName("");

    if ((bidAmount === "") || (parseInt(bidAmount) < 200)) {
      setErrorBidAmount("Maximum BidAmount should be greater than 200")
      ++errCount;
    } else
      setErrorBidAmount("");

    if (selectedTournament.length === 0) {
      setErrorTournament("Tournamenet has to be selected");
      ++errCount;
    } else
      setErrorTournament("");
    
    if (errCount === 0) {
      // all data looks okay. JUst check if duplicate group name
      setErrorMessage("All is fine");
      setOpen(true);
    }
}

const [selectedTournament, SetSelectedTournament] = useState("");
const handleSelectedTournament = (event) => {
  SetSelectedTournament(event.target.value);
};

  // error messages
  const [errGroupName, setErrorGroupName] = useState("")
  const [errBidAtmount, setErrorBidAmount] = useState("")
  const [errTournament, setErrorTournament] = useState("")

  function DisplayError(props) {
    return (<div className={classes.errMessage}>{props.message}</div>);
  }

  return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
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
            <DisplayError message={errGroupName}/>
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
            <DisplayError message={errBidAtmount}/>
            <h3></h3>
            <label classes={{label: classes.customLabelStyle}}>Tournament</label>
            <Select labelId='tournament' id='tournament'
              variant="outlined"
              label="Tournament Name"
              name="tournamentName"
              id="tournamentList"
              fullWidth
              required
              value={selectedTournament}
                displayEmpty onChange={handleSelectedTournament}>
                {tournamentData.map(x =>
                  <MenuItem key={x.name} value={x.name}>{x.name}</MenuItem>)}
            </Select>
            <DisplayError message={errTournament}/>
            <h3></h3>
            <Button variant="contained" color="secondary" size="small"
                    className={classes.button} onClick={handleClick}>Submit
            </Button>
            <label>     </label>
            <Button variant="contained" color="secondary" size="small"
                    className={classes.button} onClick={() => { history.push("/admin/mygroup") }}>Cancel
            </Button>
          </form>
        </div>
        <Dialog aria-labelledby="simple-dialog-title" open={open}
          onClose={() => setOpen(false)} >
          <DialogTitle id="simple-dialog-title" >{errorMessage}</DialogTitle>
        </Dialog>
      </Container>
  );
}
