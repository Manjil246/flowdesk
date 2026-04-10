import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import ConversationsPage from "@/pages/ConversationsPage";
import LeadsPage from "@/pages/LeadsPage";
import CampaignsPage from "@/pages/CampaignsPage";
import BotSettingsPage from "@/pages/BotSettingsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
          <Route path="/conversations" element={<DashboardLayout><ConversationsPage /></DashboardLayout>} />
          <Route path="/leads" element={<DashboardLayout><LeadsPage /></DashboardLayout>} />
          <Route path="/campaigns" element={<DashboardLayout><CampaignsPage /></DashboardLayout>} />
          <Route path="/bot-settings" element={<DashboardLayout><BotSettingsPage /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
