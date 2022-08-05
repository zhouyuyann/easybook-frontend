import React, { Component } from "react";

import AuthContext from "../context/auth-context";
import { NavLink } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';


function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        EasyBook By Yuyan Zhou
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


const theme = createTheme();

// const graphqlURL = "http://localhost:8080/graphql";
const graphqlURL = "https://easybook-springboot.herokuapp.com/graphql";


class BookingsPage extends Component {
  state = {
    isLoading: false,
    bookings: [],
  };

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchBookings();
  }

  fetchBookings = () => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
          query {
              bookings {
                  id
                  createdAt
                  event {
                      id
                      title
                      startDate
                      endDate
                      creator {
                        email
                      }

                  }
              }
          }
          `,
    };

    // https://www.baeldung.com/spring-cors
    fetch(graphqlURL, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.context.token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        if (!resData.data){
          return;
        }
        const bookings = resData.data.bookings.filter(booking => new Date(booking.event.startDate)>=new Date());

        this.setState({ bookings: bookings, isLoading: false });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };

  deleteBookingHandler = (event) => {
    this.setState({ isLoading: true });
    const bookingId = event.target.id;
    const requestBody = {
      query: `
          mutation CancelBooking($id: ID!) {
              cancelBooking(bookingId: $id) {
                  id
                  title
              }
          },
          `,
      variables: {
        id: bookingId,
      },
    };

    // https://www.baeldung.com/spring-cors
    fetch(graphqlURL, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.context.token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        this.setState((prevState) => {
          const updatedBookings = prevState.bookings.filter((booking) => {
            return booking.id !== bookingId;
          });
          return { bookings: updatedBookings, isLoading: false };
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };

  render() {
    return (
      <React.Fragment>
        {<ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <Toolbar sx={{ flexWrap: 'wrap' }}>
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            EasyBook
          </Typography>
          <NavLink to="/events" style={{ textDecoration: "none" }}>
            <IconButton>
              <Typography>Events</Typography>
            </IconButton>
          </NavLink>
          <NavLink  to="/auth" style={{ textDecoration: "none" }} >
            <IconButton onClick={this.context.logout}>
                <Typography>Logout</Typography>
            </IconButton>
          </NavLink>
        </Toolbar>
      </AppBar>
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Easy Book
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              Create your schedule, Join popular events, Easy and flexible
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <NavLink to="/events" style={{ textDecoration: "none" }}>
                <Button  variant="outlined" onClick={this.startCreateEventHandler}>Start Booking</Button>
              </NavLink>
             
            </Stack>
          </Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md">
          {/* End hero unit */}
          <Grid container spacing={4}>
            {this.state.bookings.map((booking) => {
              const event = booking.event;
              console.log(event)
              return (
              <Grid item key={booking.id} xs={12} sm={6} md={4}>
                <Card
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      pt: '10%',  
                    }}
                    image="https://source.unsplash.com/random"
                    alt="random"
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {event.title}
                    </Typography>
                    <Typography>
                      Start : {new Date(event.startDate).toLocaleString()}
                    </Typography>
                    <Typography>
                      End : {new Date(event.endDate).toLocaleString()}
                    </Typography>
                    <Typography>
                      Creator : {event.creator.email}
                    </Typography>
                  </CardContent>
                  <CardActions>
                     <Button id={booking.id} size="small" onClick={this.deleteBookingHandler}>Delete</Button> 
                  </CardActions>
                </Card>
              </Grid>
              )}
            )}
          </Grid>
        </Container>
      </main>
      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">

        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
         
        </Typography>
        <Copyright />
      </Box>
      {/* End footer */}
    </ThemeProvider>}
      </React.Fragment>
    );
  }
}

export default BookingsPage;
