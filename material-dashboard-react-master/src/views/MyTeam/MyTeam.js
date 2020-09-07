import React, { useEffect, useState,useContext } from 'react';
import axios from "axios";


import Grid from "@material-ui/core/Grid";
import Table from "components/Table/Table.js";

import { makeStyles, useTheme } from '@material-ui/core/styles';

import { UserContext } from "../../UserContext";


export default function App() {
    const { user} = useContext(UserContext);

   // const classes = useStyles();
    const theme = useTheme();
    const [teamArray, setTeamArray] = useState([])
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
<Table
                tableHeaderColor="warning"
                tableHead={["Player Name", "Bid Amount"]}
                tableData={teamArray.map(team=>{const arr=[team.uid,team.bidAmount]
                
                return {data:arr,collapse:[]}})}
              />
        </Grid>
    )
};


