import { GoogleOAuthProvider } from '@react-oauth/google';
import { CalendarApiComponent } from '@/utils/calendarApi';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || localStorage.getItem("REACT_APP_GOOGLE_CLIENT_ID");

export const CalendarApiProvider = (props) => {
  if (!CLIENT_ID) {
    console.error("Google Client ID is missing");
    return null;
  }

  return (
  <GoogleOAuthProvider clientId={ CLIENT_ID }>
    <CalendarApiComponent {...props} />
  </GoogleOAuthProvider>
  );

// export const CalendarApiProvider = ({ children }) => {
//   if (!CLIENT_ID) {
//     console.error("Google Client ID is missing");
//     return null;
//   }

  // return (
  //   <GoogleOAuthProvider clientId={CLIENT_ID}>
  //     {children}
  //   </GoogleOAuthProvider>
  // );
};