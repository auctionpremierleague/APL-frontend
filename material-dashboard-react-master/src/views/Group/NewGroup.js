import React, { useState ,useContext, useEffect} from 'react';
import axios from "axios";
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
// import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import { Switch, Route } from 'react-router-dom';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Select from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
import { UserContext } from "../../UserContext";
// import axios from "axios";
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import { useHistory } from "react-router-dom";
import {validateSpecialCharacters, validateEmail} from "views/functions.js";
import {BlankArea} from "CustomComponents/CustomComponents.js"
import red from '@material-ui/core/colors/red';
import blue from '@material-ui/core/colors/blue';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        CricDream
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

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
  button: {
    margin: theme.spacing(0, 1, 0),
  },
 error:  {
      // right: 0,
      fontSize: '12px',
      color: blue[700],
      // position: 'absolute',
      alignItems: 'center',
      marginTop: '0px',
  },
}));

class ChildComp extends React.Component {

  componentDidMount()  {
    // custom rule will have name 'isPasswordMatch'
    // ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
    //   return (this.props.p1 === this.props.p2)
    // });

    ValidatorForm.addValidationRule('minLength', (value) => {
      return (value.length >= 6)
    });

    ValidatorForm.addValidationRule('noSpecialCharacters', (value) => {
      return validateSpecialCharacters(value);
    });    
  }

  
  componentWillUnmount() {
    // remove rule when it is not needed
    // ValidatorForm.removeValidationRule('isPasswordMatch');
    // ValidatorForm.removeValidationRule('isEmailOK');
    // ValidatorForm.removeValidationRule('minLength1');
    ValidatorForm.removeValidationRule('minLength');
    ValidatorForm.removeValidationRule('noSpecialCharacters');
  }

  render() {
    return <br/>;
  }

}



export default function CreateGroup() {
  const classes = useStyles();
  const history = useHistory();
  const [groupName, setGroupName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bidAmount, setBidAmount] = useState(1000);
//   const [email, setEmail] = useState("");
//   const [repeatPassword, setRepeatPassword] = useState("");
  const [registerStatus, setRegisterStatus] = useState(0);
  const [tournamentData, setTournamentData] = useState([]);
  const [selectedTournament, SetSelectedTournament] = useState("");
  const { setUser } = useContext(UserContext);
  const [ errorMessage, setErrorMessage ] = useState("");

  const handleSelectedTournament = (event) => {
    SetSelectedTournament(event.target.value);
  };
  
  useEffect(() => {
    const a = async () => {
        var response = await axios.get(`/tournament/list/running`); 
        // console.log("Getting tournament list");
        // console.log(response.data);
        setTournamentData(response.data);
        SetSelectedTournament(response.data[0].name);
    };    
    a();
  }, []);

  // const handleChange = (event) => {
  //   const { user } = this.state;
  //   user[event.target.name] = event.target.value;
  //   this.setState({ user });
  // }

  const handleSubmit = async() => {
    console.log("Submit command provided");
    //  /group/create/TeSt/8/1250/AUSINDT20
    // groupName  bidAmount selectedTournament
    const response = await axios.get(`/group/create/${groupName}/${localStorage.getItem("uid")}/${bidAmount}/${selectedTournament}`);
    setErrorMessage(`Successfully create group ${groupName}`);
  }

  function handleCancel() {
    history.push("/admin/mygroup")
  }

  function ShowResisterStatus() {
    // console.log(`Status is ${registerStatus}`);
    let myMsg;
    switch (registerStatus) {
      case 200:
        // setGroupName("");
        // setPassword("");
        // setRepeatPassword("");
        // setEmail("");
        myMsg = `User ${groupName} successfully regisitered.`;
        break;
      case 602:
        myMsg = "User Name already in use";
        break;
      case 603:
        myMsg = "Email id already in use";
        break;
      default:
          myMsg = "";
          break;
    }
    return(
      <div>
        <Typography className={(registerStatus === 200) ? classes.root : classes.error}>{myMsg}</Typography>
        {/* <Typography className={classes.root}>
            <Link href="#" onClick={handleLogin} variant="body2">
            Already have an account? Sign in
          </Link>
        </Typography> */}
      </div>
    )
  }

  
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        {/* <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar> */}
        <Typography component="h1" variant="h5">
          Create New Group
        </Typography>
    <ValidatorForm className={classes.form} onSubmit={handleSubmit}>
      <TextValidator
          variant="outlined"
          required
          fullWidth      
          label="Group Name"
          onChange={(event) => setGroupName(event.target.value)}
          name="groupname"
          // type=""
          validators={['required', 'minLength', 'noSpecialCharacters']}
          errorMessages={['Group Name to be provided', 'Group Name should be of minimum 6 characters', 'Special characters not permitted']}
          value={groupName}
      />
      {/* <BlankArea/>
      <TextValidator
          variant="outlined"
          required
          fullWidth      
          label="Group Display Name"
          onChange={(event) => setDisplayName(event.target.value)}
          name="displayname"
        //   type="email"
          validators={[['required', 'minLength', 'noSpecialCharacters' ]]}
          errorMessages={['Group display name to be provided', 'Group Name should be of minimum 6 characters', , 'Special characters not permitted']}
          value={displayName}
      /> */}
      <BlankArea/>
      <TextValidator
          variant="outlined"
          required
          fullWidth      
          label="Maximum Bid Amount"
          onChange={(event) => setBidAmount(event.target.value)}
          name="bidamount"
          type="number"
          validators={['required', 'minNumber:1000', 'maxNumber:5000']}
          errorMessages={['Bid Amount to be provided', 'Bid Amount cannot be less than 1000', 'Bid Amount cannot be greater than 5000']}
          value={bidAmount}
      />
      <BlankArea/>
      <Select labelId='tournament' id='tournament'
        variant="outlined"
        required
        fullWidth
        label="Tournament Name"
        name="tournamentName"
        id="tournamentList"
        value={selectedTournament}
        displayEmpty onChange={handleSelectedTournament}>
        {tournamentData.map(x =>
        <MenuItem key={x.name} value={x.name}>{x.name}</MenuItem>)}
    </Select>
      <BlankArea/>
      <div>
        <Typography className={classes.error} align="left">{errorMessage}</Typography>
      </div>
      <BlankArea/>
      <div align="center">
        <Button type="submit" key={"create"} variant="contained" color="primary" size="small"
            className={classes.button}>Create
        </Button>
        <Button key={"members"} variant="contained" color="primary" size="small"
            className={classes.button} onClick={handleCancel}>Cancel
        </Button>
       </div>
    </ValidatorForm>
    <ShowResisterStatus/>
    </div>
    <ChildComp p3={selectedTournament}/>    
    {/* <Switch>
      <Route  path='/admin/signin' component={SignIn} key="MemberList"/>
    </Switch> */}
    </Container>
  );
}
