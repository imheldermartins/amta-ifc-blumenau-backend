import HttpServer from "@core/http/http-server";
import authRouter from "@/core/auth/auth-router";
import userRouter from "@routes/user-route";

const server = new HttpServer([
  { path: "/users", router: userRouter },
  { path: "/auth", router: authRouter },
]);

// Ponto de extensão pra middleware global (logging, etc.) -- chame antes de start():
// server.use(someMiddleware);

server.start();