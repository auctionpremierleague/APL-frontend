import React, { useEffect, useState } from 'react';
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Table from "components/Table/Table.js";
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';
import GridItem from "components/Grid/GridItem.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import Avatar from "@material-ui/core/Avatar";
import Paper from "@material-ui/core/Paper";
import Typography from '@material-ui/core/Typography';
import {red, blue} from '@material-ui/core/colors';
import { NothingToDisplay, NoGroup, DisplayPageHeader } from 'CustomComponents/CustomComponents.js';
import {hasGroup} from 'views/functions'

const drawerWidth = 100;

// function createData(name, calories, fat, carbs, protein) {
//     return { name, calories, fat, carbs, protein };
//   }
  
// const rows = [
// createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
// createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
// createData("Eclair", 262, 16.0, 24, 6.0),
// createData("Cupcake", 305, 3.7, 67, 4.3),
// createData("Gingerbread", 356, 16.0, 49, 3.9)
// ];
  
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
    team:  {
        // right: 0,
        fontSize: '12px',
        color: blue[700],
        // position: 'absolute',
        alignItems: 'center',
        marginTop: '0px',
    },
  }));


export default function MatchInfo() {
    // const { user } = useContext(UserContext);

    const classes = useStyles(); 
    const [currentArray, setCurrentArray] = useState([]);
    const [upcomingArray, setUpcomingArray] = useState([]);

    useEffect(() => { 
        const fetchMatch = async () => {
            try {
                if (hasGroup(localStorage.getItem("gid"))) {
                    let response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/match/matchinfo/${localStorage.getItem("gid")}`);
                    setCurrentArray(response.data.current);
                    setUpcomingArray(response.data.upcoming);
                }
            } catch (e) {
                console.log(e)
            }
          }
        fetchMatch();
        }, []);

    function OrgMatchDetails(props) {
    let uteam1 = props.team1.toUpperCase();
    let uteam2 = props.team2.toUpperCase();
    return (
        <Paper elevation={6} >
        <Box border={1}>
        <Grid m={0} spacing={0} shadow={5} container>
            <GridItem  m={0} justify="start" alignItems="start"  xs={2}>
                <Avatar variant="square" src={`${process.env.PUBLIC_URL}/${uteam1}.JPG`} className={classes.medium} />                      
            </GridItem>
            <GridItem  m={0} xs={8}><Typography align="center">{props.matchTime}</Typography></GridItem>
            <GridItem m={0} justify="right" alignItems="right" xs={2}>
                <Avatar variant="square" src={`${process.env.PUBLIC_URL}/${uteam2}.JPG`} className={classes.medium} />                      
            </GridItem>
            <GridItem  m={0} xs={6}><Typography className={classes.team} align="left">{props.team1}</Typography></GridItem>
            <GridItem  m={0} xs={6}><Typography className={classes.team} align="right">{props.team2}</Typography></GridItem>
        </Grid> 
        </Box>
        </Paper>
    );        
    }

    function OrgMatchTable(props) {
        //console.log(props.myTable)
        // if (props.myTable.length > 0)
            return (
                <TableContainer >
                <Table   aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell color="warning" align="right">Dessert (100g serving)</TableCell>
                      <TableCell color="warning" align="right">Calories</TableCell>
                      <TableCell color="warning" align="right">Fat</TableCell>
                      <TableCell color="warning" align="right">Carbs</TableCell>
                      <TableCell color="warning" align="right">Protein</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                      <TableRow key="Sample">
                        <TableCell component="th" scope="row">Hello</TableCell>
                        <TableCell align="center">cal</TableCell>
                        <TableCell align="right">fst</TableCell>
                        <TableCell align="right">carbs</TableCell>
                        <TableCell align="right">protein</TableCell>
                      </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
                      );
        // else
        //     return <NoGroup />
    }

    function MatchTable(props) {
        //console.log(props.myTable)
        if (props.myTable.length > 0)
            return (
                <Table
                tableHeaderColor="warning"
                tableHead={["Teams", "Time"]}
                tableData={props.myTable.map(mmm => {
                    const arr = [ mmm.team1 + " Vs. " + mmm.team2, mmm.matchTime]
                    return { data: arr, collapse: [] }
                })}
                />
            );
        else
            return <NothingToDisplay />
    }

    function ShowCurrentMatch() {
        var myHeader = "Match running just now";    // : "Currently No Matches running";
        return(
            <Card profile>
            <CardBody profile>
                <h4 className={classes.cardTitle}>{myHeader}</h4>
                <MatchTable myTable={currentArray}/>
            </CardBody>
            </Card>
        );
    }

    function ShowUpcomingMatch() {
        var myHeader = "Upcoming Matches";
        return(
            <Card profile>
            <CardBody profile>
                <h4 className={classes.cardTitle}>{myHeader}</h4>
                <MatchTable myTable={upcomingArray}/>
            </CardBody>
            </Card>
        );
    }

    if (localStorage.getItem("tournament").length > 0)
        return (
            <div>
            <DisplayPageHeader headerName="Matches" groupName={localStorage.getItem("groupName")} tournament={localStorage.getItem("tournament")}/>
            <ShowCurrentMatch/>
            <ShowUpcomingMatch/>
            </div>
        );
    else
        return <NoGroup/>
};
