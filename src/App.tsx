import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./features/users/UserContext";
import { UsersProvider } from "./features/users/UsersProvider";
import { TicketProvider } from "./features/tickets/TicketContext";
import { NotificationsProvider } from "./features/notifications/NotificationsProvider";
import { NotificationsPage } from "./features/notifications/NotificationsPage";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./features/auth/LoginPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { TicketsPage } from "./features/tickets/TicketsPage";
import { TicketDetailPage } from "./features/tickets/TicketDetailPage";
import { NewTicketPage } from "./features/tickets/NewTicketPage";
import { CustomerDetailPage } from "./features/customers/CustomerDetailPage";
import { AccountPage } from "./features/account/AccountPage";
import { UsersPage } from "./features/users/UsersPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// Analytics uses a chart library (recharts) which is only bundled when visited.
const AnalyticsPage = lazy(() =>
  import("./features/analytics/AnalyticsPage").then((m) => ({
    default: m.AnalyticsPage,
  })),
);

function RouteFallback() {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-12 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="mt-3 text-sm text-gray-500">Loading analytics...</p>
    </div>
  );
}

export function App() {
  return (
    <>
      <UserProvider>
        <UsersProvider>
          <TicketProvider>
            <NotificationsProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<AppLayout />}>
                      <Route index element={<DashboardPage />} />
                      <Route path="tickets" element={<TicketsPage />} />
                      <Route path="tickets/new" element={<NewTicketPage />} />
                      <Route
                        path="tickets/:ticketId"
                        element={<TicketDetailPage />}
                      />
                      <Route
                        path="notifications"
                        element={<NotificationsPage />}
                      />
                      <Route path="account" element={<AccountPage />} />
                      <Route path="users" element={<UsersPage />} />
                      <Route
                        path="analytics"
                        element={
                          <Suspense fallback={<RouteFallback />}>
                            <AnalyticsPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="customers/:customerId"
                        element={<CustomerDetailPage />}
                      />
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                  </Route>
                </Routes>
              </BrowserRouter>
            </NotificationsProvider>
          </TicketProvider>
        </UsersProvider>
      </UserProvider>
    </>
  );
}

export default App;
