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

const SCOPES = "https://www.googleapis.com/auth/calendar";

var errorMessage = "";

const initClient = () => {
  return new Promise((resolve, reject) => {
    window.gapi.load("client:auth2", () => {
      window.gapi.client
        .init({
          apiKey: API_KEY(),
          clientId: CLIENT_ID(),
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
          ],
          scope: SCOPES,
        })
        .then(() => {
          console.log(" window.gapi.client is successful");

          resolve(gapi);
        })
        .catch((error) => {
          console.error("Error initializing GAPI client:", error);
          errorMessage = error.message;
          reject(error);
        });
    });
  });
};

let cachedEvents = null;
let filterExistingCalStartDateTime = null;
let filterExistingCalEndDateTime = null;

async function getExistingEvents() {
  if (filterExistingCalStartDateTime === null) {
    console.log("getExistingEvents no filterExistingCalStartDateTime");
    return null;

    //throw new Error("filterExistingCalStartDateTime is null!");
  }

  if (!cachedEvents) {
    const response = await window.gapi.client.calendar.events.list({
      calendarId: CALENDAR_ID(),
      timeMin: filterExistingCalStartDateTime,
      timeMax: filterExistingCalEndDateTime,
      singleEvents: true,
      orderBy: "startTime",
    });
    cachedEvents = response.result.items;
  }
  return cachedEvents;
}

const checkEventExists = async (event) => {
  const startDateTime = moment
    .tz(event.startDateTime, "Europe/Berlin")
    .utc()
    .format();
  const endDateTime = moment
    .tz(event.endDateTime, "Europe/Berlin")
    .utc()
    .format();

  const response = await window.gapi.client.calendar.events.list({
    calendarId: CALENDAR_ID(),
    timeMin: startDateTime,
    timeMax: endDateTime,
    singleEvents: true,
    showDeleted: false,
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

function normalizeTitle(title) {
  return title.replace(/\bvs\.?\b/gi, 'vs').toLowerCase();
}

const deleteEventExists = async (event) => {
  const events = await getExistingEvents();
  let deletedCount = 0;
  if (events == null) {
    console.log("No existing events to delete.");
    return deletedCount;
  }
   
  const startDateTime = moment
    .tz(event.startDateTime, "Europe/Berlin")
    .format();
  const endDateTime = moment.tz(event.endDateTime, "Europe/Berlin").format();

  console.log("deleteEventExists, check startdate: " + startDateTime);
  console.log("deleteEventExists, check endDateTime: " + endDateTime);
 
  let i = 0;
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
      normalizeTitle(existingEvent.summary) === normalizeTitle(event.eventTitle) &&
        existingStartDate === startDate;
      
      i++;
      if ((i) % 10 === 0) {
        setTimeout(function() { console.log("waiting for 1 second - del"); }, 1000);
        refreshToken();
        i = 0;
      }
      console.log("existingEvent:", existingEvent);
      if (eventExists) {
        console.log("Event already exists:", event);
        console.log("Remove event Id:", existingEvent.id);
       
        await window.gapi.client.calendar.events
          .delete({
            calendarId: CALENDAR_ID(),
            eventId: existingEvent.id,
          })
          .then((response) => {
            console.log("Event deleted:", response);
            deletedCount++;
          })
          .catch((error) => {
            if (error && error.result.error.message !== null) {
              if (error.result.error.message === "Rate Limit Exceeded") {
                // Handle rate limit exceeded error
                console.log("Rate limit exceeded error, retry:", error);
                setTimeout(function() {
                  console.log('This message is delayed by 2 seconds');
                }, 2000); // 2000 milliseconds = 2 seconds
                refreshToken();
                window.gapi.client.calendar.events
                  .delete({
                    calendarId: CALENDAR_ID(),
                    eventId: existingEvent.id,
                  })
                  .then((response) => {
                    console.log("Event deleted:", response);
                    deletedCount++;
                  })
                  .catch((error) => {
                    console.error("Error 2x time deleting event:", error);
                    errorMessage = error.result.error.message;  
                  });
              } 
            } 
            console.error("Error deleting event:", error);
            errorMessage = error.result.error.message;
            throw error;
          });
      }
    })
  );
  return deletedCount;
};

const refreshToken = async () => {
  const authInstance = gapi.auth2.getAuthInstance();
  const user = authInstance.currentUser.get();
  const authResponse = user.getAuthResponse(true);

  if (authResponse.expires_in < 60) {
    const newAuthResponse = await user.reloadAuthResponse();
    console.log("New Auth Response:", newAuthResponse);
    localStorage.setItem("access_token", newAuthResponse.access_token);
  }
};

function getFirstAndLastEventTimesFromJson(eventsJson) {
  const events = eventsJson;
  if (events.length === 0) {
    return { firstStartDateTime: null, lastEndDateTime: null };
  }

  let firstStartDateTime = events[0].startDateTime;
  let lastEndDateTime = events[0].endDateTime;

  events.forEach(event => {
    const startDateTime = event.startDateTime;
    const endDateTime = event.endDateTime;

    if (new Date(startDateTime) < new Date(firstStartDateTime)) {
      firstStartDateTime = startDateTime;
    }
    if (new Date(endDateTime) > new Date(lastEndDateTime)) {
      lastEndDateTime = endDateTime;
    }
  });

  return { firstStartDateTime, lastEndDateTime };
}

const createEvents = async (events) => {
  let insertedCount = 0;
  let deletedCounter = 0;
  errorMessage = "";
  let i = 0;

  const { firstStartDateTime, lastEndDateTime } = getFirstAndLastEventTimesFromJson(events);
  console.log(`First event starts at: ${firstStartDateTime}`);
  console.log(`Last event ends at: ${lastEndDateTime}`);

  filterExistingCalStartDateTime = moment
    .tz(firstStartDateTime, "Europe/Berlin")
    .add(-1, "days")
    .format();
    filterExistingCalEndDateTime = moment
    .tz(lastEndDateTime, "Europe/Berlin")
    .add(1, "days")
    .format();

  await Promise.all(
    events.map(async (event) => {
      console.log("event", event);
      if (event.startDateTime == undefined) {
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
        guestsCanInviteOthers: false,
        guestsCanSeeOtherGuests: false
      };

      i++;
      if ((i) % 3 === 0) {
        setTimeout(function() { console.log("waiting for 1 second - insert"); }, 1000);
        refreshToken();
        i = 0;
      }
    

      await window.gapi.client.calendar.events
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
          errorMessage = errorMessage + "Error creating event: " + eventBody.summary + "\n";
          throw error;
        });
    })
  );

  return { deleted: deletedCounter, inserted: insertedCount, errorMessage: errorMessage };
};

export const createCalendarEvent = async (events) => {
  CheckApiValues();

  return await initClient().then(() => createEvents(events));
};

export const GooglesignIn = () => {
  CheckApiValues();
  window.gapi.auth2.getAuthInstance().signIn();
};

export const GooglesignOut = () => {
  gapi.auth2.getAuthInstance().signOut();
};

export const GoogleisSignedIn = async () => {
  CheckApiValues();
  await initClient();
  await refreshToken();
  console.log("google is signed in:");
  console.log(window.gapi.auth2.getAuthInstance().isSignedIn.get());
  return window.gapi.auth2.getAuthInstance().isSignedIn.get();
};

function CheckApiValues() {
  if (!API_KEY()) {
    throw new Error("Google calendar API key is not set");
  }

  if (!CLIENT_ID()) {
    throw new Error("Google calendar client id is not set");
  }

  if (!CALENDAR_ID()) {
    throw new Error("Google calendar calendar id is not set");
  }
}
