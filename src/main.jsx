import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import Login from "./Login.jsx";
import { AuthProvider, useAuth } from "./lib/auth.jsx";
import "./index.css";

function Root() {
  const { ready, isAuthed } = useAuth();
  if (!ready) return null; // avoid flash while restoring session
  return isAuthed ? <App /> : <Login />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
