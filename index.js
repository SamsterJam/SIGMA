const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const app = express();
const port = 8001;
const domain = "127.0.0.1";
const databaseName = "TEST-LIGMA"
const eventCreationPassword = "badpassword"

const mongoose = require('mongoose');



mongoose.connect(`mongodb://localhost:27017/${databaseName}`);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

const eventSchema = new mongoose.Schema({
    eventId: String,
    organizerName: String,
    email: String,
    eventName: String,
    description: String,
    eventDateTime: String,
    locationVerification: Boolean,
    latitude: String,
    longitude: String,
});

const attendanceSchema = new mongoose.Schema({
    studentName: String,
    studentEmail: String,
    eventId: String,
    latitude: String,
    longitude: String,
    submittedAt: { type: Date, default: Date.now } 
});

const Event = mongoose.model('Event', eventSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Event creation form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'event-creation.html'));
});

// Event creation form submission
app.post('/create-event', async (req, res, next) => {
    try {
        if (req.body.password !== eventCreationPassword) {
            // If the password is incorrect, send an alert to the client
            return res.send(`<script>alert('Incorrect password!'); history.back();</script>`);
        }
        const eventId = uuidv4(); // Generate a unique event ID
        const eventUrl = `http://${domain}:${port}/event/${eventId}`;

        // Log the event data to the console, including the UUID
        console.log('Event Data:', {
            eventId: eventId,
            ...req.body
        });

        // Create a new event object
        const newEvent = new Event({
            eventId: eventId,
            organizerName: req.body.organizerName,
            email: req.body.email,
            eventName: req.body.eventName,
            description: req.body.description,
            eventDateTime: req.body.eventDateTime,
            locationVerification: req.body.locationVerification === 'on',
            latitude: req.body.latitude,
            longitude: req.body.longitude,
        });

        // Save the event to the database
        await newEvent.save();

        // Generate a QR code for the event
        QRCode.toDataURL(eventUrl, (err, qrCodeDataUrl) => {
            if (err) {
                throw err; // Pass the error to the error handling middleware
            }

            // Store the event URL and QR code data URL in the session storage
            const script = `
                <script>
                sessionStorage.setItem('eventUrl', '${eventUrl}');
                sessionStorage.setItem('qrCodeDataUrl', '${qrCodeDataUrl}');
                location.href = '/event-created';
                </script>
            `;

            // Send the script to the client to execute
            res.send(script);
        });
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
});

// Event login page
app.get('/event/:eventId', async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const event = await Event.findOne({ eventId: eventId });

        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Serve the event login HTML page with embedded event data
        res.sendFile(path.join(__dirname, 'views', 'event-login.html'), {
            headers: {
                'Content-Type': 'text/html'
            }
        });
    } catch (error) {
        next(error);
    }
});

// API route to get event data
app.get('/api/event/:eventId', async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const event = await Event.findOne({ eventId: eventId });

        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Send the event data as JSON
        res.json({
            eventId: event.eventId,
            locationVerification: event.locationVerification,
            // Include any other event properties you need on the client-side
        });
    } catch (error) {
        next(error);
    }
});

// Attendance submission
app.post('/submit-attendance', async (req, res, next) => {
    try {
        // Create a new attendance object
        const newAttendance = new Attendance({
            studentName: req.body.studentName,
            studentEmail: req.body.studentEmail,
            eventId: req.body.eventId,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
        });

        // Save the attendance to the database
        await newAttendance.save();

        // Log the attendance data to the console, including the submission time
        console.log('Attendance Data:', {
            ...newAttendance.toObject(),
            latitude: newAttendance.latitude || 'Not provided',
            longitude: newAttendance.longitude || 'Not provided'
        });

        // Serve Attendance Submitted Page
        res.sendFile(path.join(__dirname, 'views', 'attendance-submitted.html'));
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
});

app.get('/event-created', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'event-created.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack to the console
    res.status(500).sendFile(path.join(__dirname, 'views', 'error.html')); // Send the error page
});

// Listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




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











// Custom 404 page middleware
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});