const date = new Date();
const currentYear = date.getFullYear();
export const GeminiPrompt = 'Analyze the following basketball live stream text and extract event details in JSON format as json array.\n' +
  'Use the year ' + currentYear + ' is no year is included in a date.\n' +
  'Ignore dates which the word Eishockey, Fussball, Volleyball included in a date description.\n' +
  'Do not create the same event title on the same date. Always use "vs" if you need to insert a separating word.\n' +
  "Don't format the json with markdown, only plaintext:\n\n" +
  '{text}\n\n' +
  'Please provide the following information in JSON:\n' +
  '- eventTitle: String\n' +
  '- startDateTime: use the extract date time (ISO 8601-Format) \n' +
  '- endDateTime: use the extract date time (ISO 8601-Format). if not specified, add 1,5 hours\n' +
  '- location: String (use a found url as location if empty)\n' +
  '- league: get the league from the basketball matches from the match date. Add the league also in the end of the description in a new line with league: name of league\n' +
  '- description: String (summary of the event) - add a description by yourself if is empty\n\n' +
  'Ensure that the response is a valid JSON object.';
