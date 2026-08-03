import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/panel")({
  component: () => <Navigate to="/admin" />,
});
