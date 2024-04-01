const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const app = express();
const port = 8001;
const domain = "127.0.0.1";

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Event creation form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'event-creation.html'));
});

// Event creation form submission
app.post('/create-event', (req, res, next) => {
    try {
        const eventId = uuidv4(); // Generate a unique event ID
        const eventUrl = `http://${domain}:${port}/event/${eventId}`;

        // Log the event data to the console, including the UUID
        console.log('Event Data:', {
            eventId: eventId,
            ...req.body
        });

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
app.get('/event/:eventId', (req, res) => {
    // The :eventId parameter will be available as req.params.eventId
    const eventId = req.params.eventId;

    // Here you would normally fetch event data using eventId, but for now, we'll just serve the page
    res.sendFile(path.join(__dirname, 'views', 'event-login.html'));
});

// Attendance submission
app.post('/submit-attendance', (req, res) => {
    // Log the attendance data to the console
    console.log('Attendance Data:', req.body);

    // Serve Attendance Submitted Page
    res.sendFile(path.join(__dirname, 'views', 'attendance-submitted.html'));
});

app.get('/event-created', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'event-created.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack to the console
    res.status(500).sendFile(path.join(__dirname, 'views', 'error.html')); // Send the error page
});

// Listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});