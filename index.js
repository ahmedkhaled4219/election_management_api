import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import dotenv from "dotenv";
import routes from "./routes/index.js";
dotenv.config();

const app = express();
app.use(express.json());
const port = 3000;

app.use("/", routes);
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const response = {
      status: 'error',
      message: error.message || 'Internal Server Error',
  };

  res.status(statusCode).json(response);
});

dbConnection();
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
