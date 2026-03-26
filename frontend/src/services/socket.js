import { io } from "socket.io-client";
import { getStoredToken } from "../utils/authStorage";

let socket;

function resolveSocketUrl() {
  const explicitSocketUrl = import.meta.env.VITE_SOCKET_URL;

  if (explicitSocketUrl) {
    return explicitSocketUrl;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
  return apiBaseUrl.replace(/\/api\/?$/, "");
}

export function getSocket() {
  if (!socket) {
    socket = io(resolveSocketUrl(), {
      autoConnect: false
    });
  }

  socket.auth = {
    token: getStoredToken()
  };

  return socket;
}

export const socketInstance = getSocket();
export { socketInstance as socket };

export function connectSocket() {
  const activeSocket = getSocket();

  if (!activeSocket.auth?.token) {
    return null;
  }

  if (!activeSocket.connected) {
    activeSocket.connect();
  }

  return activeSocket;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
