import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getStoredToken } from "../utils/authStorage";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const token = user?.token || getStoredToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
