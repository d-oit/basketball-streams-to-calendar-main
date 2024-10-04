import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => process.env.REACT_APP_GEMINI_API_KEY || localStorage.getItem('REACT_APP_GEMINI_API_KEY');

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
  '- startDateTime: use the extract date time \n' +
  '- endDateTime: use the extract date time (if not specified, add 1,5 hours)\n' +
  '- location: String (use a found url as location if empty)\n' +
  '- league: get the league from the basketball matches from the match date. Add the league also in the end line of the description with league: name of league\n' +
  '- description: String (summary of the event) - add a description by yourself if is empty\n\n' +
  'Ensure that the response is a valid JSON object.';

export const analyzeWithGemini = async (text, customPrompt) => {
  try {
    const API_KEY = getApiKey();
    if (!API_KEY) {
      throw new Error('Gemini API key is not set');
    }
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = customPrompt ? customPrompt.replace('{text}', text) : GeminiPrompt.replace('{text}', text);


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    if (!responseText) {
      throw new Error('Gemini API returned an empty response');
    }
    
    let jsonData;
    try {
      jsonData = JSON.parse(responseText);
    } catch (parseError) {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          jsonData = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          console.error('Failed to parse extracted JSON:', jsonMatch[0]);
          throw new Error('Invalid JSON response from Gemini API');
        }
      } else {
        console.error('Failed to parse Gemini response as JSON:', responseText);
        throw new Error('Invalid JSON response from Gemini API');
      }
    }
    
    if (!Array.isArray(jsonData)) {
      jsonData = [jsonData];
    }
    
    return jsonData;
  } catch (error) {
    console.error('Error analyzing with Gemini:', error);
    throw error;
  }
};
