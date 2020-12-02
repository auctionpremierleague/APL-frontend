import React from 'react';
import ReactDOM from 'react-dom';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import {red, blue, green} from '@material-ui/core/colors';

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
  groupName:  {
    // right: 0,
    fontSize: '12px',
    color: blue[700],
    // position: 'absolute',
    alignItems: 'center',
    marginTop: '0px',
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

}));

export class NoGroup extends React.Component {
  render() {return <h3 align="center">Do not belong to any Group</h3>;}
}

export class BlankArea extends React.Component {
  render() {return <h3></h3>;}
}

export class NothingToDisplay extends React.Component {
  render() {return <div></div>;}
}

export function DisplayGroupName (props) {
  const classes = useStyles();
  return(<Typography className={classes.groupName} align="center">({props.groupName})</Typography>);
}

export function DisplayPageHeader (props) {
    let msg = props.groupName + '-' + props.tournament;
    return (
    <div>
      <Typography align="center" component="h1" variant="h5">{props.headerName}</Typography>
      <DisplayGroupName groupName={msg}/>
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
