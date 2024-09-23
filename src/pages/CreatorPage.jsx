import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { analyzeWithGemini } from '../utils/geminiApi';
import { createCalendarEvent } from '../utils/calendarApi';
import { ExternalLink, HelpCircle, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import HelpDialog from './HelpDialog';

const sampleData = `20.09.24
19:15
ProA: VET-CONCEPT Gladiators Trier vs. Tigers Tübingen
VET-CONCEPT Gladiators Trier
VET-CONCEPT Gladiators Trier

Basketball
VET-CONCEPT Gladiators Trier
vs.
Tigers Tübingen
20.09.24
19:45
ProA: EPG GUARDIANS Koblenz vs. VfL SparkassenStars Bochum
EPG Guardians Koblenz
EPG Guardians Koblenz

Basketball
EPG Guardians Koblenz
vs.
VfL SparkassenStars Bochum
21.09.24
18:30
ProA: Phoenix Hagen vs. Science City Jena
Phoenix Hagen
Phoenix Hagen

Basketball
Phoenix Hagen
vs.
Science City Jena
21.09.24
18:45
ProA: Bozic Estriche Knights Kirchheim vs. GIESSEN 46ers
Bozic Estriche Knights Kirchheim
Bozic Estriche Knights Kirchheim

Basketball
Bozic Estriche Knights Kirchheim
vs.
GIESSEN 46ers
21.09.24
18:45
ProA: BBC Bayreuth vs. HAKRO Merlins Crailsheim`;

const defaultPrompt = `Analyze the following basketball live stream text and extract event details in JSON format as json array. Don't format the json with markdown, only plaintext:

{text}

Please provide the following information in JSON:
- eventTitle: String
- startDateTime: UTC
- endDateTime: UTC (if not specified, add 1,5 hours)
- location: String (if available)
- description: String (summary of the event)

Ensure that the response is a valid JSON object.`;

const CreatorPage = () => {
  const [liveStreamText, setLiveStreamText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [detailMessages, setDetailMessages] = useState([]);
  const [showOutputDetails, setShowOutputDetails] = useState(false);
  const [createdEventsCount, setCreatedEventsCount] = useState(0);
  const [deletedEventsCount, setDeletedEventsCount] = useState(0);
  const [customPrompt, setCustomPrompt] = useState(defaultPrompt);
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const { toast } = useToast();
 





  const addMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
    setDetailMessages(prevMessages => [...prevMessages, message]);
  };

  const addDetailMessage = (detailMessages) => {
    setDetailMessages(prevMessages => [...prevMessages, detailMessages]);
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setMessages([]);
    setDetailMessages([]);
    setCreatedEventsCount(0);
    setDeletedEventsCount(0);
    try {
      addMessage("Starting analysis with Gemini AI...");
      const jsonData = await analyzeWithGemini(liveStreamText, useCustomPrompt ? customPrompt : undefined);
      addMessage("Gemini AI analysis complete. Creating calendar events...");
      addDetailMessage(`Gemini JSON: \n\n${JSON.stringify(jsonData, null, 2)}`);

      try {
        var events = await createCalendarEvent(jsonData);
        setDeletedEventsCount(events.deleted);
        setCreatedEventsCount(events.inserted);
        addMessage(`Successfully created ${events.inserted} calendar events!`);
        toast({
          title: "Events Created",
          description: `${events.inserted} basketball events have been added to your Google Calendar.`,
        });
      } catch (error) {
        console.error('Google Calendar API Error:', error);
        addMessage(`Error creating calendar events: ${error.message}`);
        toast({
          title: "Calendar Error",
          description: `Failed to create events: ${error.message}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      addMessage(`Error during analysis: ${error.message}`);
      toast({
        title: "Analysis Error",
        description: `Failed to analyze: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleData = () => {
    setLiveStreamText(sampleData);
  };

  const handlePromptData = () => {
    setCustomPrompt(defaultPrompt);
    setUseCustomPrompt(true);
  };

  const saveTextFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenGoogleCalendaar = () => {
    const calendarId = localStorage.getItem('REACT_APP_GOOGLE_CALENDAR_ID');
    console.log(calendarId);
    window.open('https://calendar.google.com/calendar/embed?src=' + calendarId, '_blank');

  };

  const handleSavePrompt = () => {
    saveTextFile("Input text: \n\n" + liveStreamText + '\n\n------------\n Prompt: \n\n' + 
      customPrompt, 'custom_prompt.txt');
  };

  const handleSaveCalendarResults = () => {
    saveTextFile(detailMessages.join('\n'), 'calendar_results.txt');
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={liveStreamText}
        onChange={(e) => setLiveStreamText(e.target.value)}
        placeholder="Enter basketball live stream text here..."
        rows={10}
        className="w-full"
      />
      <div className="flex flex-wrap items-center space-x-2 space-y-2 sm:space-y-0">
        <Checkbox
          id="show-output"
          checked={showOutputDetails}
          onCheckedChange={setShowOutputDetails}
        />
        <Label htmlFor="show-output">Show output details</Label>
        <Button onClick={handleSampleData} variant="outline" size="sm">
          Sample Data
        </Button>
        <Button onClick={handlePromptData} variant="outline" size="sm">
          Prompt
        </Button>
        <Button
               onClick={handleOpenGoogleCalendaar}
            variant="outline"
            size="sm">
            Google Calendar <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>
      {useCustomPrompt && (
        <Textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Enter custom prompt here..."
          rows={10}
          className="w-full"
        />
      )}
      <div className="flex flex-wrap items-center space-x-2 space-y-2 sm:space-y-0">
        <Button
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze and Create Event'}
        </Button>
        <HelpDialog />
      </div>
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-bold mb-2">Info:</h3>
          <pre className="whitespace-pre-wrap text-xs">Existing calendar entires with the same title on the same data are deleted before created the new entry.
          </pre>         
      </div>
      <div className={`mt-4 p-4 rounded ${messages.length > 0 ? (createdEventsCount > 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900') : ''}`}>
        {messages.map((message, index) => (
          <p key={index} className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
        ))}
         {deletedEventsCount > 0 && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            Total events delete: {deletedEventsCount}
          </p>
        )}
         {createdEventsCount > 0 && (
          <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-2">
            Total events created: {createdEventsCount}
          </p>
        )}
      </div>
      {showOutputDetails && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-bold mb-2">Debug Output:</h3>
          <pre className="whitespace-pre-wrap text-xs">{detailMessages.join('\n')}</pre>
          <div className="mt-4 flex space-x-2">
            <Button onClick={handleSavePrompt} variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" /> Save Prompt
            </Button>
            <Button onClick={handleSaveCalendarResults} variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" /> Save Calendar Results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorPage;
