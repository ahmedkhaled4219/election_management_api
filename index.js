import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import dotenv from "dotenv";
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
dotenv.config();
dbConnection();
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
