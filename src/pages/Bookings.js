import React, { Component } from "react";

import AuthContext from "../context/auth-context";

import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import { NavLink } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
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
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

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
        const bookings = resData.data.bookings;
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
        {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
        {this.state.creating && (
          <Modal
            title="Add Event"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
            confirmText="Confirm"
          >
            <form>
              <TextField
                margin="normal"
                required
                fullWidth
                name="Title"
                label="Title"
                type="Title"
                id="Title"
                onChange={(e) => this.setState({titleInput:e.target.value})}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="Description"
                label="Description"
                type="Description"
                id="Description"
                onChange={(e) => this.setState({descriptionInput:e.target.value})}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Date"
                  margin="normal"
                  value={this.state.startDateInput}
                  fullWidth
                  required
                  onChange={(e) => this.setState({startDateInput:e})}
                  renderInput={(params) => <TextField {...params} />}
                />   
                <br/>
                <DateTimePicker
                  label="End Date"
                  margin="normal"
                  value={this.state.endDateInput}
                  fullWidth
                  required
                  onChange={(e) => this.setState({endDateInput:e})}
                  renderInput={(params) => <TextField {...params} />}
                /> 
              </LocalizationProvider>

              <TextField
                margin="normal"
                required
                fullWidth
                name="People Limit"
                label="People Limit"
                type="People Limit"
                id="People Limit"
                onChange={(e) => this.setState({pplLimitInput:e.target.value})}
              />
              
            </form>
          </Modal>
        )}
        {this.state.selectedEvent && (
          <Modal
            title={this.state.selectedEvent.title}
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.bookEventHandler}
            confirmText={this.context.token ? "Book" : "Confirm"}
          >
            <h1>{this.state.selectedEvent.title}</h1>
            <p>
              Start Time : {new Date(this.state.selectedEvent.startDate).toLocaleString()}
            </p>
            <p>
              End Time : {new Date(this.state.selectedEvent.endDate).toLocaleString()}
            </p>
            <p>Description : {this.state.selectedEvent.description}</p>
          </Modal>
        )}

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
              {/* <Button variant="contained">Main call to action</Button> */}
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
              console.log(event);

              return (
              <Grid item key={booking.id} xs={12} sm={6} md={4}>
                <Card
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      // 16:9
                      pt: '10%',  
                      // '56.25%'
                    }}
                    image="https://source.unsplash.com/random"
                    alt="random"
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {event.title}
                    </Typography>
                    {/* <Typography>
                      Description : {event.description}
                    </Typography> */}
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
                    
                   
                    {/* <Button size="small">Edit</Button> */}
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
    // return (
    //   <React.Fragment>
    //     {this.state.isLoading ? (
    //       <Spinner />
    //     ) : (
    //       <BookingList
    //         bookings={this.state.bookings}
    //         onDelete={this.deleteBookingHandler}
    //       />
    //     )}
    //   </React.Fragment>
    // );
  }
}

export default BookingsPage;
