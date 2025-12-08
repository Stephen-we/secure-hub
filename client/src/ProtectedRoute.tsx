import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: any) {
  const token = localStorage.getItem("securehub_token");
  return token ? children : <Navigate to="/login" />;
}
