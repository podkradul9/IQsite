import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

// В превью-сборке (vite build --mode artifact) адреса вида /#/test/iq-full,
// на обычном хостинге — нормальные /test/iq-full.
const Router = import.meta.env.MODE === "artifact" ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);
