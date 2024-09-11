import { HomeIcon, CalendarIcon, SettingsIcon } from "lucide-react";
import CreatorPage from "./pages/CreatorPage.jsx";
import ConfigurationPage from "./pages/ConfigurationPage.jsx";

export const navItems = [
  {
    title: "Creator",
    to: "/creator",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <CreatorPage />,
  },
  {
    title: "Configuration",
    to: "/configuration",
    icon: <SettingsIcon className="h-4 w-4" />,
    page: <ConfigurationPage />,
  },
];