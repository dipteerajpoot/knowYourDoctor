import { createAppointment,updateAppointment,cancelAppointment,viewAppointments,confirmAppointment,completeAppointment,deleteAppointment ,} from "../controller/appointment.controller.js";
import {auth} from "../middleware/auth.js"
import {body }from "express-validator";
import express from "express";
import multer from "multer";
const upload = multer({dest:"public/doctorProfile"})
const router = express.Router();
router.post("/create",
    body("name","name must be string").isAlpha(),
    body("Email","emai is required").notEmpty(),
    body("Email","Valid Email").isEmail(),
    body("apmtDay","Appointment Day required").notEmpty(),
    body("apmtTime","Appointment Time required").notEmpty(),
    body("apmtDate","Date is required").notEmpty(), 
    auth,createAppointment);

router.patch("/update/:id",auth,updateAppointment); //apId
router.patch("/cancel/:id",auth,cancelAppointment);//apId   
router.get("/viewAll",auth,viewAppointments);//apId
router.patch("/confirm/:id",auth,confirmAppointment); //apId
router.patch("/complete/:id",auth,completeAppointment); //apId
router.delete("/delete/:id",auth,deleteAppointment); //apId
export default router;