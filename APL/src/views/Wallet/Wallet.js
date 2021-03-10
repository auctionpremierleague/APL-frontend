import React, { useState, useEffect} from 'react';
// import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
// import TextField from '@material-ui/core/TextField';
// import Grid from '@material-ui/core/Grid';
// import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Table from "components/Table/Table.js";
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
// import { UserContext } from "../../UserContext";
import axios from "axios";
// import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import red from '@material-ui/core/colors/red';
// import { useHistory } from "react-router-dom";
// import {validateSpecialCharacters, validateEmail, cdRefresh} from "views/functions.js";


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
  error:  {
      // right: 0,
      fontSize: '12px',
      color: red[700],
      // position: 'absolute',
      alignItems: 'center',
      marginTop: '0px',
  },
}));


export default function Wallet() {
  const classes = useStyles();
  // const history = useHistory();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  // const [registerStatus, setRegisterStatus] = useState(0);

  useEffect(() => {
    const WalletInfo = async () => {
      try {
        // get user details
        // get wallet transaction and also calculate balance
        var response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/wallet/details/${localStorage.getItem("uid")}`);
        setTransactions(response.data);
        let myBalance = response.data.reduce((accum,item) => accum + item.amount, 0);
        setBalance(myBalance);
      } catch (e) {
          console.log(e)
      }
    }
    WalletInfo();
  }, []);


  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">Wallet Transactions (Balance: {balance})</Typography>
        <Table
          tableHeaderColor="warning"
          tableHead={["Date", "Type", "Amount"]}
          tableData={transactions.map(tRec => {
              const arr = [tRec.date, tRec.type, tRec.amount]
              return { data: arr, collapse: [] }
          })}
          />
      </div>
    </Container>
  );
}
