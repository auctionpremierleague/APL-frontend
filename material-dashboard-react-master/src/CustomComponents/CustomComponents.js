import React from 'react';
import ReactDOM from 'react-dom';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import blue from '@material-ui/core/colors/blue';

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
return (
  <div>
    <Typography align="center" component="h1" variant="h5">{props.headerName}</Typography>
    <DisplayGroupName groupName={props.groupName}/>
  </div>
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
