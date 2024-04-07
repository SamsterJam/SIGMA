//import { Client } from 'pg';
const pg = require('pg');
//migth move above to different file
class dbInterface {
    #client;

    constructor() {
        this.client = new pg.Client({
            database: 'ligmadb',
            port: 5432,
            username: 'alexsmith'//change in future
        });//add more details when there available
        this.client.connect(function(err) {
        if (err) throw err;
            else console.log("dbInterface initilized\n");
        });
        //add in code to handle connection error
    }

    //data will be stored in the rows field of return value
    //example: const event = this.getEvent(eventId); let eventName = event.rows[0].event_name
    getEvent(eventID) {
        return this.client.query({
            text: "SELECT * FROM events WHERE event_id = $1;",
            values: [eventID]
        });
    }

    async nameExists(eventName) {
        const res = await this.client.query({
            text: "SELECT event_name FROM events WHERE event_name = $1",
            values: [eventName]
        });
        return (res.rowCount > 0);
    }

    submitAttendance(array) {
        var text;
        switch (array.length) {
            case 7:
                text = "INSERT INTO attended (user_name, email, event_id, time, major, cohort, year) VALUES ( $1, $2, $3, $4, $5, $6, $7);"
                return this.client.query(text, array);
            case 4:
                text = "INSERT INTO attended (user_name, email, event_id, time) VALUES ( $1, $2, $3, $4);"
                return this.client.query(text, array);
            default:
                throw new Error("invalid array passed to submitAttendance.");
        }
    }

    getEventData(eventID, password) {
        return this.client.query({
            rowMode: 'array',
            text: "SELECT attended.user_name, attended.email, attended.event_id, attended.time, attended.major, attended.cohort FROM attended INNER JOIN events ON attended.event_id = events.event_id WHERE events.event_id = $1 AND events.event_pass = $2;",
            values: [eventID, password]
        });
    }

    addEvents(array) {
        //paramterization prevents injection. Query could still be malformed potentially creating an error.
        //depending on the error information could be revealed
        var text;
        switch (array.length) {
            case 12:
                text = "INSERT INTO events (org_name, org_email, event_id, event_name, req_mcy, event_desc, event_date, event_pass, location_Veri, latitude, longitude, radius) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);"
                return this.client.query(text, array);
            case 11:
                text = "INSERT INTO events (org_name, org_email, event_id, event_name, req_mcy, event_date, event_pass, location_Veri, latitude, longitude, radius) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);"
                //no desc
                return this.client.query(text, array);
            case 9:
                text = "INSERT INTO events (org_name, org_email, event_id, event_name, req_mcy, event_desc, event_date, event_pass, location_Veri) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);"
                //desc but no longitude
                return this.client.query(text, array);
            case 8:
                text = "INSERT INTO events (org_name, org_email, event_id, event_name, req_mcy, event_date, event_pass, location_Veri) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);"
                //no lonigitude or desc
                return this.client.query(text, array);
            default:
                throw new Error("invalid array passed to addEvents");
        }
    }
}
//check date format. html date format

module.exports = dbInterface;
//add more methods
//make sure its properly exporting
//
//const Event = mongoose.model('Event', eventSchema);
//const Attendance = mongoose.model('Attendance', attendanceSchema);



