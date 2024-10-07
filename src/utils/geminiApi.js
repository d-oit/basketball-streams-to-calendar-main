import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiPrompt } from "./GeminiPrompt";

const getApiKey = () => process.env.REACT_APP_GEMINI_API_KEY || localStorage.getItem('REACT_APP_GEMINI_API_KEY');

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
