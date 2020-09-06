import React, { useEffect, useState,useContext } from 'react';
import axios from "axios";


import Grid from "@material-ui/core/Grid";
import Table from "components/Table/Table.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import IconButton from '@material-ui/core/IconButton';
import CardBody from "components/Card/CardBody.js";
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import { UserContext } from "../../UserContext";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
export default function App() {
    const { user} = useContext(UserContext);

   // const classes = useStyles();
    const theme = useTheme();
    const useStyles = makeStyles(styles);
    const classes = useStyles();
    const [teamArray, setTeamArray] = useState([]);
    const [open, setOpen] = React.useState(false);
    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await axios.get(`/user/myteam/${user}`);
                console.log(response.data);
                setTeamArray(response.data[0].players)
            } catch (e) {
                console.log(e)
            }


        }
        fetchTeam();
    }, [])

    return (
<Grid
  container
  direction="row"
  justify="center"
  alignItems="center"
>
<Card>
            <CardHeader color="warning">
              <h4 className={classes.cardTitleWhite}>Franchise Score Board</h4>
              <p className={classes.cardCategoryWhite}>
               
              </p>
            </CardHeader>
            <CardBody>
              <Table
                tableHeaderColor="warning"
                tableHead={["", "Fanchise", "Owner", "Score"]}
                tableData={[{data:[  <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>],collapse:[  <Collapse in={open} timeout="auto" unmountOnExit><Typography variant="h6" gutterBottom component="div">
                History
              </Typography></Collapse>]}]}
              />
            </CardBody>
          </Card>
        </Grid>
    )
};


