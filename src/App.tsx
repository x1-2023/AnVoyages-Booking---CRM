import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { SettingsProvider } from "./contexts/SettingsContext";
import { LocalePreferencesProvider } from "./contexts/LocalePreferencesContext";
import Index from "./pages/Index";
import PropertyDetail from "./pages/PropertyDetail";
import DestinationPage from "./pages/DestinationPage";
import PropertiesPage from "./pages/PropertiesPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentErrorPage from "./pages/PaymentErrorPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";
import PaymentCheckoutPage from "./pages/PaymentCheckoutPage";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/Settings";
import AdminBookings from "./pages/admin/Bookings";
import AdminProperties from "./pages/admin/Properties";
import AdminLocations from "./pages/admin/Locations";
import AdminLeads from "./pages/admin/Leads";
import AdminCustomers from "./pages/admin/Customers";
import AdminSuppliers from "./pages/admin/Suppliers";
import AdminReports from "./pages/admin/Reports";
import AdminIntegrations from "./pages/admin/Integrations";
import AdminBlog from "./pages/admin/Blog";
import BlogPostForm from "./pages/admin/BlogPostForm";
import AdminLogin from "./pages/admin/Login";
import LocationForm from "./pages/admin/LocationForm";
import PropertyForm from "./pages/admin/PropertyForm";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import PublicBottomNav from "./components/PublicBottomNav";
import PublicRouteTransition from "./components/PublicRouteTransition";
import LocalePreferenceDialog from "./components/LocalePreferenceDialog";

const queryClient = new QueryClient();

const publicPage = (element: JSX.Element) => (
  <PublicRouteTransition>{element}</PublicRouteTransition>
);

const AppRoutes = () => {
  const location = useLocation();
  const routeKey = location.pathname.startsWith('/admin') ? 'admin' : location.pathname;

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={routeKey}>
          <Route path="/" element={publicPage(<Index />)} />
          <Route path="/property/:id" element={publicPage(<PropertyDetail />)} />
          <Route path="/destinations/:id" element={publicPage(<DestinationPage />)} />
          <Route path="/destinations" element={publicPage(<DestinationPage />)} />
          <Route path="/properties" element={publicPage(<PropertiesPage />)} />
          <Route path="/contact" element={publicPage(<ContactPage />)} />
          <Route path="/blog" element={publicPage(<BlogPage />)} />
          <Route path="/blog/:slug" element={publicPage(<BlogPostPage />)} />
          <Route path="/payment/success" element={publicPage(<PaymentSuccessPage />)} />
          <Route path="/payment/success/:bookingCode" element={publicPage(<PaymentSuccessPage />)} />
          <Route path="/payment/error" element={publicPage(<PaymentErrorPage />)} />
          <Route path="/payment/error/:bookingCode" element={publicPage(<PaymentErrorPage />)} />
          <Route path="/payment/cancel" element={publicPage(<PaymentCancelPage />)} />
          <Route path="/payment/cancel/:bookingCode" element={publicPage(<PaymentCancelPage />)} />
          <Route path="/payment/checkout/:bookingId" element={publicPage(<PaymentCheckoutPage />)} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="properties/new" element={<PropertyForm />} />
            <Route path="properties/:id/edit" element={<PropertyForm />} />
            <Route path="locations" element={<AdminLocations />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="suppliers" element={<AdminSuppliers />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="integrations" element={<AdminIntegrations />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="blog/new" element={<BlogPostForm />} />
            <Route path="blog/:id/edit" element={<BlogPostForm />} />
            <Route path="locations/new" element={<LocationForm />} />
            <Route path="locations/:id/edit" element={<LocationForm />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={publicPage(<NotFound />)} />
        </Routes>
      </AnimatePresence>
      <PublicBottomNav />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <LocalePreferencesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
            <LocalePreferenceDialog />
          </BrowserRouter>
        </TooltipProvider>
      </LocalePreferencesProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
