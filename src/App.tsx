import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./features/users/UserContext";
import { TicketProvider } from "./features/tickets/TicketContext";
import { AppLayout } from "./components/AppLayout";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { TicketsPage } from "./features/tickets/TicketsPage";
import { TicketDetailPage } from "./features/tickets/TicketDetailPage";
import { NewTicketPage } from "./features/tickets/NewTicketPage";

export function App() {
  return (
    <UserProvider>
      <TicketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="tickets/new" element={<NewTicketPage />} />
              <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TicketProvider>
    </UserProvider>
  );
}

export default App;
