import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle } from 'lucide-react';

const ConfigurationPage = () => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [googleCalendarId, setGoogleCalendarId] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setGeminiApiKey(localStorage.getItem('REACT_APP_GEMINI_API_KEY') || '');
    setGoogleClientId(localStorage.getItem('REACT_APP_GOOGLE_CLIENT_ID') || '');
    setGoogleApiKey(localStorage.getItem('REACT_APP_GOOGLE_API_KEY') || '');
    setGoogleCalendarId(localStorage.getItem('REACT_APP_GOOGLE_CALENDAR_ID') || '');
  }, []);

  const handleSave = () => {
    localStorage.setItem('REACT_APP_GEMINI_API_KEY', geminiApiKey);
    localStorage.setItem('REACT_APP_GOOGLE_CLIENT_ID', googleClientId);
    localStorage.setItem('REACT_APP_GOOGLE_API_KEY', googleApiKey);
    localStorage.setItem('REACT_APP_GOOGLE_CALENDAR_ID', googleCalendarId);

    toast({
      title: "Configuration Saved",
      description: "Your API keys have been saved successfully.",
    });
  };

  const handleExport = () => {
    const config = {
      REACT_APP_GEMINI_API_KEY: localStorage.getItem('REACT_APP_GEMINI_API_KEY'),
      REACT_APP_GOOGLE_CLIENT_ID: localStorage.getItem('REACT_APP_GOOGLE_CLIENT_ID'),
      REACT_APP_GOOGLE_API_KEY: localStorage.getItem('REACT_APP_GOOGLE_API_KEY'),
      REACT_APP_GOOGLE_CALENDAR_ID: localStorage.getItem('REACT_APP_GOOGLE_CALENDAR_ID'),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt2cal_config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result);
          Object.entries(config).forEach(([key, value]) => {
            localStorage.setItem(key, value);
          });
          toast({
            title: "Configuration Imported",
            description: "Your configuration has been imported successfully. The page will refresh.",
          });
          setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
          toast({
            title: "Import Error",
            description: "Failed to import configuration. Please check the file format.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="gemini-api-key">Gemini API Key</Label>
        <Input
          id="gemini-api-key"
          value={geminiApiKey}
          onChange={(e) => setGeminiApiKey(e.target.value)}
          placeholder="Enter your Gemini API Key"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="google-client-id">Google Calendar Client ID</Label>
        <Input
          id="google-client-id"
          value={googleClientId}
          onChange={(e) => setGoogleClientId(e.target.value)}
          placeholder="Enter your Google Client ID"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="google-api-key">Google Calendar API Key</Label>
        <Input
          id="google-api-key"
          value={googleApiKey}
          onChange={(e) => setGoogleApiKey(e.target.value)}
          placeholder="Enter your Google API Key"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="google-calendar-id">Google Calendar Id</Label>
        <Input
          id="google-calendar-id"
          value={googleCalendarId}
          onChange={(e) => setGoogleCalendarId(e.target.value)}
          placeholder="Enter your Google Calendar ID"
        />
      </div>
      <Button onClick={handleSave}>
        Save Configuration
      </Button>
      <p className="text-sm text-gray-500 mt-2">
        Save the configuration to the Browser localStorage.
      </p>
      <div className="flex space-x-2 mt-4">
        <Button onClick={handleExport} variant="outline">
          Export
        </Button>
        <Button onClick={() => document.getElementById('import-input').click()} variant="outline">
          Import
        </Button>
        <input
          id="import-input"
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </div>
      <p className="flex items-start mt-4 text-sm text-yellow-600 dark:text-yellow-400">
        <AlertTriangle className="mr-2 h-4 w-4 mt-1 flex-shrink-0" />
        The use of this application is at your own risk. The application is provided "as is" without any warranties, express or implied. The developers and distributors of this application shall not be held liable for any damages arising from the use or inability to use the application, including but not limited to direct, indirect, incidental, punitive, and consequential damages.
      </p>
    </div>
  );
};

export default ConfigurationPage;