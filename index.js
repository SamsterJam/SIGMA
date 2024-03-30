// Imports
const express = require('express');
const path = require('path');
const app = express();
const port = 8001;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file when the root route is requested
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'event-creation.html'));
});

// Listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
