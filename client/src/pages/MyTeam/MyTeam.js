import React, { useEffect, useState } from 'react';
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
//import { action } from '@storybook/addon-actions';
import { makeStyles, useTheme } from '@material-ui/core/styles';
//import { withKnobs, boolean, number } from '@storybook/addon-knobs';
//import imagine1 from "assets/img";
console.log(process.env.PUBLIC_URL)
const content = [
    {
        title: "Vulputate Mollis Ultricies Fermentum Parturient",
        description:
            "Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Cras justo odio, dapibus ac facilisis.",
        button: "Read More",
        image: "https://i.imgur.com/ZXBtVw7.jpg",
        user: "Luan Gjokaj",
        userProfile: "https://i.imgur.com/JSW6mEk.png"
    },
    {
        title: "Tortor Dapibus Commodo Aenean Quam",
        description:
            "Nullam id dolor id nibh ultricies vehicula ut id elit. Cras mattis consectetur purus sit amet fermentum. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec sed odio dui.",
        button: "Discover",
        image: "https://i.imgur.com/DCdBXcq.jpg",
        user: "Erich Behrens",
        userProfile: "https://i.imgur.com/0Clfnu7.png"
    },
    {
        title: "Phasellus volutpat metus",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Duis mollis, est non commodo luctus, nisi erat porttitor ligula.",
        button: "Buy now",
        image: "https://i.imgur.com/DvmN8Hx.jpg",
        user: "Bruno Vizovskyy",
        userProfile: "https://i.imgur.com/4KeKvtH.png"
    }
];
const mainGroupId = 'Main'

export default function App() {


   // const classes = useStyles();
    const theme = useTheme();
    const [teamArray, setTeamArray] = useState([])
    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await axios.get("http://localhost:4000/user/myteam/8");
                console.log(response.data[0]);
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
        <Carousel infiniteLoop showThumbs={false} showStatus={false}
        >
            {teamArray.map(player => <div key={player.pid}> <img src={`../${player.pid}.jpg`} />
                <p className="legend"> {player.pid}</p></div>)}

        </Carousel>
        </Grid>
    )
};


