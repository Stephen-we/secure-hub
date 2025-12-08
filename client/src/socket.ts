import { io } from "socket.io-client";

const API_URL = "http://localhost:5000";

export const createSocket = (token: string) => {
  return io(API_URL, {
    auth: { token },
  });
};
