const path = require('path');
const root = require('../../index.js');
const express = require('express');
const router = express.Router();
const dbInterface = require(path.join(root.MODEL_DIR, 'dbInterface.js'));
const db = new dbInterface();

router.post('/', async (req, res, next) => {
    try {
        const { studentName, studentEmail, eventId, latitude, longitude } = req.body;

        // Find the event to get its location and radius
        const event = await db.getEvent(eventId);
        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Check if location verification is required
        if (event.location_Veri) {
            const distance = calculateApproximateDistance(
                event.latitude,
                event.longitude,
                latitude,
                longitude
            );

            if (distance > event.radius) {
                return res.status(400).send('You are not within the required radius of the event location.');
            }
        }

        let d = new Date();
        let time = d.getTime();//gets time in unix millis
        //save attendance to database
        let arr = [studentName, studentEmail, eventId, time,  major, cohort];
        const newAttendance = await db.submitAttendance(arr);

        console.log('Attendance Data:', arr.concat([latitude, longitude]));

        res.render('attendance-submitted');
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
});

//wip
function calculateApproximateDistance(lat1, lon1, lat2, lon2) {
    const toRadians = degree => degree * Math.PI / 180;

    const R = 6371000;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in meters
    const distance = R * c;

    return distance;
}
module.exports = router;

