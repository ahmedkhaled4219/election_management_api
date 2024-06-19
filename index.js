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
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map(err => err.message).join(', ');
  }

  if (error.code && error.code === 11000) {
    statusCode = 400;
    const field = Object.keys(error.keyValue);
    message = `${field} already exists.`;
  }

  res.status(statusCode).json(message);
});

dbConnection();
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
