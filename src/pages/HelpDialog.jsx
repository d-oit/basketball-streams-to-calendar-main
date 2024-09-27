import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle, AlertTriangle } from 'lucide-react';
import { version } from '@/utils/version';

const HelpDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] h-[80vh]">
        <ScrollArea>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold"><img src="/images/logo.jpg" alt="app logo" className="w-16 h-16 rounded inline" /> Help</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="text-center">
              <h2 className="font-semibold">Basketball live streams prompt google calendar creator</h2>
              <p>App Version: {version}</p>
              <div className="max-w-3xl mx-auto">
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Create calendar events from basketball live stream data using AI-powered analysis.</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold">Basketball Live Stream Input</h3>
            <p>Enter the basketball live stream text in the provided textarea. You can use the 'Sample Data' button to populate the field with example data.</p>

            <h3 className="font-semibold mt-4">Analyze and Create Event</h3>
            <p>Click this button to analyze the input text using Gemini AI and create corresponding events in your Google Calendar.</p>

            <h3 className="font-semibold mt-4">Configuration</h3>
            <p>Set up your API keys and Calendar ID in the Configuration section.</p>
  <div className="flex items-center">
    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 002 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
    </svg>
    <p className="font-bold">IMPORTANT</p>
  </div>
  <p>This is a crucial piece of information that users need to be aware of.</p>

            <h3 className="font-semibold mt-4">Import / Export configuration</h3>
            <p>You can export your current configuration as a JSON file using the 'Export' button. To import a previously saved configuration, use the 'Import' button and select the JSON file. The page will refresh after a successful import.</p>

            <h3 className="font-semibold mt-4">Google Calendar</h3>
            <p>Click this button to open your Google Calendar in a new tab. Only available after configuration.</p>

            <section  className='py-6'>
              <h3 className="text-lg font-semibold">Current Functions</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Analyze basketball live stream text using AI</li>
                <li>Extract event details including title, date, time, and location</li>
                <li>Create Google Calendar events automatically</li>
                <li>Customize AI prompt for analysis</li>
                <li>Save custom prompts and analysis results</li>
                <li>Toggle between light, dark, and system themes</li>
                <li>Fully responsive design for mobile and desktop use</li>
                <li>PWA support for installation on devices</li>
              </ul>
            </section>

            <section className='py-6'>
              <h3 className="text-lg font-semibold">PWA Features</h3>
              <p>This app is a Progressive Web App (PWA), which means you can install it on your device for offline use and a native app-like experience.</p>
            </section>

            <section  className='py-6'>
              <h3 className="text-lg font-semibold">Saving Data</h3>
              <p>In the 'Output Details' section, you can save the custom prompt and calendar results as text files using the dedicated save buttons.</p>
            </section>

            <section className='py-6'>
              <h3 className="text-lg font-semibold">Disclaimer</h3>
              <p className="flex items-start mt-4 text-sm text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="mr-2 h-4 w-4 mt-1 flex-shrink-0" />
                The use of this application is at your own risk. The application is provided "as is" without any warranties, express or implied. The developers and distributors of this application shall not be held liable for any damages arising from the use or inability to use the application, including but not limited to direct, indirect, incidental, punitive, and consequential damages.
              </p>
            </section>
          </div>
        <footer className="bg-gray-100 dark:bg-gray-800 mt-6 py-6">
  <div className="max-w-6xl mx-auto px-2 sm:px-6">
    <div className="md:flex md:items-center md:justify-between">
      <small>
        <p className="flex items-center">
          <img src="https://avatars.githubusercontent.com/u/6849456" alt="app logo" className="w-8 h-8 inline rounded mr-2" />
          
          <a href="https://github.com/d-oit" target="_blank" className="underline hover:text-gray-800 dark:hover:text-gray-200 ml-2">Drop a line</a>
        </p>
      </small>
    </div>
  </div>
</footer>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;