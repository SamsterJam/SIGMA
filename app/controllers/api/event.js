const path = require('path');
const root = require('../../../index.js');
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

        // Send the event data as JSON
        res.json({
            eventId: event.event_id,
            locationVerification: event.location_Veri,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
