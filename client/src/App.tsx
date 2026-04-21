import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
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
import CartDrawer from "@/user/components/CartDrawer";
import ScrollToTop from "@/user/components/ScrollToTop";
import UserHomePage from "@/user/pages/Index";
import UserProductsPage from "@/user/pages/Products";
import UserProductDetailPage from "@/user/pages/ProductDetail";
import UserAboutPage from "@/user/pages/About";
import UserContactPage from "@/user/pages/Contact";
import UserFaqPage from "@/user/pages/FAQ";
import UserSizeGuidePage from "@/user/pages/SizeGuide";
import UserShippingPolicyPage from "@/user/pages/ShippingPolicy";
import UserTrackOrderPage from "@/user/pages/TrackOrder";
import UserCheckoutPage from "@/user/pages/Checkout";
import UserNotFound from "@/user/pages/NotFound";

const queryClient = new QueryClient();

const PublicLayout = () => (
  <>
    <CartDrawer />
    <Outlet />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-right" richColors closeButton visibleToasts={3} />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
          <Route path="/admin/conversations" element={<DashboardLayout><ConversationsPage /></DashboardLayout>} />
          <Route path="/admin/leads" element={<DashboardLayout><LeadsPage /></DashboardLayout>} />
          <Route path="/admin/campaigns" element={<DashboardLayout><CampaignsPage /></DashboardLayout>} />
          <Route path="/admin/bot-settings" element={<DashboardLayout><BotSettingsPage /></DashboardLayout>} />
          <Route path="/admin/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
          <Route path="/admin/categories" element={<DashboardLayout><CategoriesPage /></DashboardLayout>} />
          <Route path="/admin/products" element={<DashboardLayout><ProductsPage /></DashboardLayout>} />
          <Route path="/admin/products/new" element={<DashboardLayout><ProductNewPage /></DashboardLayout>} />
          <Route path="/admin/products/:productId" element={<DashboardLayout><ProductEditPage /></DashboardLayout>} />
          <Route path="/admin/orders" element={<DashboardLayout><OrdersPage /></DashboardLayout>} />
          <Route path="/admin/orders/:orderId" element={<DashboardLayout><OrderDetailPage /></DashboardLayout>} />
          <Route path="/admin/*" element={<NotFound />} />

          <Route element={<PublicLayout />}>
            <Route path="/" element={<UserHomePage />} />
            <Route path="/products" element={<UserProductsPage />} />
            <Route path="/products/:slug" element={<UserProductDetailPage />} />
            <Route path="/about" element={<UserAboutPage />} />
            <Route path="/contact" element={<UserContactPage />} />
            <Route path="/faq" element={<UserFaqPage />} />
            <Route path="/size-guide" element={<UserSizeGuidePage />} />
            <Route path="/shipping-policy" element={<UserShippingPolicyPage />} />
            <Route path="/track-order" element={<UserTrackOrderPage />} />
            <Route path="/checkout" element={<UserCheckoutPage />} />
          </Route>

          <Route path="*" element={<UserNotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;