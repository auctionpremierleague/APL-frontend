import React, { useEffect, useState, useContext } from 'react';
import axios from "axios";


import Grid from "@material-ui/core/Grid";
import Table from "components/Table/Table.js";

import { makeStyles, useTheme } from '@material-ui/core/styles';

import { UserContext } from "../../UserContext";
// import { Typography } from '@material-ui/core';
import GridItem from "components/Grid/GridItem.js";
import Card from "components/Card/Card.js";
// import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";

const drawerWidth = 100;
const useStyles = makeStyles((theme) => ({
    margin: {
        margin: theme.spacing(1),
    },
    image: {
        height: "200px"
    },
    container: {
        backgroundImage: "url(\"../RCB/5334.jpg\")",
        backgroundSize: 'cover'
    }, drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-start',
    },
    sold: {
        color: "green"
    }, cardCategoryWhite: {
        color: "rgba(255,255,255,.62)",
        margin: "0",
        fontSize: "14px",
        marginTop: "0",
        marginBottom: "0"
    },
    cardTitleWhite: {
        color: "#FFFFFF",
        marginTop: "0px",
        minHeight: "auto",
        fontWeight: "300",
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: "3px",
        textDecoration: "none"
    }, large: {
        width: theme.spacing(12),
        height: theme.spacing(12),
    },
}));

const populateTable = (data) => {
    const tableData = [];
    data.forEach(element => {
        tableData.push({ displayName: element.displayName, players: element.players })
    });
    return tableData;
}

export default function App() {
    const { user } = useContext(UserContext);

    const classes = useStyles();
    // const theme = useTheme();
    const [teamArray, setTeamArray] = useState([]);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                var myTeamUrl = "";
                if (localStorage.getItem("admin") === "true")
                    myTeamUrl = `/user/myteam/${localStorage.getItem("gid")}/all`;
                else if (localStorage.getItem("ismember") === "true")
                    myTeamUrl = `/user/myteam/${localStorage.getItem("gid")}/${localStorage.getItem("uid")}`;
                
                var data = [{displayName: "Not a team member", players: [{playerName: "", team: "", bidAmount: ""}] }];
                if (myTeamUrl.length > 0) {
                    var response = await axios.get(myTeamUrl);
                    data = populateTable(response.data);
                }
                setTeamArray(data);
            } catch (e) {
                console.log(e)
            }
        }
        fetchTeam();
    }, []);




    // return (
    //     teamArray.map(team => 
    //     <Grid container direction="row" justify="center" alignItems="center">
    //         <Typography>{team.displayName}</Typography>
    //         <Table
    //             tableHeaderColor="warning"
    //             tableHead={["Player Name", "Team", "Bid Amount"]}
    //             tableData={team.players.map(team => {
    //                 const arr = [team.playerName, team.team, team.bidAmount]
    //                 return { data: arr, collapse: [] }
    //             })}
    //         />
    //     </Grid>           
    //     )

    // )

    return (
        teamArray.map(team => 
            <Grid container justify="center" alignItems="center">
            <Grid item xs={12}>
                <div>
                    <Grid container justify="center" alignItems="center" >
                        <GridItem xs={12} sm={12} md={12} lg={12} >
                            <Card profile>
                                <CardBody profile>
                                <h3 className={classes.cardTitle}>{team.displayName}</h3>
                                    <Table
                                        tableHeaderColor="warning"
                                        tableHead={["Player Name", "Team", "Bid Amount"]}
                                        tableData={team.players.map(team => {
                                            const arr = [team.playerName, team.team, team.bidAmount]
                                            return { data: arr, collapse: [] }
                                        })}
                                    />
                                </CardBody>
                            </Card>
                        </GridItem>
                    </Grid>
                </div>
            </Grid>
        </Grid>

        )
    )
};


