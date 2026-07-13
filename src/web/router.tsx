import { createBrowserRouter, Navigate } from "react-router-dom";
import { Shell } from "./Shell";
import { BoardPage } from "./pages/BoardPage";
import { SpecsPage } from "./pages/SpecsPage";
import { ChangePage } from "./pages/ChangePage";
import { ArchivePage } from "./pages/ArchivePage";
import { ArchivedPage } from "./pages/ArchivedPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <Navigate to="/board" replace /> },
      { path: "board", element: <BoardPage /> },
      { path: "specs", element: <SpecsPage /> },
      { path: "specs/:capability", element: <SpecsPage /> },
      { path: "changes/:name", element: <ChangePage /> },
      { path: "archive", element: <ArchivePage /> },
      { path: "archive/:id", element: <ArchivedPage /> },
    ],
  },
]);
