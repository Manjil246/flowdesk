import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminLayoutRoute from "@/components/auth/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";
import CategoriesPage from "@/pages/CategoriesPage";
import ProductsPage from "@/pages/ProductsPage";
import ProductNewPage from "@/pages/ProductNewPage";
import ProductEditPage from "@/pages/ProductEditPage";
import OrdersPage from "@/pages/OrdersPage";
import OrderNewPage from "@/pages/OrderNewPage";
import OrderDetailPage from "@/pages/OrderDetailPage";
import ContactInquiriesPage from "@/pages/ContactInquiriesPage";
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

          <Route element={<AdminLayoutRoute />}>
            <Route path="/admin" element={<Navigate to="/admin/orders" replace />} />
            <Route path="/admin/dashboard" element={<Navigate to="/admin/orders" replace />} />
            <Route path="/admin/conversations" element={<Navigate to="/admin/orders" replace />} />
            <Route path="/admin/leads" element={<Navigate to="/admin/orders" replace />} />
            <Route path="/admin/campaigns" element={<Navigate to="/admin/orders" replace />} />
            <Route path="/admin/bot-settings" element={<Navigate to="/admin/orders" replace />} />
            <Route path="/admin/settings" element={<Navigate to="/admin/orders" replace />} />
            <Route path="/admin/categories" element={<CategoriesPage />} />
            <Route path="/admin/products" element={<ProductsPage />} />
            <Route path="/admin/products/new" element={<ProductNewPage />} />
            <Route path="/admin/products/:productId" element={<ProductEditPage />} />
            <Route path="/admin/orders" element={<OrdersPage />} />
            <Route path="/admin/orders/new" element={<OrderNewPage />} />
            <Route path="/admin/orders/:orderId" element={<OrderDetailPage />} />
            <Route path="/admin/contact" element={<ContactInquiriesPage />} />
            <Route path="/admin/*" element={<NotFound />} />
          </Route>

          <Route element={<PublicLayout />}>
            <Route path="/" element={<UserHomePage />} />
            <Route path="/products" element={<UserProductsPage />} />
            <Route path="/products/:productId" element={<UserProductDetailPage />} />
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
