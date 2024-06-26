const path = require('path');
const dbInterface = require('../model/dbInterface.js');
const db = new dbInterface();

exports.handleFormSubmission = async (req, res, next) => {
    try {
        const { eventName, password } = req.body;
        const event = await db.getEventByName(eventName);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        const isPasswordCorrect = await db.verifyEventPassword(event.event_id, password);
        if (!isPasswordCorrect) {
            return res.status(401).send('Password Incorrect');
        }

        const eventData = await db.getEventData(event.event_id, password);
        console.log(eventData);
        res.render('event-data', { data: eventData, eventName: eventName }); // Include the event name
    } catch (error) {
        next(error);
    }
};