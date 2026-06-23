import express from "express";
import userRoutes from "@routes/user-route";

const app = express();
const PORT = process.env.PORT ?? 3000;

// express.json() só faz parse do body — não é middleware de validação/auth,
// sem ele req.body chega undefined em POST/PUT.
app.use(express.json());

app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});