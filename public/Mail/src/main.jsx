import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import { MailProvider } from "./context/MailContext";
import { UIProvider } from "./context/UIContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/mail">
      <ThemeProvider>
        <UIProvider>
          <MailProvider>
            <App />
          </MailProvider>
        </UIProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
