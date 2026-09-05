import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./features/users/UserContext";
import { AppLayout } from "./components/AppLayout";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { TicketsPage } from "./features/tickets/TicketsPage";

export function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route
              path="tickets/new"
              element={
                <div className="p-4 text-gray-700 font-medium">
                  New Ticket Page Placeholder
                </div>
              }
            />
            <Route
              path="tickets/:ticketId"
              element={
                <div className="p-4 text-gray-700 font-medium">
                  Ticket Detail Placeholder
                </div>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
