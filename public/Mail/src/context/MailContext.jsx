import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "../utils/storage";

const MailContext = createContext(null);

const EMPTY_STORAGE_STATS = {
  used: 0,
  total: 15,
  breakdown: [
    { label: "Mail", value: 0, color: "#7C3AED" },
    { label: "Attachments", value: 0, color: "#0EA5E9" },
    { label: "Drafts", value: 0, color: "#F59E0B" },
    { label: "Spam & Trash", value: 0, color: "#EF4444" },
  ],
};

const OLD_KEYS = ["ai-mail-emails", "ai-mail-drafts", "ai-mail-search-history"];
OLD_KEYS.forEach((k) => {
  try {
    localStorage.removeItem(k);
  } catch {
    // ignore
  }
});

export function MailProvider({ children }) {
  const [emails, setEmails] = useState(() => loadFromStorage("ai-mail-emails-v2", []));
  const [contacts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [folders] = useState([]);
  const [attachments] = useState([]);
  const [drafts, setDrafts] = useState(() => loadFromStorage("ai-mail-drafts-v2", []));
  const [spam] = useState([]);
  const [trash, setTrash] = useState([]);
  const [storageStats] = useState(EMPTY_STORAGE_STATS);
  const [searchHistory, setSearchHistory] = useState(() =>
    loadFromStorage("ai-mail-search-history-v2", [])
  );
  const [activities] = useState([]);
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => saveToStorage("ai-mail-emails-v2", emails), [emails]);
  useEffect(() => saveToStorage("ai-mail-drafts-v2", drafts), [drafts]);
  useEffect(() => saveToStorage("ai-mail-search-history-v2", searchHistory), [searchHistory]);

  const toggleStar = (id) =>
    setEmails((prev) => prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m)));

  const togglePin = (id) =>
    setEmails((prev) => prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)));

  const markRead = (id, read = true) =>
    setEmails((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));

  const deleteEmail = (id) => {
    const mail = emails.find((m) => m.id === id);
    if (mail) {
      setTrash((prev) => [
        { id: `trash-${id}`, sender: mail.sender, subject: mail.subject, preview: mail.preview, deletedDate: new Date().toISOString() },
        ...prev,
      ]);
    }
    setEmails((prev) => prev.filter((m) => m.id !== id));
  };

  const archiveEmail = (id) =>
    setEmails((prev) => prev.map((m) => (m.id === id ? { ...m, folder: "archive" } : m)));

  const addSearchTerm = (term) =>
    setSearchHistory((prev) => [term, ...prev.filter((t) => t !== term)].slice(0, 10));

  const unreadCount = useMemo(() => emails.filter((m) => !m.read).length, [emails]);
  const starredEmails = useMemo(() => emails.filter((m) => m.starred), [emails]);
  const pinnedEmails = useMemo(() => emails.filter((m) => m.pinned), [emails]);

  const value = {
    emails, setEmails, contacts, notifications, setNotifications, folders,
    attachments, drafts, setDrafts, spam, trash, setTrash, storageStats,
    searchHistory, addSearchTerm, activities, composeOpen, setComposeOpen,
    toggleStar, togglePin, markRead, deleteEmail, archiveEmail,
    unreadCount, starredEmails, pinnedEmails,
  };

  return <MailContext.Provider value={value}>{children}</MailContext.Provider>;
}

export function useMail() {
  const ctx = useContext(MailContext);
  if (!ctx) throw new Error("useMail must be used within MailProvider");
  return ctx;
}
