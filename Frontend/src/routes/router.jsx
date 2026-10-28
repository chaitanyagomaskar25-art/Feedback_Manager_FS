import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Feedback from "../pages/Feedback";
import Auth from "../pages/Auth";
import Users from "../pages/Users";
import RequireAuth from "../auth/RequireAuth";

const protectedPage = (element, roles) => (
  <RequireAuth roles={roles}>{element}</RequireAuth>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: protectedPage(<Home />),
      },
      {
        path: "feedback",
        element: protectedPage(<Feedback />),
      },
      { path: "login", element: <Auth mode="login" /> },
      { path: "register", element: <Auth mode="register" /> },
      { path: "users", element: protectedPage(<Users />, ["admin"]) },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
], {
  future: { v7_startTransition: true },
});
