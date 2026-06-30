import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import MailDetails from "./pages/MailDetails";
import Folders from "./pages/Folders";
import FolderDetail from "./pages/FolderDetail";
import SearchPage from "./pages/SearchPage";
import Contacts from "./pages/Contacts";
import Attachments from "./pages/Attachments";
import Notifications from "./pages/Notifications";
import SecurityCenter from "./pages/SecurityCenter";
import Settings from "./pages/Settings";
import Drafts from "./pages/Drafts";
import Trash from "./pages/Trash";
import Spam from "./pages/Spam";
import Storage from "./pages/Storage";
import Starred from "./pages/Starred";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/mail/:id" element={<MailDetails />} />
        <Route path="/folders" element={<Folders />} />
        <Route path="/folders/:folderId" element={<FolderDetail />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/attachments" element={<Attachments />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/security" element={<SecurityCenter />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/drafts" element={<Drafts />} />
        <Route path="/trash" element={<Trash />} />
        <Route path="/spam" element={<Spam />} />
        <Route path="/storage" element={<Storage />} />
        <Route path="/starred" element={<Starred />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
