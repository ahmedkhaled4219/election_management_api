import mongoose from "mongoose";

function dbConnection() {
    mongoose.set("strictQuery", true);
    mongoose.connect(process.env.DB_CONN)
        .then(() => {
            console.log("Connection to Mongo succeeded :)");
        })
        .catch((error) => {
            console.log("Sorry, an error happened while trying to connect to Mongo:", error);
        });
}

export { dbConnection };
