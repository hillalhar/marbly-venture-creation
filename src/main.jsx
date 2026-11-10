import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import Login from "./Login.jsx";
import { AuthProvider, useAuth } from "./lib/auth.jsx";
import { CartProvider } from "./lib/cart.jsx";
import { FridgeProvider } from "./lib/fridge.jsx";
import { FavoritesProvider } from "./lib/favorites.jsx";
import { ToastProvider } from "./lib/toast.jsx";
import "./index.css";

function Root() {
  const { isAuthed } = useAuth();
  return isAuthed ? <App /> : <Login />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <FridgeProvider>
              <FavoritesProvider>
                <Root />
              </FavoritesProvider>
            </FridgeProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
