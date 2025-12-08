import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import AppLayout from "./components/layout/AppLayout";

import Dashboard from "./pages/Dashboard";
import FilesPage from "./pages/FilesPage";
import ChatPage from "./pages/ChatPage";
import UsersPage from "./pages/UsersPage";
import LogsPage from "./pages/LogsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Child pages */}
          <Route index element={<Dashboard />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
