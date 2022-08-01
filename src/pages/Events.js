import React, { Component } from "react";

import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import AuthContext from "../context/auth-context";
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


class EventsPage extends Component {
  state = {
    creating: false,
    events: [],
    isLoading: false,
    selectedEvent: null,
    titleInput: null,
    startDateInput: null,
    endDateInput:null,
    descriptionInput: null, 
    pplLimitInput: null,
  };

  isActive = true;

  static contextType = AuthContext;


  componentDidMount() {
    this.fetchEvents();
  }

  startCreateEventHandler = () => {
    this.setState({ creating: true });
  };

  modalConfirmHandler = () => {
    this.setState({ creating: false });
    const {titleInput, descriptionInput, pplLimitInput} = this.state;
    const startDateInput = this.state.startDateInput.getTime();
    const endDateInput = this.state.endDateInput.getTime();
    const curTime = new Date();
    
    // console.log( startDateInput <= curTime, )
    if (
      titleInput.trim().length === 0 ||
      startDateInput <= curTime||
      startDateInput >=  endDateInput||
      descriptionInput.trim().length === 0 || 
      pplLimitInput.trim().length === 0
    ) {
      return;
    }

    const startDate = new Date(startDateInput).toISOString();
    const endDate = new Date(endDateInput).toISOString();
    // console.log(pplLimitInput, typeof(pplLimitInput));
    const requestBody = {
      query: `
        mutation CreateEvent($title: String!, $desc: String!, $startDate: String!, $endDate: String!, $pplLimit: Int! ) {
            createEvent(eventInput: {title: $title, description: $desc, startDate: $startDate, endDate: $endDate, pplLimit: $pplLimit}) {
                id
                title
                description
                startDate
                endDate
                pplLimit
            }
        }
        `,
      variables: {
        title: titleInput,
        desc: descriptionInput,
        startDate: startDate,
        endDate: endDate,
        pplLimit: pplLimitInput,
      },
    };

    const token = this.context.token;
    console.log(token)

    // https://www.baeldung.com/spring-cors
    fetch(graphqlURL, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
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
          const updatedEvents = [...prevState.events];
          updatedEvents.push({
            id: resData.data.createEvent.id,
            title: resData.data.createEvent.title,
            description: resData.data.createEvent.description,
            startDate: resData.data.createEvent.startDate,
            endDate: resData.data.createEvent.endDate,
            creator: {
              id: this.context.userId,
            },
          });
          return { events: updatedEvents };
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  modalCancelHandler = () => {
    this.setState({ creating: false, selectedEvent: null });
  };

  fetchEvents() {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
        query {
            events {
                id
                title
                description
                startDate
                endDate
                pplLimit
                pplCount
                creator {
                  id
                  email
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
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        const events = resData.data.events;
        if (this.isActive) {
          this.setState({ events: events, isLoading: false });
        }
      })
      .catch((err) => {
        // console.log(err);
        if (this.isActive) {
          this.setState({ isLoading: false });
        }
      });
  }

  showDetailHandler = (event) => {
    this.setState((prevState) => {
      // console.log(event.target.id);
      const selectedEvent = prevState.events.find((e) => e.id === event.target.id);
      return { selectedEvent: selectedEvent };
    });
  };

  deleteEventHandler = (event) => {
    this.setState({ isLoading: true });
    const eventId = event.target.id;
    const requestBody = {
      query: `
          mutation DeleteEvent($id: ID!) {
              deleteEvent(eventId: $id) {
                  id
              }
          },
          `,
      variables: {
        id: eventId,
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
          const updatedEvents = prevState.events.filter((event) => {
            return event.id !== eventId;
          });
          return { events: updatedEvents, isLoading: false };
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };

  bookEventHandler = () => {
    if (!this.context.token) {
      this.setState({ selectedEvent: null });
      return;
    }
    const requestBody = {
      query: `
        mutation BookEvent($id: ID!) {
          bookEvent(eventId: $id) {
              id
              createdAt
              updatedAt
          }
        }
        `,
      variables: {
        id: this.state.selectedEvent.id.toString(),
      },
    };

    console.log('here',this.state.selectedEvent.id);
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
        this.setState({ selectedEvent: null });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  componentWillUnmount() {
    this.isActive = false;
  }

  render() {
    return (
      <React.Fragment>
        {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
        {this.state.creating && (
          <Modal
            title="Create Your Event"
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
          
          <NavLink to="/bookings" style={{ textDecoration: "none" }}>
            <IconButton>
              <Typography>Bookings</Typography>
            </IconButton>
          </NavLink>
          <NavLink to="/auth" style={{ textDecoration: "none" }}>
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
              <Button variant="outlined" onClick={this.startCreateEventHandler}>Create</Button>
            </Stack>
          </Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md">
          {/* End hero unit */}
          <Grid container spacing={4}>
            {this.state.events.map((event) => {
              return (
              <Grid item key={event.id} xs={12} sm={6} md={4}>
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
                    <Typography>
                      Creator : {this.context.userId===event.creator.id? <p>You are the creator</p> : event.creator.email}
                    </Typography>
                    <Typography>
                      Start : {new Date(event.startDate).toLocaleString()}
                    </Typography>
                    <Typography>
                      End : {new Date(event.endDate).toLocaleString()}
                    </Typography>
                    <Typography>
                      Member Status : {event.pplCount}/{event.pplLimit} 
                    </Typography>
  

                  </CardContent>
                  <CardActions>
                    {this.context.userId===event.creator.id ?
                      <Button id={event.id} size="small" onClick={this.deleteEventHandler}>Delete</Button> : 
                     <Button id={event.id} size="small" onClick={this.showDetailHandler}>View</Button> }
                    
                   
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
  }
}

export default EventsPage;
