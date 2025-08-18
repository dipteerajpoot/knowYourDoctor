import cors from "cors";
import mongoose from "mongoose";
import bodyparser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import doctorRoute from "./router/doctor.route.js";
import patientRoute from "./router/patient.router.js";
import postRoute from "./router/post.router.js"
import appintmentRouter from "./router/appointment.router.js";
import cookieParser from "cookie-parser";

const app = express();

mongoose.connect(process.env.DB_URL)
    .then(() => {
        app.use(cors(
        {
            origin:"http://localhost:3001",
            credentials:true
        }
        ));
        app.use(bodyparser.json());
        app.use(bodyparser.urlencoded({ extended: true }));
        app.use(cookieParser())
        app.use(express.static("public"));
        app.use("/doctor", doctorRoute)
        app.use("/patient", patientRoute);
        app.use("/post", postRoute);
        app.use("/aptmt", appintmentRouter);

        app.listen(process.env.PORT, () => {
            console.log("server started");
        })
    })
    .catch((err) => {
        console.log(" Database connection Error Error :", err);
    })


