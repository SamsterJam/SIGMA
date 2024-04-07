const path = require('path');
const root = require('../../../index.js');
const express = require('express');
const router = express.Router();

const dbInterface = require(path.join(root.MODEL_DIR, 'dbInterface.js'));
const db = new dbInterface();


router.get('/event/:eventId', async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const event = await db.getEvent(eventId);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Send the event data as JSON
        res.json({
            eventId: event.rows[0].event_id,
            locationVerification: event.rows[0].location_veri
        });
    } catch (error) {
        next(error);
    }
});

router.get('/event_data/:eventId', async (req, res, next) => {
    try {
        //checks if event exists. Here so you can see if your entering the eventId wrong
        const eventId = req.params.eventId;
        const event = await db.getEvent(eventId);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        const pass = req.query.pass;
        const data = await db.getEventData(eventId, pass);
        res.json({...data});
    } catch (error) {
        next(error);
    }
});

router.get('/name_taken', async (req, res, next) => {
    try {
        const eventName = req.query.name;
        const bool = await db.nameExists(eventName);

        res.json({
            isTaken: bool
        });
    } catch(error) {
        next(error);
    }
});


module.exports = router;
