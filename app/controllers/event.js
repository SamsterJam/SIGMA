const path = require('path');
const root = require('../../index.js');
const express = require('express');
const router = express.Router();

const dbInterface = require(path.join(root.MODEL_DIR, 'dbInterface.js'));
const db = new dbInterface();

router.get('/:eventId', async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const event = await db.getEvent(eventId);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Serve the event login HTML page with embedded event data
        res.render('event-login', {
            eventID: eventId,
            extraInfo: event.req_mcy
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

