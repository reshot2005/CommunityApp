import AppRouter from "../router/AppRouter";
import { AuthProvider } from "../context/AuthContext";
import { NotificationProvider } from "../context/NotificationContext";
import { ToastProvider } from "../context/ToastContext";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <AppRouter />
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
