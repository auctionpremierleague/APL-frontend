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
// import Table from '@material-ui/core/Table';
// import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
// import TableContainer from '@material-ui/core/TableContainer';
// import TableHead from '@material-ui/core/TableHead';
// import TableRow from '@material-ui/core/TableRow';
// import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Container from '@material-ui/core/Container';
import Select from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
// import TextField from '@material-ui/core/TextField';
// import { UserContext } from "../../UserContext";
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import { useHistory } from "react-router-dom";
import {validateSpecialCharacters, validateEmail, getUserBalance} from "views/functions.js";
import {BlankArea, NothingToDisplay, DisplayPrizeTable, DisplayBalance} from "CustomComponents/CustomComponents.js"
import {red, blue, yellow} from '@material-ui/core/colors';
// import blue from '@material-ui/core/colors/blue';
import {setTab} from "CustomComponents/CricDreamTabs.js"
// import copy from 'copy-clipboard';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { DisplayPageHeader } from 'CustomComponents/CustomComponents';

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
  groupCode: {
    fontSize: theme.typography.pxToRem(20),
    fontWeight: theme.typography.fontWeightBold,
    color: yellow[900]
  },
  groupMessage: {
    fontSize: theme.typography.pxToRem(10),
    fontWeight: theme.typography.fontWeightBold,
    // color: yellow[900]
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
      color: red[700],
      // position: 'absolute',
      alignItems: 'center',
      marginTop: '0px',
  },
  table: {
    // minWidth: 650,
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

    ValidatorForm.addValidationRule('lessthanbalance', (value) => {
      // console.log(`${value}  ${this.props.p1}`)
      return (value <= this.props.p1);
    });

    ValidatorForm.addValidationRule('noSpecialCharacters', (value) => {
      return validateSpecialCharacters(value);
    });    
  }

  componentWillUnmount() {
    // remove rule when it is not needed
    ValidatorForm.removeValidationRule('minLength');
    ValidatorForm.removeValidationRule('lessthanbalance');
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
  // const [displayName, setDisplayName] = useState("");
  const [bidAmount, setBidAmount] = useState(1000);
  const [memberCount, setMemberCount] =useState(2);
  const [memberFee, setMemberFee] = useState(50);
  const [registerStatus, setRegisterStatus] = useState(0);
  const [tournamentData, setTournamentData] = useState([]);
  const [selectedTournament, SetSelectedTournament] = useState("");
  // const [ errorMessage, setErrorMessage ] = useState("");
  const [created, setCreate] = useState(false);
  const [groupCode, setGroupCode] = useState("");
  const [copyState, setCopyState] = useState({value: '', copied: false});
  const [balance, setBalance] = useState(0);
  const [prizeCount, setPrizeCount] = useState(1);
  const [prizeTable, setPrizeTable] = useState([]);
  const [masterPrizeTable, setMasterPrizeTable] = useState([]);
  const [newGid, setNewGid] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  // state = {
  //   value: 'arunsalgia',
  //   copied: false,
  // };

  const handleSelectedTournament = (event) => {
    SetSelectedTournament(event.target.value);
  };
  
  useEffect(() => {
    const a = async () => {
        var balres = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/wallet/balance/${localStorage.getItem("uid")}`);
        setBalance(balres.data.balance);

        var response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/tournament/list/notstarted`); 
        // console.log("Getting tournament list");
        // console.log(response.data);
        setTournamentData(response.data);
        let selTournament = (response.data.length > 0) ? response.data[0].name : "";
        let myDisable = false;
        if (localStorage.getItem("cGroup").length > 0) {
          selTournament = localStorage.getItem("cGroup");
          localStorage.setItem("cGroup", "");
          myDisable = true;
        }
        SetSelectedTournament(selTournament);
        setIsDisabled(myDisable);
    };    
    a();
  }, []);

  // const handleChange = (event) => {
  //   const { user } = this.state;
  //   user[event.target.name] = event.target.value;
  //   this.setState({ user });
  // }

  const handleSubmit = async() => {
    //console.log("Submit command provided");
    //  /group/create/TeSt/8/1250/AUSINDT20
    // groupName  bidAmount selectedTournament
    try {
      const response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/group/create/${groupName}/${localStorage.getItem("uid")}/${bidAmount}/${selectedTournament}/${memberCount}/${memberFee}`);
      console.log(response.data);
      setNewGid(response.data.gid)      

      // set this as default
      localStorage.setItem("gid", response.data.gid.toString());
      localStorage.setItem("groupName", response.data.name);
      localStorage.setItem("tournament", response.data.tournament);
      localStorage.setItem("admin", true);

      let myBalance = await getUserBalance();
      setBalance(myBalance);
      // SET PRIZE is not required here since create by default will set it to 1
      // let myURL=`${process.env.REACT_APP_AXIOS_BASEPATH}/group/setprize/${response.data.gid}/1`;
      // console.log(myURL);
      // let xxx = await axios.get(myURL);
      let totprize = memberFee*memberCount;
      var prizeres = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/prize/all/${totprize}`)
      setMasterPrizeTable(prizeres.data)
      setPrizeTable(prizeres.data[prizeCount-1]);
      setCopyState({value: response.data._id})
      setGroupCode(response.data._id);
      setRegisterStatus(200);
    } catch (err) {
      console.log(`error code is ${err.response.status}`)
      setRegisterStatus(err.response.status);
    }
  }

  // function handleCopyCode() {
  //   // const el = this.textArea
  //   // el.select()
  //   // document.execCommand("copy")
  //   // this.setState({copySuccess: true})
  //   const xxx = document.getElementById("codestring");
  //   console.log(xxx);
  //   xxx.select();
  //   // setRegisterStatus(1000);
  // }

  async function handleCountChange(event) {
    let idx = parseInt(event.target.value);
    let xxx = axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/group/setprize/${newGid}/${idx}`);
    setPrizeTable(masterPrizeTable[idx-1])
    setPrizeCount(idx);
    await xxx;
  };

/*
  function org_DisplayPrizeTable() {
    return (
      <Table
      tableKey="t-cvc"
      id="t-cvc"
      size="small"
      tableHeaderColor="warning"
      tableHead={["Rank", "Prize"]}
      tableData={prizeTable.map(x => {
          const arr = [x.rank,  x.prize]
          return { data: arr, collapse: [] }
      })}
      />
    );
  }
*/


  function DisplayPrizeRadio(props) {
    let inumber = parseInt(props.number);
    return(
      <FormControlLabel
      value={props.number} label={props.number} labelPlacement="start" disabled={inumber > memberCount} checked={prizeCount === inumber}
      control={<Radio color="primary" />}
      />
    );
  } 

  function DisplayMemberCount() {
    return (
    <div>
      <DisplayPageHeader headerName="Prize Count" groupName="" tournament=""/>
      <BlankArea />
      <FormControl component="fieldset" align="center">
      {/* <FormLabel component="legend" color="primary" align="center">Prize Count</FormLabel> */}
        <RadioGroup aria-label="position" name="position" value={prizeCount} onChange={handleCountChange} row>
          <DisplayPrizeRadio number="1"/>
          <DisplayPrizeRadio number="2"/>
          <DisplayPrizeRadio number="3"/>
          <DisplayPrizeRadio number="4"/>
          <DisplayPrizeRadio number="5"/>
        </RadioGroup>
      </FormControl>
    </div>
    );
  }

  function SelectPrizeCount() {
    if (groupCode.length > 0) {
      return (
        <div>
          <DisplayMemberCount/>
          <DisplayPrizeTable tableName={prizeTable}/>
        </div>
      )
    } else {
      return  <NothingToDisplay/>;
    }
  }

  function DisplayGroupCode() {
    let myText = copyState.value;  //process.env.REACT_APP_HOMEPAGE + "/joingroup/" + copyState.value
    if (groupCode.length > 0) {
      return (
      <div align="center">
        <DisplayPageHeader headerName="Group Code" groupName="" tournament=""/>
        <BlankArea/>
        <Typography className={classes.groupMessage}>Share this code with your friends to join your group</Typography>
        <BlankArea/>
        <Typography className={classes.groupCode}>{groupCode}</Typography>
        <BlankArea/>
        <CopyToClipboard text={myText}
            onCopy={() => setCopyState({copied: true})}>
            <button>Copy to clipboard</button>
        </CopyToClipboard>
        {copyState.copied ? <span style={{color: 'blue'}}>Copied.</span> : null}
        <BlankArea />
      </div>       
      )
    } else {
      return  <NothingToDisplay/>;
    }
  }
  // function handleCancel() {
  //   // history.push("/admin/mygroup")
  //   setTab(0);
  // }


  function ShowResisterStatus() {
    // console.log(`Status is ${registerStatus}`);
    let myMsg;
    let errmsg = true;
    switch (registerStatus) {
      case 1000:
        myMsg = `Successfully copied code to clipboard.`;
        errmsg = false;
        break;      
      case 200:
        // setGroupName("");
        // setPassword("");
        // setRepeatPassword("");
        // setEmail("");
        myMsg = `Successfully created group ${groupName}`;
        errmsg = false;
        break;
      case 0:
        myMsg = "";
        errmsg = false;
        break;
        case 601:
        myMsg = "Duplicate group Name";
        break;
        case 602:
        myMsg = "Invalid bid amount";
        break;
      case 603:
        myMsg = "Invalid User Id";
        break;
      case 604:
        myMsg = "Invalid Tournament";
        break;
      case 605:
        myMsg = "Insufficient Balance";
        break;
      default:
        myMsg = "unknown error";
        break;
    }
    let myClass = (errmsg) ? classes.error : classes.root;
    return(
      <div>
        <Typography className={myClass}>{myMsg}</Typography>
      </div>
    );
  }

  
  return (
    <Container component="main" maxWidth="xs">
      <DisplayBalance balance={balance} />
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
      <BlankArea/>
      {/* <TextValidator
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
      /> */}
      <div>
      <TextValidator
          variant="outlined"
          required
          fullWidth      
          // size="small"  
          label="MemberCount"
          onChange={(event) => setMemberCount(event.target.value)}
          name="membercount"
          type="number"
          validators={['required', 'minNumber:2', 'maxNumber:25']}
          errorMessages={['Member count to be provided', 'Group members cannot be less than 2', 'Group members cannot be more than 25']}
          value={memberCount}
      />
      <BlankArea/>
      <TextValidator
          variant="outlined"
          required
          fullWidth    
          // size="small"  
          label="MemberFee"
          onChange={(event) => setMemberFee(event.target.value)}
          name="membercount"
          type="number"
          validators={['required', 'minNumber:50', 'lessthanbalance']}
          errorMessages={['Member count to be provided', 'Member fee cannot be less than 50', 'Insufficient Balance']}
          value={memberFee}
      />
      </div>
      <BlankArea/>
      <Select labelId='tournament' id='tournament'
        variant="outlined"
        disabled={isDisabled}
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
      <ShowResisterStatus/>
      <BlankArea/>
      <div align="center">
        <Button type="submit" key={"create"} variant="contained" color="primary" size="small"
            className={classes.button}>Create
        </Button>
        {/* <Button key={"members"} variant="contained" color="primary" size="small"
            className={classes.button} onClick={handleCancel}>Cancel
        </Button> */}
      </div>
    </ValidatorForm>
    </div>
    <ChildComp p1={balance} p3={selectedTournament}/>   
    <BlankArea/> 
    <SelectPrizeCount/>
    <BlankArea />
    <DisplayGroupCode/>
    {/* <Switch>
      <Route  path='/admin/signin' component={SignIn} key="MemberList"/>
    </Switch> */}
    </Container>
  );
}
