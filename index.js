import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import dotenv from "dotenv";
import routes from "./routes/index.js";
dotenv.config();

const app = express();
app.use(express.json());
const port = 3000;

app.use("/", routes);

dbConnection();
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
