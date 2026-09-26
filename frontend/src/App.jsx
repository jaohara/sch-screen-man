import { Routes, Route } from "react-router";

import Layout from './layouts/Layout.jsx';
import DashboardPage from './pages/DashboardPage/DashboardPage.jsx';
import ContentPage from './pages/ContentPage/ContentPage.jsx';
import SchedulePage from './pages/SchedulePage/SchedulePage.jsx';
import SettingsPage from './pages/SettingsPage/SettingsPage.jsx';
import ComponentPage from "./pages/ComponentPage/ComponentPage.jsx";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="content" element={<ContentPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="components" element={<ComponentPage />} />
      </Route>
    </Routes>
  );
}

export default App;
