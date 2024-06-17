import mongoose from "mongoose";


function dbConnection() {
    mongoose.set("strictQuery",true);
    mongoose.connect(process.env.DB_CONN).then(()=>{
        console.log("connection to mongo succeed :) ");
    }).catch(
        console.log("sorry an error heppen while you are tying to connect to mongo")
    )
}
export {dbConnection};