import { createServer } from "http";
import app from "./app.js";
import env from "./config/env.js";
import { initializeSocket } from "./socket/socketServer.js";

const server = createServer(app);

initializeSocket(server);

server.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
