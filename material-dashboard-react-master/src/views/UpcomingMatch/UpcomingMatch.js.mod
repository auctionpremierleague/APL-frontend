import React, { useEffect, useState } from 'react';
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import Table from "components/Table/Table.js";
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import GridItem from "components/Grid/GridItem.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import { NoGroup } from 'CustomComponents/CustomComponents.js';
import red from '@material-ui/core/colors/red';
import yellow from '@material-ui/core/colors/yellow';

import Background from './matchbg.jpg';
import { InsertLinkRounded, Rowing } from '@material-ui/icons';

var sectionStyle = {
  width: "100%",
  height: "60px",
  backgroundImage: `url(${process.env.PUBLIC_URL}/team1team2/arun.JPG)`,
//   backgroundImage: "url(" + { Background } + ")"
};

    
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
    time:  {
        // right: 0,
        // fontSize: '12px',
        // color: red[700],
        // position: 'absolute',
        alignItems: 'center',
        marginTop: '0px',
    },
    hdrText:  {
        // right: 0,
        fontSize: '24px',
        // color: yellow[700],
        // // position: 'absolute',
        align: 'center',
        marginTop: '0px',
        marginBottom: '0px',
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
                var response = await axios.get(`/match/matchinfo/${localStorage.getItem("gid")}`);
                setCurrentArray(response.data.current);
                setUpcomingArray(response.data.upcoming);
            } catch (e) {
                console.log(e)
            }
        }
        fetchMatch();
    }, []);

    function  Info(props) {
        let lll, rrr;
        if (props.t1 < props.t2) {
            lll = props.t1;
            rrr = props.t2;
        } else {
            lll = props.t2;
            rrr = props.t1;
        }

        var sectionStyle = {
            width: "100%",
            height: "15%",
            backgroundImage: `url(${process.env.PUBLIC_URL}/team1team2/${lll}${rrr}.JPG)`,
            // backgroundImage: `url(${process.env.PUBLIC_URL}/matchbg.jpg)`,
          };          
         console.log(sectionStyle.backgroundImage);
        //  let xxx = `${props.t1}     ${props.tm}     ${props.t2}`
          return (
            <section style={ sectionStyle }>
                <div marginTop="0" marginBottom="0">
                    <h3 className={classes.hdrText} align="center">{props.tm}</h3>
                </div>
            </section>
          );
      }
    
    function MatchTable(props) {
        if (props.myTable.length > 0)
            return (
            <Table size="small"
            tableHeaderColor="warning"
            tableHead={["Team1", "Team2", "Start Time"]}
            tableData={props.myTable.map(x => {
                const arr = [x.team1, x.team2, x.matchTime]
                return { data: arr, collapse: [] }
            })}
            />);
        else
            return (<div></div>);
    }

    function NewMatchTable() {
        return (
            <Table size="small"
            tableHeaderColor="warning"
            // tableHead={["Team1", "Team2", "Start Time"]}
            tableData={upcomingArray.map(x => {
                const arr = [<Info t1="INDIA" t2="AUSTRALIA" tm={x.matchTime}/>]
                return { data: arr, collapse: [] }
            })}/>
        );
    }

    function ShowCurrentMatch() {
        var myHeader = (currentArray.length > 0)
            ? "Match running just now" : "Currently No Matches running";
        return(
        <Grid container justify="center" alignItems="center" >
            <GridItem xs={12} sm={12} md={12} lg={12} >
            <Card profile>
            <CardBody profile>
            <h4 className={classes.cardTitle}>{myHeader}</h4>
                <MatchTable myTable={currentArray}/>
            </CardBody>
            </Card>
            </GridItem>
        </Grid>
        )
    }

    function org_UpcomingMatch() {
        var myHeader = "Upcoming Matches";
        return(
        <Grid container justify="center" alignItems="center" >
            <GridItem xs={12} sm={12} md={12} lg={12} >
            <Card profile>
            <CardBody profile>
                <h4 className={classes.cardTitle}>{myHeader}</h4>
                <NewMatchTable myTable={upcomingArray}/>
            </CardBody>
            </Card>
            </GridItem>
        </Grid>
        )
    }

    function ShowUpcomingMatch() {
        var myHeader = "Upcoming Matches";
        return(
        <Grid container justify="center" alignItems="center" >
            <GridItem xs={12} sm={12} md={12} lg={12} >
            <Card profile>
            <CardBody profile>
                <h4 className={classes.cardTitle}>{myHeader}</h4>
                <NewMatchTable/>
                {/* <Section/> */}
            </CardBody>
            </Card>
            </GridItem>
        </Grid>
        )
    }

    if (localStorage.getItem("tournament").length > 0)
        return (
            <div>
                {/* <h3 align="center">Tournament ({localStorage.getItem("tournament")})</h3> */}
                <h3 align="center">Matches</h3>
                <ShowCurrentMatch/>
                <ShowUpcomingMatch/>
            </div>
        )
    else
        return <NoGroup/>
};


