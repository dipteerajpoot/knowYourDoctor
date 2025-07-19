import mongoose from "mongoose";
import bodyparser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import doctorRoute from "./router/doctor.route.js";
import patientRoute from "./router/patient.router.js"
import cors from "cors";
const app = express();

mongoose.connect(process.env.DB_URL)
.then(() =>{
    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({extended:true}));
    app.use("/doctor",doctorRoute)
    app.use("/patient",patientRoute);
    app.use(cors({
        origin:"*",
        methods:["GET,POST"]
    }))

    app.listen(process.env.PORT , ()=> {
            console.log("server started");
    })
})
.catch((err) =>{
    
 console.log(" Database connection Error Error :" , err);

})


