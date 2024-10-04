import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CreatorPage from './CreatorPage';
// Lazy load the ConfigurationPage component
const ConfigurationPage = lazy(() => import('./ConfigurationPage'));
import { Button } from "@/components/ui/button";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import HelpDialog from './HelpDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { version } from '@/utils/version';

const Copyright = () => (
  <div className="text-sm text-gray-600 dark:text-gray-400 mr-4">
    <span>Created 2024 <svg className="h-8 w-8 text-orange-500 inline" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4" />  <line x1="14.5" y1="5.5" x2="18.5" y2="9.5" />  <polyline points="12 8 7 3 3 7 8 12" />  <line x1="7" y1="8" x2="5.5" y2="9.5" />  <polyline points="16 12 21 17 17 21 12 16" />  <line x1="16" y1="17" x2="14.5" y2="18.5" /></svg>  <a href="https://d-oit.github.io" className="underline hover:text-gray-800 dark:hover:text-gray-200">d.o.it</a> <HelpDialog /> </span>
  </div>
);

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState('system');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      setTheme(savedTheme);
    }
  }, [setTheme]);

  const handleThemeChange = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'system' : 'light';
    setCurrentTheme(newTheme);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleThemeChange}
            className="w-9 h-9 bg-white dark:bg-gray-800"
          >
            {currentTheme === 'light' && <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />}
            {currentTheme === 'dark' && <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />}
            {currentTheme === 'system' && <Laptop className="h-[1.2rem] w-[1.2rem]" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch and save mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full z-30 md:bg-opacity-90 transition duration-300 ease-in-out bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex-shrink-0 mr-4">
              <img className="w-8 h-8 rounded" src="/images/logo.jpg" alt="prompt2cal logo" />
            </div>
            <div className="flex-grow text-center">
              <h1 className="text-2xl font-bold">Prompt2Cal</h1>
            </div>
            <nav className="flex items-center">
              <ul className="flex flex-wrap items-center">
                <li>
                  <ThemeToggle />
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-8">
          <Accordion type="single" collapsible defaultValue="creator">
            <AccordionItem value="creator">
              <AccordionTrigger>Basketball live streams Input</AccordionTrigger>
              <AccordionContent>
                <CreatorPage />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="configuration">
              <AccordionTrigger>Configuration</AccordionTrigger>
              <AccordionContent>
                <Suspense fallback={<div>Loading...</div>}>
                  <ConfigurationPage />
                </Suspense>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
      <footer className="bg-gray-100 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="md:flex md:items-center md:justify-between py-4 md:py-8 border-t border-gray-200 dark:border-gray-700">
            <Copyright /> | Version: {version}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;