import React, { useState } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import ErrorBoundary from './components/ErrorBoundary'; // Adjust the path as needed
import { GoogleOAuthProvider  } from '@react-oauth/google'; // Import GoogleOAuthProvider


const queryClient = new QueryClient();

const App = () => {
  const [clientId, setClientId] = useState(localStorage.getItem('REACT_APP_GOOGLE_CLIENT_ID') || null);

  const updateClientId = (newClientId) => {
    setClientId(newClientId);
    localStorage.setItem('REACT_APP_GOOGLE_CLIENT_ID', newClientId);
  };

  return (
  <ErrorBoundary>
 <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
   
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
            <BrowserRouter>
             
                <Routes>
                  <Route path="/" element={<Index />} />
                </Routes>
            
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </GoogleOAuthProvider>
  </ErrorBoundary>
  );
};

export default App;
