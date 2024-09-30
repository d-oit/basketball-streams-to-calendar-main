import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import moment from 'moment-timezone';
import { useEffect, useState } from 'react';

const CALENDAR_ID = process.env.REACT_APP_GOOGLE_CALENDAR_ID || localStorage.getItem("REACT_APP_GOOGLE_CALENDAR_ID");
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export const CalendarApiComponent = () => {
  const [accessToken, setAccessToken] = useState(null);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
    },
    onError: (error) => console.error('Login Failed:', error),
    scope: SCOPES.join(' '),
    flow: 'implicit',
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.userAgent) {
      if (!accessToken) {
        login();
      }
    }
  }, [accessToken, login]);

  const getAuthenticatedAxios = () => {
    if (!accessToken) {
      throw new Error("Not authenticated. Please wait for authentication to complete.");
    }
    return axios.create({
      baseURL: 'https://www.googleapis.com/calendar/v3',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  };

  const checkEventExists = async (event) => {
    const api = getAuthenticatedAxios();
    const startDateTime = moment.tz(event.startDateTime, "Europe/Berlin").utc().format();
    const endDateTime = moment.tz(event.endDateTime, "Europe/Berlin").utc().format();

    try {
      const response = await api.get(`/calendars/${CALENDAR_ID}/events`, {
        params: {
          timeMin: startDateTime,
          timeMax: endDateTime,
          singleEvents: true,
          orderBy: "startTime",
        },
      });

      const events = response.data.items;
      return events.some((existingEvent) => {
        const existingStartDate = new Date(existingEvent.start.dateTime).toDateString();
        const existingEndDate = new Date(existingEvent.end.dateTime).toDateString();
        const startDate = new Date(startDateTime).toDateString();
        const endDate = new Date(endDateTime).toDateString();
        
        event.eventId = existingEvent.id;
        return (
          existingEvent.summary === event.eventTitle &&
          existingStartDate === startDate &&
          existingEndDate === endDate
        );
      });
    } catch (error) {
      console.error("Error checking if event exists:", error);
      throw error;
    }
  };

  const deleteEventExists = async (event) => {
    const api = getAuthenticatedAxios();
    const startDateTime = moment.tz(event.startDateTime, "Europe/Berlin").utc().format();
    const endDateTime = moment.tz(event.endDateTime, "Europe/Berlin").utc().format();
    const filterStartDateTime = moment.tz(event.startDateTime, "Europe/Berlin").add(-1, 'days').utc().format();
    const filterEndDateTime = moment.tz(event.endDateTime, "Europe/Berlin").add(1, 'days').utc().format();

    try {
      const response = await api.get(`/calendars/${CALENDAR_ID}/events`, {
        params: {
          timeMin: filterStartDateTime,
          timeMax: filterEndDateTime,
          singleEvents: true,
          orderBy: "startTime",
        },
      });

      const events = response.data.items;
      let deletedCount = 0;

      for (const existingEvent of events) {
        const existingStartDate = new Date(existingEvent.start.dateTime).toDateString();
        const existingEndDate = new Date(existingEvent.end.dateTime).toDateString();
        const startDate = new Date(startDateTime).toDateString();
        const endDate = new Date(endDateTime).toDateString();

        const eventExists =
          existingEvent.summary === event.eventTitle &&
          existingStartDate === startDate &&
          existingEndDate === endDate;

        if (eventExists) {
          await api.delete(`/calendars/${CALENDAR_ID}/events/${existingEvent.id}`);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error("Error deleting events:", error);
      throw error;
    }
  };

  const createEvents = async (events) => {
    const api = getAuthenticatedAxios();
    let insertedCount = 0;
    let deletedCounter = 0;

    for (const event of events) {
      try {
        const delCount = await deleteEventExists(event);
        deletedCounter += delCount;

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

        await api.post(`/calendars/${CALENDAR_ID}/events`, eventBody);
        insertedCount++;
      } catch (error) {
        console.error("Error creating event:", error);
        throw error;
      }
    }

    return { deleted: deletedCounter, inserted: insertedCount };
  };

  const createCalendarEvent = async (events) => {
    if (!CALENDAR_ID) {
      throw new Error("Google calendar calendar id is not set");
    }

    if (!accessToken) {
      await new Promise((resolve) => {
        const checkAuth = setInterval(() => {
          if (accessToken) {
            clearInterval(checkAuth);
            resolve();
          }
        }, 100);
      });
    }

    try {
      return await createEvents(events);
    } catch (error) {
      console.error("Error in createCalendarEvent:", error);
      if (error.response && error.response.data) {
        throw new Error(`Google Calendar API error: ${error.response.data.error.message}`);
      } else {
        throw error;
      }
    }
  };

  
  const signOut = () => {
    setAccessToken(null);
  };

  const isSignedIn = () => {
    return accessToken !== null;
  };

  return {
    createCalendarEvent, 
    signOut,
    isSignedIn,
    login
  };
};

