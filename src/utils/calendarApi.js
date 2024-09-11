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
    gapi.load("client:auth2", async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY(),
          clientId: CLIENT_ID(),
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
          ],
          scope: SCOPES,
        });

        if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
          await gapi.auth2.getAuthInstance().signIn({ prompt: "consent" });
        }

        console.log("Signed in successfully");
        resolve();
      } catch (error) {
        console.error("Error initializing GAPI client:", error);
        reject(error);
      }
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

  const response = await gapi.client.calendar.events.list({
    calendarId: CALENDAR_ID(),
    timeMin: startDateTime,
    timeMax: endDateTime,
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

        console.log("deletedCount:" + deletedCount);
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
      
      let delCount = await deleteEventExists(event);
      deletedCounter = deletedCounter + delCount;
      console.log("deletedCounter:" + deletedCounter);
      const eventBody = {
        summary: event.eventTitle,
        location: event.location,
        description: event.description,
        start: {
          dateTime: moment
            .tz(event.startDateTime, "Europe/Berlin")
            .utc()
            .format(),
          timeZone: "Europe/Berlin",
        },
        end: {
          dateTime: moment
            .tz(event.endDateTime, "Europe/Berlin")
            .utc()
            .format(),
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
    await initClient();
    return await createEvents(events);
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
