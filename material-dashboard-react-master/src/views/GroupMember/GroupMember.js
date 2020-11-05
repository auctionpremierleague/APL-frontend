import React, { useEffect, useState } from 'react';
import axios from "axios";
import Button from '@material-ui/core/Button';
import { useHistory } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Table from "components/Table/Table.js";
import { makeStyles } from '@material-ui/core/styles';
import GridItem from "components/Grid/GridItem.js";
import Card from "components/Card/Card.js";
// import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";
import { useLocation } from "react-router-dom";

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


export default function GroupMember() {
    const classes = useStyles();
    // const location = useLocation();
    const history = useHistory();
    const [memberArray, setMemberArray] = useState([]);
    const [tournamentStated, setTournamentStarted] = useState(false);
    // const { state } = this.props.history.location;

    useEffect(() => {
       
        const fetchMember = async () => {
            // console.log(state);
            try {
                var response = await axios.get(`/user/group/${localStorage.getItem("gdGid")}`);
                // console.log(response.data);
                setMemberArray(response.data);
                var response1 = await axios.get(`/group/gamestarted/${localStorage.getItem("gid")}`);
                var gameStarted = (response1.data.length > 0);
                // gameStarted = false;
                setTournamentStarted(gameStarted);
    
            } catch (e) {
                console.log(e)
            }
        }
        // console.log(`Is Admin: ${localStorage.getItem("gdAdmin")}`);
        fetchMember();
    }, []);

    function addNewMember() {
        console.log("Add new member to be implemnted");
    }


    function ShowGmButtons() {
        return (
        <div align="center">
            <Button variant="contained" color="primary" size="small"
                disabled={tournamentStated || (localStorage.getItem("gdAdmin").length === 0)}
                className={classes.button} onClick={addNewMember}>Add Member
            </Button>
            <Button variant="contained" color="primary" size="small"
                className={classes.button} onClick={() => { history.push("/admin/mygroup") }}>Back
            </Button>

        </div>)
    }


    return (
    <div key={localStorage.getItem("gdName")}>
        <h3 className={classes.cardTitle}>{localStorage.getItem("gdName")}</h3>
        <Table
            id={localStorage.getItem("gdName")}
            tableHeaderColor="warning"
            tableHead={["Owner", "Franchise"]}
            tableData={memberArray.map(x => {
            const arr = [x.userName, x.displayName]
                return { data: arr, collapse: [] }
            })}
        />
        <h3></h3>
        <ShowGmButtons/>
    </div>
    );
};


