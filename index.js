const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

//paths
const VIEWS_DIR = path.join(__dirname, 'app/views');
const CONTROLLERS_DIR = path.join(__dirname, 'app/controllers');
const MODEL_DIR = path.join(__dirname, 'app/model');
const ROOT_DIR = __dirname;
//can add a static dir and more
//

const app = express();
const port = 8001;
const domain = "127.0.0.1";

//contains globals

//can add configuration varibles


module.exports = { VIEWS_DIR, CONTROLLERS_DIR, MODEL_DIR, ROOT_DIR, port, domain};
//add more when you think of it

//view engine / ejs stuff

app.set('views', VIEWS_DIR);
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error');
});

// Listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

//after moving everything around router was small enough to be moved here

//event creation form
app.get('/', (req, res) => {
    res.render('event-creation');
});

const events = require(path.join(CONTROLLERS_DIR, 'event.js'));

//event login page
app.use('/event', events);


const createEvent = require(path.join(CONTROLLERS_DIR, 'create-event.js'));
// Event creation form submission
app.use('/create-event', createEvent);

const api_event = require(path.join(CONTROLLERS_DIR, 'api/event.js'));
// API route to get event data
app.use('/api/event', api_event);


const submit_attendence = require(path.join(CONTROLLERS_DIR, 'submit-attendance.js'));
// Attendance submission
app.use('/submit-attendance', submit_attendence);


// Custom 404 page middleware
app.use((req, res, next) => {
    res.status(404).render('404');
});

//intentionally kept here to make it more noticiable

// ### ==== DEBUG - REMOVE BEFORE PUBLISHING === ### \\\

// Route to list all events with their attending students
app.get('/events-with-attendees', async (req, res, next) => {
    try {
        // Find all events
        const events = await Event.find();

        // For each event, find the corresponding attendance records
        const eventsWithAttendees = await Promise.all(events.map(async (event) => {
            const attendees = await Attendance.find({ eventId: event.eventId });
            return {
                ...event.toObject(),
                attendees: attendees.map(attendee => ({
                    studentName: attendee.studentName,
                    studentEmail: attendee.studentEmail,
                    submittedAt: attendee.submittedAt,
                    latitude: attendee.latitude,
                    longitude: attendee.longitude,
                }))
            };
        }));

        // Send the result back to the client
        res.json(eventsWithAttendees);
    } catch (error) {
        next(error);
    }
});

