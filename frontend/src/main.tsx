import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.js";
import { AppProvider } from "./providers/index.js";

// Bootstrap 5 CSS + JS (npm packages — works offline & in dev)
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Bootstrap Icons
import "bootstrap-icons/font/bootstrap-icons.css";

// Toast styles
import "react-toastify/dist/ReactToastify.css";

// Custom design system (must come AFTER bootstrap to override)
import "./App.css";

createRoot(document.getElementById("root")!).render(
  <Router>
    <AppProvider>
      <App />
    </AppProvider>
  </Router>
);
