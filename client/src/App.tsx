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
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";
import CategoriesPage from "@/pages/CategoriesPage";
import ProductsPage from "@/pages/ProductsPage";
import ProductNewPage from "@/pages/ProductNewPage";
import ProductEditPage from "@/pages/ProductEditPage";
import OrdersPage from "@/pages/OrdersPage";
import OrderDetailPage from "@/pages/OrderDetailPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-right" richColors closeButton visibleToasts={3} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
          <Route path="/conversations" element={<DashboardLayout><ConversationsPage /></DashboardLayout>} />
          <Route path="/leads" element={<DashboardLayout><LeadsPage /></DashboardLayout>} />
          <Route path="/campaigns" element={<DashboardLayout><CampaignsPage /></DashboardLayout>} />
          <Route path="/bot-settings" element={<DashboardLayout><BotSettingsPage /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
          <Route path="/categories" element={<DashboardLayout><CategoriesPage /></DashboardLayout>} />
          <Route path="/products" element={<DashboardLayout><ProductsPage /></DashboardLayout>} />
          <Route path="/products/new" element={<DashboardLayout><ProductNewPage /></DashboardLayout>} />
          <Route path="/products/:productId" element={<DashboardLayout><ProductEditPage /></DashboardLayout>} />
          <Route path="/orders" element={<DashboardLayout><OrdersPage /></DashboardLayout>} />
          <Route path="/orders/:orderId" element={<DashboardLayout><OrderDetailPage /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;