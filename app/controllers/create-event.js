const path = require('path');
const root = require('../../index.js');
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const dbInterface = require(path.join(root.MODEL_DIR, 'dbInterface.js'));
const db = new dbInterface();

router.post('/', async (req, res, next) => {
    try {
        const eventId = uuidv4(); // Generate a unique event ID
        const eventUrl = `http://${root.domain}:${root.port}/event/${eventId}`;

        // Log the event data to the console, including the UUID
        console.log('Event Data:', {
            eventId: eventId,
            ...req.body
        });

        let arr = [req.body.organizerName, req.body.email, eventId, req.body.eventName, req.body.extra_info];
        if ( req.body.description ) arr = arr.concat([req.body.description]);
        arr = arr.concat([req.body.eventDateTime, req.body.password, req.body.locationVerification === 'on']);

        if ( req.body.locationVerification === 'on' ) arr = arr.concat([req.body.latitude, req.body.longitude, req.body.radius]);

        // Create a new event object
        const newEvent = await db.addEvents(arr);

        // Generate a QR code for the event
        QRCode.toDataURL(eventUrl, (err, qrCodeDataUrl) => {
            if (err) {
                throw err; // Pass the error to the error handling middleware
            }

            res.render('event-created', {
                eventUrl: eventUrl,
                qrCodeDataUrl: qrCodeDataUrl
            });
            //make sure workds
        });
    } catch (error) {
        next(error);
    }
});
module.exports = router;

