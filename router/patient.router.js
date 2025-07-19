import express from "express";
import {body} from "express-validator";
import {signUpPatient , verifyAccount} from "../controller/patient.controller.js";
const router = express.Router();

router.post("/signUpPatient",
    body("name","name is required").notEmpty(),
        body("name", "Only Alphabets are allowed").isAlpha(),
        body("email","email is required ").notEmpty(),
        body("email", "invalid email id").isEmail(),
        body("password", "password is required").notEmpty(),
        body("password","password is between 8 to 10 charctor").isLength({ min: 8, max: 10 }),
        body("role","role is required").isAlpha(),signUpPatient
    );

router.post("/verification", verifyAccount);

export default router;  
