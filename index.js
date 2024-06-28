import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import cors from "cors"
dotenv.config();
const app = express();
const port = 3000;

// Configure CORS to allow requests from your Angular application
const corsOptions = {
  origin: 'http://localhost:4200', // Adjust this as needed
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions))
app.use(express.json());
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

   return res.status(statusCode).json(message);
});

dbConnection();
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
