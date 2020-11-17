import React, { useEffect, useState } from 'react';
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import Table from "components/Table/Table.js";
import { makeStyles } from '@material-ui/core/styles';
// import { UserContext } from "../../UserContext";
// import { Typography } from '@material-ui/core';
import GridItem from "components/Grid/GridItem.js";
import Card from "components/Card/Card.js";
// import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";
import Avatar from "@material-ui/core/Avatar"
import NoGroup from 'CustomComponents/NoGroup.js';

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
    },
    large: {
        width: theme.spacing(12),
        height: theme.spacing(12),
    },
    medium: {
        width: theme.spacing(7),
        height: theme.spacing(7),
    }
}));


// const populateTable = (data) => {
//     const tableData = [];
//     data.forEach(element => {
//         tableData.push({ displayName: element.displayName, players: element.players })
//     });
//     return tableData;
// }

export default function App() {
    // const { user } = useContext(UserContext);
    // const theme = useTheme();

    const classes = useStyles();
    const [teamArray, setTeamArray] = useState([]);
    const [hasTeam, setHasTeam] = useState(true);
    useEffect(() => {
        const fetchTeam = async () => {
            try {
                var myTeamUrl = "";
                if ((localStorage.getItem("gid") !== "") && (localStorage.getItem("gid") !== "0"))
                {
                    // if (localStorage.getItem("admin") === "true")
                    //     myTeamUrl = `/user/myteam/${localStorage.getItem("gid")}/all`;
                    // else if (localStorage.getItem("ismember") === "true")
                //     myTeamUrl = `/user/myteam/${localStorage.getItem("gid")}/${localStorage.getItem("uid")}`;                
                // if (myTeamUrl.length > 0) {
                    var response = await axios.get(`/user/myteam/${localStorage.getItem("gid")}/${localStorage.getItem("uid")}`);
                    // data = populateTable(response.data);
                    // console.log(response.data);
                    setTeamArray(response.data);
                // } else {
                //     var data = [{displayName: "Not a team member", players: [{playerName: "", team: "", bidAmount: ""}] }];
                //     setTeamArray(data);
                // }
                }
                else
                    setHasTeam(false);
            } catch (e) {
                console.log(e)
            }
        }
        fetchTeam();
    }, []);

    if (hasTeam)
        return (
            teamArray.map(team => 
            <div>
                {/* <h3 className={classes.cardTitle}>{team.displayName}</h3> */}
                <h3 align="center">My Team ({localStorage.getItem("tournament")})</h3>
                <Table
                    key={team.displayName}
                    id={team.displayName}
                    tableHeaderColor="warning"
                    tableHead={["Player Name", "Team", "Bid Amount"]}
                    tableData={team.players.map(team => {
                        const arr = [team.playerName, 
                            // <Avatar variant="circle" src={`${process.env.PUBLIC_URL}/${team.team}.JPG`} className={classes.medium} />, 
                            team.team,                        
                            team.bidAmount]
                            return { data: arr, collapse: [] }
                    })}
                />
            </div>
            )
        )
    else
        return <NoGroup/>;
};


