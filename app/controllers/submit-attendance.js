const path = require('path');
const root = require('../../index.js');
const express = require('express');
const router = express.Router();
const dbInterface = require(path.join(root.MODEL_DIR, 'dbInterface.js'));
const db = new dbInterface();

router.post('/', async (req, res, next) => {
    try {
        const event = await db.getEvent(req.body.eventId);
        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Check if location verification is required
        if (event.rows[0].location_veri) {
            const distance = calculateApproximateDistance(
                event.rows[0].latitude,
                event.rows[0].longitude,
                req.body.latitude,
                req.body.longitude
            );

            if (distance > event.rows[0].radius) {
                return res.status(400).render('location-failed', { event: event.rows[0] });
            }
        }

        let time = getTimeStamp();
        //gets timeStamp

        let tempArr = [];
        if (event.rows[0].req_mcy) {
            tempArr = [req.body.major, req.body.cohort, req.body.year];
            console.log(tempArr);
        }
        let arr = [req.body.studentName, req.body.studentEmail, req.body.eventId, time];
        arr = arr.concat(tempArr);
        //
        //save attendance to database
        const newAttendance = await db.submitAttendance(arr);

        console.log('Attendance Data:', arr.concat([req.body.latitude, req.body.longitude]));

        res.render('attendance-submitted');
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
});

//returns current time in yyyy-mm-ddThh:mm format
function getTimeStamp() {
    let date = new Date();
    let str = String(date.getFullYear());
    str += "-" + makePadded(date.getMonth() + 1, 2); // Month is 0-indexed, add 1
    str += "-" + makePadded(date.getDate(), 2); // Use getDate() instead of getDay()
    str += "T" + makePadded(date.getHours(), 2);
    str += ":" + makePadded(date.getMinutes(), 2);
    return str;
}

//padd string e.g. makePadded(1, 2) = "01"
function makePadded(num, padCount) {
    let numLen = String(num).length;
    let ret = String(num);
    for (let i = 0; i < (padCount - numLen); i++) {
        ret = "0" + ret;
    }
    return ret;
}


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

