import { createBrowserRouter, RouterProvider } from "react-router"; // Fixed typo "form" to "from"
import App from "../App";
import Home from "../pages/Home";
import Feedback from "../pages/Feedback";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/feedback",
        element: <Feedback />,
      },
    ],
  },
]);
