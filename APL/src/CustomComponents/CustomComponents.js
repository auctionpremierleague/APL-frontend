import React from 'react';
import ReactDOM from 'react-dom';
import Avatar from '@material-ui/core/Avatar';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import {red, blue, green, yellow} from '@material-ui/core/colors';
import {validateSpecialCharacters, validateEmail, validateMobile,
  encrypt, decrypt, currentAPLVersion, latestAPLVersion} from "views/functions.js";

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
    width: theme.spacing(10),
    height: theme.spacing(10),
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
  groupName:  {
    // right: 0,
    fontSize: '12px',
    color: blue[700],
    // position: 'absolute',
    alignItems: 'center',
    marginTop: '0px',
  },
  balance:  {
    // right: 0,
    marginRight: theme.spacing(3),
    fontSize: '18px',
    color: blue[900],
    // // position: 'absolute',
    // alignItems: 'center',
    // marginTop: '0px',
  },
  version:  {
    //marginRight: theme.spacing(3),
    fontSize: '18px',
    color: blue[900],
  },
  error:  {
    // right: 0,
    fontSize: '12px',
    color: red[700],
    // position: 'absolute',
    alignItems: 'center',
    marginTop: '0px',
  },
  successMessage: {
    color: green[700],
  }, 
  failureMessage: {
    color: red[700],
  }, 
  table: {
    // minWidth: 650,
  },
  ngHeader: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  ngCard: {
    backgroundColor: '#B3E5FC',
  },
}));


export function DisplayPrizeTable(props) {
  const classes = useStyles();
  return (
    <TableContainer component={Paper}>
    <Table size="small" className={classes.table} aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell color="warning" align="center">Rank</TableCell>
          <TableCell color="warning" align="center">Prize</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.tableName.map((row) => (
          <TableRow key={row.rank}>
            <TableCell align="center">{row.rank}</TableCell>
            <TableCell align="center">{row.prize}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>    
  );
}

export function ShowCreateGroup() {
  return (
    <div>
    <Typography paragraph>
    Click on Group Icon (on right hand side) and select “New Group”.
    </Typography>
    <Typography paragraph>
    You will need the following information to create new Group.
    </Typography>
    <Typography paragraph>
    1.  Name of your group. e.g. "Bonaventure Gold". User who creates the new group is considered as the group "OWNER/ADMIN".
    </Typography>
    <Typography paragraph>
    2.  Number of members that will be part of this group.
    </Typography>
    <Typography paragraph>
    3.  Member Free (e.g. 50/75/100 Rupees as desired by you.) It will be available in your wallet.
    </Typography>
    <Typography paragraph>
    4.  Select the tournamenet for which you want to play.
    </Typography>
    Once above information is provided, user can click on "Create" button to create new group.
    <Typography paragraph>
    Next is to select the number of prizes (in the range 1 to 5).
    </Typography>
    <Typography paragraph>
    Total Prize money will be equal to Number of Members * Member Fee 
    </Typography>
    <Typography paragraph>
    The final step is to copy the Groupcode and share with the members.
    </Typography>
    </div>
  )
}


export function ShowJoinGroup() {
  return (
    <div>
    <Typography paragraph>
    Click on Group Icon (on right hand side) and select “Join Group”.
    </Typography>
    <Typography paragraph>
    When the GroupCode is shared with you, just go to "Join Group" and join the group using the group code.
    </Typography>
    </div>
  )
}

export function ShowAuctionGroup() {
  return (
    <div>
    <Typography paragraph>
    Once all the players have joined the group, the next step is to purchase Players by the process of Auction.
    </Typography>
    <Typography paragraph>
    Go to "Auction" tab. Group onwer can click on "Start Auction" button.
    </Typography>
    <Typography paragraph>
    Now the player details will be displayed to all memebers. Click on amount button and do bidding. When Group owner find that bid amount is not increasiunng, then owner will press of "Sold" button and the player will be awarded to the highest bidder.
    </Typography>
    <Typography paragraph>
    If there is no bid (bid amount 0) for the player, group owner can click on "Unsold" to skip the player. details will be displayed to all memebsr. Click on amount button and do bidding. When Group owner find that bid amount is not increasiunng, then he will pess of "Sold" button and the player will be awarded to the highest bidder.
    </Typography>
    <Typography paragraph>
    Once auction is complete, Admin will click on “Stop Auction” button. After this, all group members will get message indicating end of Auction.
    </Typography>
    <Typography paragraph>
    User can view the number of players purchased by them along with the balance amount.
    </Typography>
    <Typography paragraph>
    All the members can view the players purchased during auction by clicking on “My Team” tab.
    </Typography>
    </div>
  )
}

export function ShowCaptainGroup() {
  return (
    <div>
    <Typography paragraph>
    After the Auction is complete. Use can click on "Captain" (availabein Menu) and select Captain and Vice Captain.
    </Typography>
    </div>
  )
}

export function ShowMultipleGroup() {
  return (
    <div>
    <Typography paragraph>
    After the Auction is complete. Use can click on "Captain" (availabein Menu) and select Captain and Vice Captain.
    </Typography>
    </div>
  )
}

export function NoGroup() {
  const classes = useStyles();
  return (<h3>Does not belong to any Group</h3>);
}

/**
const [noGroupPanel, setNGExpandedPanel] = useState(false);
  const handleNoGroupChange = (panel) => (event, isExpanded) => {
    // console.log({ event, isExpanded });
    handleNoGroupChange(isExpanded ? panel : false);
  };
 

export function NoGroup() {
  const classes = useStyles();
  return (
    <Card className={classes.ngCard}>
    <CardContent>
    <Accordion expanded={noGroupPanel === "CREATE"} onChange={handleNoGroupChange("CREATE")}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
    <Typography className={classes.ngHeader}>Create Group</Typography>
    </AccordionSummary>
    <AccordionDetails><ShowCreateGroup/></AccordionDetails>
    </Accordion>
    <Accordion expanded={noGroupPanel === "JOIN"} onChange={handleNoGroupChange("JOIN")}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
    <Typography className={classes.ngHeader}>Join Group</Typography>
    </AccordionSummary>
    <AccordionDetails><ShowJoinGroup/></AccordionDetails>
    </Accordion>
    </CardContent>
    </Card>
  )
};
*/

export class BlankArea extends React.Component {
  render() {return <h3></h3>;}
}

export class NothingToDisplay extends React.Component {
  render() {return <div></div>;}
}


export class ValidComp extends React.Component {

  componentDidMount()  {
    // custom rule will have name 'isPasswordMatch'
    ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
      return (value === this.props.p1)
    });

    ValidatorForm.addValidationRule('minLength', (value) => {
      return (value.length >= 6)
    });

    ValidatorForm.addValidationRule('noSpecialCharacters', (value) => {
      return validateSpecialCharacters(value);
    });

    ValidatorForm.addValidationRule('isEmailOK', (value) => {
      return validateEmail(value);
    });

    ValidatorForm.addValidationRule('mobile', (value) => {
      return validateMobile(value);
    });

    ValidatorForm.addValidationRule('checkbalance', (value) => {
      return validateSpecialCharacters(value > this.props.balance);
    });
  }

  
  componentWillUnmount() {
    // remove rule when it is not needed
    ValidatorForm.removeValidationRule('isPasswordMatch');
    ValidatorForm.removeValidationRule('isEmailOK');
    ValidatorForm.removeValidationRule('mobile');
    ValidatorForm.removeValidationRule('minLength');
    ValidatorForm.removeValidationRule('noSpecialCharacters');   
    ValidatorForm.removeValidationRule('checkbalance');   
  }

  render() {
    return <br/>;
  }

}

export function GeneralMessage (props) {
  return(<h3 align="center">{props.message}</h3>);
}

export function DisplayGroupName (props) {
  const classes = useStyles();
  if (props.groupName.length > 0)
    return(<Typography className={classes.groupName} align="center">({props.groupName})</Typography>);
  else
    return(<NothingToDisplay />);
}

export function DisplayPageHeader (props) {
    let msg = "";
    if (props.groupName.length > 0) 
      msg = props.groupName + '-' + props.tournament;
    return (
    <div>
      <Typography align="center" component="h1" variant="h5">{props.headerName}</Typography>
      <DisplayGroupName groupName={msg}/>
    </div>
  );
}

export function DisplayBalance (props) {
  const classes = useStyles();
  let msg =  `Wallet balance: ${props.balance}`;
  return (
  <div>
    <Typography align="right" className={classes.balance} >{msg}</Typography>
  </div>
  );
}


export function MessageToUser (props) {
  const classes = useStyles();
  // console.log(props.mtuMessage);
  let myClass = props.mtuMessage.toLowerCase().includes("success") ? classes.successMessage : classes.failureMessage;
  return (
    <Dialog aria-labelledby="simple-dialog-title" open={props.mtuOpen}
        onClose={() => {props.mtuClose(false)}} >
        <DialogTitle id="simple-dialog-title" className={myClass}>{props.mtuMessage}</DialogTitle>
    </Dialog>
  );
}


export class Copyright extends React.Component {
  render () {
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
        <Link color="inherit" href="https://material-ui.com/">
        CricDream
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  }
}

export function CricDreamLogo () {
  let mylogo = `${process.env.PUBLIC_URL}/APLLOGO1.ICO`;
  const classes = useStyles();
  return (
    <Avatar variant="square" className={classes.avatar}  src={mylogo}/>
);
}

export function DisplayVersion(props) {
  const classes = useStyles();
  let ver = props.version.toFixed(1);
  let msg =  `${props.text} ${ver}`;
  return <Typography align="center" className={classes.version} >{msg}</Typography>
}

export async function DisplayCurrentAPLVersion() {
  let version = await currentAPLVersion();
  return <DisplayVersion text="Current APL version" version={version}/>
}

export async function DisplayLatestAPLVersion() {
  let version = await latestAPLVersion();
  return <DisplayVersion text="Latest APL version" version={version}/>
}
  
