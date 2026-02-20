import mongoose from "mongoose";
import { DB_NAME } from "../utils/constant.js";
export const dbConnect = async()=>{
    try{
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL is not defined");
        }

        const url = `${process.env.DATABASE_URL}/${DB_NAME}`;
        await mongoose.connect(url, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true
        });
        console.log("Database connected successfully");
    }
    catch(err){
        console.log("Error in connecting mongoDB");
        process.exit(1);
    }
}