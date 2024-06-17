import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import dotenv from "dotenv";
import routes from "./routes/index.js";

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

app.use("/", routes);

dbConnection();
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
