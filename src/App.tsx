import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.tsx";
import Login from "./pages/Login.tsx";
import WorkStudy from "./pages/WorkStudy.tsx";
import Home from "./pages/Home.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // List all your individual pages here:
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "workstudy", element: <WorkStudy /> },
      { path: "*", element: <div>404: Not Found</div> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
