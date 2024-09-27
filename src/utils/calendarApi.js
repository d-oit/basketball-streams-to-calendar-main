import { gapi } from "gapi-script";
import moment from "moment-timezone";

const CALENDAR_ID = () =>
  process.env.REACT_APP_GOOGLE_CALENDAR_ID ||
  localStorage.getItem("REACT_APP_GOOGLE_CALENDAR_ID");
const CLIENT_ID = () =>
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  localStorage.getItem("REACT_APP_GOOGLE_CLIENT_ID");
const API_KEY = () =>
  process.env.REACT_APP_GOOGLE_API_KEY ||
  localStorage.getItem("REACT_APP_GOOGLE_API_KEY");

const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const initClient = () => {
  return new Promise((resolve, reject) => {
    gapi.load("client:auth2", () => {
      gapi.client.init({
        //apiKey: API_KEY(),
        clientId: CLIENT_ID(),
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        ],
        scope: SCOPES,
      }).then(() => {
        resolve(gapi);
      }).catch(error => {
        console.error("Error initializing GAPI client:", error);
        reject(error);
      });
    });
  });
};


const checkEventExists = async (event) => {
  const startDateTime = moment
    .tz(event.startDateTime, "Europe/Berlin")
    .utc()
    .format();
  const endDateTime = moment
    .tz(event.endDateTime, "Europe/Berlin")
    .utc()
    .format();

  const response = await gapi.client.calendar.events.list({
    calendarId: CALENDAR_ID(),
    timeMin: startDateTime,
    timeMax: endDateTime,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = response.result.items;
  return events.some((existingEvent) => {
    const existingStartDate = new Date(
      existingEvent.start.dateTime
    ).toDateString();
    const existingEndDate = new Date(existingEvent.end.dateTime).toDateString();
    const startDate = new Date(startDateTime).toDateString();
    const endDate = new Date(endDateTime).toDateString();
    console.log("existingEvent: " + existingEvent);
    // add event id to ref object
    event.eventId = existingEvent.id;
    return (
      existingEvent.summary === event.eventTitle &&
      existingStartDate === startDate &&
      existingEndDate === endDate
    );
  });
};

const deleteEventExists = async (event) => {
  
  const startDateTime = moment
    .tz(event.startDateTime, "Europe/Berlin")
    .utc()
    .format();
  const endDateTime = moment
    .tz(event.endDateTime, "Europe/Berlin")
    .utc()
    .format();

    const filterStartDateTime = moment
    .tz(event.startDateTime, "Europe/Berlin").add(-1, 'days')
    .utc()
    .format();
  const filterEndDateTime = moment
    .tz(event.endDateTime, "Europe/Berlin").add(1, 'days')
    .utc()
    .format();

    console.log('deleteEventExists, check startdate: ' + startDateTime);
    console.log('deleteEventExists, check endDateTime: ' + endDateTime);

  const response = await gapi.client.calendar.events.list({
    calendarId: CALENDAR_ID(),
    timeMin: filterStartDateTime,
    timeMax: filterEndDateTime,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = response.result.items;
  let deletedCount = 0;
  await Promise.all(
    events.map(async (existingEvent) => {
      const existingStartDate = new Date(
        existingEvent.start.dateTime
      ).toDateString();
      const existingEndDate = new Date(
        existingEvent.end.dateTime
      ).toDateString();
      const startDate = new Date(startDateTime).toDateString();
      const endDate = new Date(endDateTime).toDateString();

      const eventExists =
        existingEvent.summary === event.eventTitle &&
        existingStartDate === startDate &&
        existingEndDate === endDate;

        console.log("existingEvent:", existingEvent);
        console.log("deleteEventExists - deletedCount:" + deletedCount);
      if (eventExists) {
        console.log("Event already exists:", event);
        console.log("Remove event Id:", existingEvent.id);
        await gapi.client.calendar.events
          .delete({
            calendarId: CALENDAR_ID(),
            eventId: existingEvent.id,
          })
          .then((response) => {
            console.log("Event deleted:", response);
            deletedCount++;
          })
          .catch((error) => {
            console.error("Error deleting event:", error);
          });
      }
    })
  );
  return deletedCount;
};

const createEvents = async (events) => {


  let insertedCount = 0;
  let deletedCounter = 0;

  await Promise.all(
    events.map(async (event) => {
      console.log("event", event);  
      if(event.startDateTime == undefined)  {
        console.log("startDateTime == undefined");
      }
    
      // delete existing events
      let delCount = await deleteEventExists(event);

      deletedCounter = deletedCounter + delCount;
      console.log("deletedCounter:" + deletedCounter);
      const eventBody = {
        summary: event.eventTitle,
        location: event.location,
        description: event.description,
        start: {
          dateTime: moment.tz(event.startDateTime, "Europe/Berlin").format(),
          timeZone: "Europe/Berlin",
        },
        end: {
          dateTime: moment.tz(event.endDateTime, "Europe/Berlin").format(),
          timeZone: "Europe/Berlin",
        },
      };

      await gapi.client.calendar.events
        .insert({
          calendarId: CALENDAR_ID(),
          resource: eventBody,
        })
        .then((response) => {
          console.log("Event created: ", response);
          insertedCount++;
          return response;
        })
        .catch((error) => {
          console.error("Error creating event: ", error);
          throw error;
        });
    })
  );


  return ({ deleted: deletedCounter, inserted: insertedCount});
};

export const createCalendarEvent = async (events) => {
  if (!API_KEY()) {
    throw new Error("Google calendar API key is not set");
  }

  if (!CLIENT_ID()) {
    throw new Error("Google calendar client id is not set");
  }

  if (!CALENDAR_ID()) {
    throw new Error("Google calendar calendar id is not set");
  }

  try {
    return await initClient()
     .then(() => createEvents(events))
    } catch (error) {
    console.error("Error in createCalendarEvent:", error);
    if (error.result && error.result.error) {
      throw new Error(
        `Google Calendar API error: ${error.result.error.message}`
      );
    } else {
      throw error;
    }
  }


};

export const signIn = () => {
  return gapi.auth2.getAuthInstance().signIn();
};

export const signOut = () => {
  return gapi.auth2.getAuthInstance().signOut();
};

export const isSignedIn = () => {
  return gapi.auth2.getAuthInstance().isSignedIn.get();
};