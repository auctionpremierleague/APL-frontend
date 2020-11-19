import React from 'react';
import ReactDOM from 'react-dom';

export class NoGroup extends React.Component {
  render() {return <h3 align="center">Do not belong to any Group</h3>;}
}

export class BlankArea extends React.Component {
  render() {return <h3></h3>;}
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
